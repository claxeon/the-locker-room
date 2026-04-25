/**
 * SignupPage — The Locker Room
 *
 * Two-step verification flow:
 *   Step 1 (automated): Supabase Auth hook rejects non-.edu emails at the server.
 *   Step 2 (manual):    An admin reviews the roster_submissions row and flips
 *                       verification_status to "approved" before the user can post.
 *
 * After a successful signUp() call this page:
 *   1. Inserts a roster_submissions row with the evidence and metadata.
 *   2. Updates the profile row with school_id if a school was selected.
 *   3. Switches to a confirmation screen explaining both verification steps.
 */

import React, { useState, FormEvent, ChangeEvent, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { supabase } from "../../lib/supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FormState {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  sport: string;
  gender: string;
  graduationYear: string;
  rosterEvidence: string;
}

interface SchoolResult {
  school_id: number;
  institution_name: string;
  state_cd: string;
  classification_name: string;
}

const INITIAL_FORM: FormState = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  sport: "",
  gender: "",
  graduationYear: "",
  rosterEvidence: "",
};

const GENDER_OPTIONS = [
  { value: "", label: "Select gender division…" },
  { value: "Mens", label: "Men's" },
  { value: "Womens", label: "Women's" },
  { value: "Mixed", label: "Mixed" },
  { value: "Coed", label: "Co-ed" },
];

const CURRENT_YEAR = new Date().getFullYear();
const GRAD_YEARS = Array.from({ length: 7 }, (_, i) => CURRENT_YEAR + i - 1).filter(
  (y) => y >= 2024
);

// ---------------------------------------------------------------------------
// Shared field styles — mirrors the dark design system used across TLR
// ---------------------------------------------------------------------------

const INPUT_BASE =
  "w-full bg-black border border-white/20 rounded text-white placeholder-white/30 px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-500 transition-colors";

