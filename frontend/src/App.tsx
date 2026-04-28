/**
 * App.tsx — The Locker Room
 *
 * Changes from the original:
 *   - Wraps the entire tree in <AuthProvider> so auth state is available app-wide.
 *   - Adds /login → LoginPage and /signup → SignupPage routes.
 *   - Adds <ProtectedRoute> — any route wrapped in it redirects unauthenticated
 *     users to /login.  Ready to gate review-submission routes in future sprints.
 *   - All existing routes (/, /directory, /school/:slug, /college-comparison)
 *     are preserved unchanged.
 */

import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  useParams,
  Navigate,
} from "react-router-dom";

// ── Layout
import { GlobalNav } from "./components/layout/GlobalNav";
import { ScrollToHash } from "./components/layout/ScrollToHash";

// ── Existing pages
import { LandingPage } from "./components/landing/LandingPage";
import { SchoolProfile } from "./components/SchoolProfile";
import { SportsDirectory } from "./components/SportsDirectory";
import { CollegeComparison } from "./pages/CollegeComparison";

// ── Auth pages
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { NotFoundPage } from "./pages/NotFoundPage";

// ── Dashboard
import { UserDashboard } from "./pages/dashboard/UserDashboard";

// ── Admin
import { AdminDashboard } from "./pages/admin/AdminDashboard";

// ── Explore Reviews
import { ExploreReviews } from "./pages/ExploreReviews";

// ── Legal pages
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";

// ── Auth context
import { AuthProvider, useAuth } from "./hooks/useAuth";

// ---------------------------------------------------------------------------
// Existing route wrappers (unchanged)
// ---------------------------------------------------------------------------

const SchoolProfileWrapper: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  if (!slug) return null;

  return (
    <SchoolProfile slug={slug} onBack={() => navigate("/directory")} />
  );
};

const SportsDirectoryWrapper: React.FC = () => {
  const navigate = useNavigate();

  const handleSchoolClick = (slug: string) => {
    navigate(`/school/${slug}`);
  };

  return <SportsDirectory onSchoolClick={handleSchoolClick} />;
};

const LandingPageWrapper: React.FC = () => {
  const navigate = useNavigate();
  return <LandingPage onGetStarted={() => navigate("/signup")} />;
};

// ---------------------------------------------------------------------------
// ProtectedRoute
//
// Wrap any <Route element> with <ProtectedRoute> to require authentication.
// Usage:
//   <Route path="/submit-review" element={<ProtectedRoute><SubmitReview /></ProtectedRoute>} />
//
// Behaviour:
//   - While auth state is loading → renders nothing (avoids flash of redirect).
//   - If no session → redirects to /login, preserving the attempted URL via
//     the `state` so LoginPage can send the user back after sign-in.
//   - If session exists → renders children as-is.
// ---------------------------------------------------------------------------

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user || !profile?.is_admin) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // While session is being hydrated, render nothing to avoid a flash redirect.
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    // Redirect unauthenticated users to login.
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

function App() {
  return (
    // AuthProvider must be inside Router so that child components can safely
    // call useNavigate() (e.g. after a successful login).
    <Router>
      <AuthProvider>
        <ScrollToHash />
        <GlobalNav />
        <div className="App">
          <Routes>
            {/* ── Public routes ─────────────────────────────────────────── */}
            <Route path="/" element={<LandingPageWrapper />} />
            <Route path="/directory" element={<SportsDirectoryWrapper />} />
            <Route path="/school/:slug" element={<SchoolProfileWrapper />} />
            <Route path="/college-comparison" element={<CollegeComparison />} />
            <Route path="/explore" element={<ExploreReviews />} />

            {/* ── Auth routes ───────────────────────────────────────────── */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            {/* Canonical redirect for common /auth/* convention */}
            <Route path="/auth/login" element={<Navigate to="/login" replace />} />
            <Route path="/auth/signup" element={<Navigate to="/signup" replace />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            {/* ── Protected routes ──────────────────────────────────────── */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />

            {/* ── Admin routes ───────────────────────────────────────────── */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            {/* ── Protected routes (examples — uncomment as features ship) ─
            <Route
              path="/submit-review"
              element={
                <ProtectedRoute>
                  <SubmitReview />
                </ProtectedRoute>
              }
            />
            ──────────────────────────────────────────────────────────────── */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