const LABEL_BASE =
  "block text-xs font-semibold uppercase tracking-widest text-white/60 mb-1.5";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SignupPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState("");

  // ── School autocomplete state ─────────────────────────────────────────────
  const [schoolQuery, setSchoolQuery] = useState("");
  const [schoolResults, setSchoolResults] = useState<SchoolResult[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [schoolDropdownOpen, setSchoolDropdownOpen] = useState(false);
  const schoolSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced school search
  useEffect(() => {
    if (schoolSearchTimeout.current) {
      clearTimeout(schoolSearchTimeout.current);
    }

    if (schoolQuery.length < 2) {
      setSchoolResults([]);
      setSchoolDropdownOpen(false);
      return;
    }

    schoolSearchTimeout.current = setTimeout(async () => {
      const { data } = await supabase
        .from("schools")
        .select("school_id, institution_name, state_cd, classification_name")
        .ilike("institution_name", `%${schoolQuery}%`)
        .limit(8);

      if (data && data.length > 0) {
        setSchoolResults(data as SchoolResult[]);
        setSchoolDropdownOpen(true);
      } else {
        setSchoolResults([]);
        setSchoolDropdownOpen(false);
      }
    }, 250);

    return () => {
      if (schoolSearchTimeout.current) clearTimeout(schoolSearchTimeout.current);
    };
  }, [schoolQuery]);

  // ── Input change handler
  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error whenever the user edits a field.
    if (error) setError(null);
  }

  // ── Client-side validation
  function validate(): string | null {
    if (!form.fullName.trim()) return "Full name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!form.email.toLowerCase().trim().endsWith(".edu")) {
      return "Only .edu email addresses are permitted. Please use your university email.";
    }
    if (form.password.length < 8)
      return "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword)
      return "Passwords do not match.";
    if (!schoolQuery.trim()) return "School name is required.";
    if (!form.sport.trim()) return "Sport is required.";
    if (!form.gender) return "Please select a gender division.";
    if (!form.graduationYear) return "Graduation year is required.";
    if (!form.rosterEvidence.trim()) return "Please provide roster evidence.";
    return null;
  }

  // ── Submit handler
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      // ── 1. Create the Supabase Auth user.
      //       The validate-edu-email Auth Hook runs server-side before this
      //       completes — it will return a 422 if the email isn't .edu.
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: {
              full_name: form.fullName.trim(),
              school_name: schoolQuery.trim(),
              sport: form.sport.trim(),
              gender: form.gender,
              graduation_year: parseInt(form.graduationYear, 10),
            },
          },
        });

      if (signUpError) {
        // Surface the server error message directly — it may be the hook's
        // ".edu only" message if the client-side check was bypassed.
        throw new Error(signUpError.message);
      }

      const newUser = signUpData?.user;

      if (newUser) {
        // ── 2. Update profile with school_id if a school was selected from autocomplete.
        if (selectedSchoolId) {
          await supabase
            .from("profiles")
            .update({ school_id: selectedSchoolId })
            .eq("id", newUser.id);
        }

        // ── 3. Insert roster_submissions row so the admin can verify later.
        const { error: submissionError } = await supabase
          .from("roster_submissions")
          .insert({
            user_id: newUser.id,
            school_name: schoolQuery.trim(),
            sport: form.sport.trim(),
            gender: form.gender,
            graduation_year: parseInt(form.graduationYear, 10),
            evidence: form.rosterEvidence.trim(),
            status: "pending",
          });

        if (submissionError) {
          // Non-fatal: the auth account was created. Log it and continue.
          console.error(
            "[SignupPage] Failed to insert roster_submissions row:",
            submissionError.message
          );
        }
      }

      // ── 4. Show confirmation screen.
      setSuccessEmail(form.email.trim());
      setSuccess(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success / confirmation screen
  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center space-y-6">
          {/* Trophy icon */}
          <div className="flex justify-center">
            <span className="text-yellow-500 text-6xl">🏆</span>
          </div>

          <h1 className="text-3xl font-black uppercase tracking-widest text-white">
            You're in the queue.
          </h1>

          <div className="space-y-4 text-white/60 text-sm leading-relaxed text-left bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="flex gap-3">
              <span className="text-yellow-500 font-bold text-xs uppercase tracking-widest mt-0.5 shrink-0">
                Step 1
              </span>
              <p>
                <span className="text-white font-semibold">Confirm your email.</span>{" "}
                We've sent a verification link to{" "}
                <span className="text-yellow-500">{successEmail}</span>. Click
                the link to activate your account. Check your spam folder if
                you don't see it within a few minutes.
              </p>
            </div>

            <div className="border-t border-white/10" />

            <div className="flex gap-3">
              <span className="text-yellow-500 font-bold text-xs uppercase tracking-widest mt-0.5 shrink-0">
                Step 2
              </span>
              <p>
                <span className="text-white font-semibold">
                  Wait for roster verification.
                </span>{" "}
                Our team will manually review the evidence you submitted to
                confirm your student-athlete status. This usually takes 1–3
                business days. You'll receive an email once you're approved to
                post reviews.
              </p>
            </div>
          </div>

          <p className="text-white/40 text-xs">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-yellow-500 hover:text-yellow-400 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ── Signup form
  return (
    <div className="min-h-screen bg-black flex items-start justify-center px-4 py-16">
      <div className="max-w-xl w-full space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-yellow-500 text-xs font-bold uppercase tracking-widest">
            The Locker Room
          </p>
          <h1 className="text-4xl font-black uppercase tracking-tight text-white">
            Create account
          </h1>
          <p className="text-white/40 text-sm">
            Verified student-athletes only. All reviews are anonymous.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div
            role="alert"
            className="bg-red-950/60 border border-red-500/40 text-red-300 rounded px-4 py-3 text-sm"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Full name */}
          <div>
            <label htmlFor="fullName" className={LABEL_BASE}>
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Jordan Smith"
              className={INPUT_BASE}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className={LABEL_BASE}>
              University email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="jsmith@university.edu"
              className={INPUT_BASE}
              required
            />
            <p className="mt-1.5 text-xs text-white/30">
              Use your university <span className="text-yellow-500">.edu</span> email — other domains will be rejected.
            </p>
          </div>

          {/* Password */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className={LABEL_BASE}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                className={INPUT_BASE}
                required
                minLength={8}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className={LABEL_BASE}>
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                className={INPUT_BASE}
                required
              />
            </div>
          </div>

          {/* School autocomplete */}
          <div>
            <label htmlFor="schoolSearch" className={LABEL_BASE}>
              Your School
            </label>
            <div className="relative">
              {/* Search icon */}
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <Search className="h-4 w-4 text-white/30" />
              </div>
              <input
                id="schoolSearch"
                type="text"
                autoComplete="off"
                value={schoolQuery}
                onChange={(e) => {
                  setSchoolQuery(e.target.value);
                  // Clear selected school if user edits after picking one
                  if (selectedSchoolId) setSelectedSchoolId(null);
                  if (error) setError(null);
                }}
                onFocus={() => {
                  if (schoolResults.length > 0) setSchoolDropdownOpen(true);
                }}
                onBlur={() => {
                  // Delay to allow onMouseDown on dropdown items to fire first
                  setTimeout(() => setSchoolDropdownOpen(false), 150);
                }}
                placeholder="Search your university…"
                className={`${INPUT_BASE} pl-10`}
              />

              {/* Dropdown */}
              {schoolDropdownOpen && schoolResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-yellow-500/20 bg-gray-950 shadow-xl overflow-hidden">
                  {schoolResults.map((school) => (
                    <button
                      key={school.school_id}
                      type="button"
                      onMouseDown={() => {
                        setSchoolQuery(school.institution_name);
                        setSelectedSchoolId(school.school_id);
                        setSchoolDropdownOpen(false);
                        if (error) setError(null);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-yellow-500/10 transition-colors"
                    >
                      <span className="font-semibold">{school.institution_name}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        {school.state_cd} · {school.classification_name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedSchoolId && (
              <p className="mt-1.5 text-xs text-yellow-500/70">
                ✓ School matched to database
              </p>
            )}
            {schoolQuery.length >= 2 && !selectedSchoolId && schoolResults.length === 0 && !schoolDropdownOpen && (
              <p className="mt-1.5 text-xs text-white/30">
                No matching schools found. You can still type your school name manually.
              </p>
            )}
          </div>

          {/* Sport + Gender + Graduation year */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label htmlFor="sport" className={LABEL_BASE}>
                Sport
              </label>
              <input
                id="sport"
                name="sport"
                type="text"
                value={form.sport}
                onChange={handleChange}
                placeholder="e.g. Basketball"
                className={INPUT_BASE}
                required
              />
            </div>
            <div className="col-span-1">
              <label htmlFor="gender" className={LABEL_BASE}>
                Division
              </label>
              <select
                id="gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={`${INPUT_BASE} cursor-pointer`}
                required
              >
                {GENDER_OPTIONS.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.value === ""}
                    className="bg-black text-white"
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              <label htmlFor="graduationYear" className={LABEL_BASE}>
                Grad year
              </label>
              <select
                id="graduationYear"
                name="graduationYear"
                value={form.graduationYear}
                onChange={handleChange}
                className={`${INPUT_BASE} cursor-pointer`}
                required
              >
                <option value="" disabled className="bg-black text-white">
                  Year…
                </option>
                {GRAD_YEARS.map((y) => (
                  <option key={y} value={String(y)} className="bg-black text-white">
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Roster evidence */}
          <div>
            <label htmlFor="rosterEvidence" className={LABEL_BASE}>
              Roster evidence
            </label>
            <textarea
              id="rosterEvidence"
              name="rosterEvidence"
              rows={4}
              value={form.rosterEvidence}
              onChange={handleChange}
              placeholder="Paste a link to your team roster, your student athlete ID, or any verifiable proof of enrollment on the team."
              className={`${INPUT_BASE} resize-y`}
              required
            />
            <p className="mt-1.5 text-xs text-white/30">
              This is reviewed manually by our team and never shown publicly.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-500/40 disabled:cursor-not-allowed text-black font-black uppercase tracking-widest text-sm py-3 rounded transition-colors"
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-white/30 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-yellow-500 hover:text-yellow-400 transition-colors font-semibold"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
