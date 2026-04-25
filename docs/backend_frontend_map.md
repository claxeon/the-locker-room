# Backend → Frontend Data Map (MVP)

## Overview
- **DB (Supabase Postgres):** `schools`, `sports_offered`
- **Views:** `v_school_profile` (school-centric), `v_sports_directory` (sport-centric)
- **Access:** Supabase REST (PostgREST) with `apikey` + `Authorization: Bearer` (Anon key)
- **Auth:** RLS allows `SELECT` for `anon` and `authenticated`

## Global
- **Base URL:** `${SUPABASE_URL}/rest/v1`
- **Headers:**
  - `apikey: ${SUPABASE_ANON_KEY}`
  - `Authorization: Bearer ${SUPABASE_ANON_KEY}`

---

## Page: School Profile
**Source:** `v_school_profile`  
**Filter:** `slug` (unique per school)  
**Endpoint:**
```
GET ${SUPABASE_URL}/rest/v1/v_school_profile?slug=eq.{school_slug}
```

**Response Structure:**
```json
[
  {
    "school_id": "string",
    "slug": "string",
    "institution_name": "string",
    "state_cd": "string",
    "classification_name": "string",
    "sanction_name": "string",
    "logo_url": "string|null",
    "programs": [
      {
        "sport": "string",
        "gender": "string"
      }
    ]
  }
]
```

**Example Response:**
```json
[
  {
    "school_id": "1",
    "slug": "abilene-christian-university",
    "institution_name": "Abilene Christian University",
    "state_cd": "TX",
    "classification_name": "NCAA Division I-FCS",
    "sanction_name": "NCAA",
    "logo_url": null,
    "programs": [
      {"sport": "All track combined Men's", "gender": "Men"},
      {"sport": "Baseball Men's", "gender": "Men"},
      {"sport": "Basketball Men's", "gender": "Men"},
      {"sport": "Football Men's", "gender": "Men"}
    ]
  }
]
```

---

## Page: Sports Directory
**Source:** `v_sports_directory`  
**Filter:** `sport` (optional), `gender` (optional), `state_cd` (optional)  
**Endpoint:**
```
GET ${SUPABASE_URL}/rest/v1/v_sports_directory
GET ${SUPABASE_URL}/rest/v1/v_sports_directory?sport=eq.{sport_name}
GET ${SUPABASE_URL}/rest/v1/v_sports_directory?gender=eq.{gender}
GET ${SUPABASE_URL}/rest/v1/v_sports_directory?state_cd=eq.{state_code}
```

**Response Structure:**
```json
[
  {
    "school_id": "string",
    "slug": "string",
    "institution_name": "string",
    "state_cd": "string",
    "classification_name": "string",
    "sanction_name": "string",
    "logo_url": "string|null",
    "sport": "string",
    "gender": "string"
  }
]
```

**Example Response:**
```json
[
  {
    "school_id": "1",
    "slug": "abilene-christian-university",
    "institution_name": "Abilene Christian University",
    "state_cd": "TX",
    "classification_name": "NCAA Division I-FCS",
    "sanction_name": "NCAA",
    "logo_url": null,
    "sport": "All track combined Men's",
    "gender": "Men"
  }
]
```

---

## Testing
Both endpoints have been verified working with curl:
```bash
# Test school profile view
curl -X GET "${SUPABASE_URL}/rest/v1/v_school_profile" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json"

# Test sports directory view  
curl -X GET "${SUPABASE_URL}/rest/v1/v_sports_directory" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json"
```

## Notes
- All endpoints return arrays (even for single results)
- Use `eq.` for exact matches in filters
- RLS is properly configured for anonymous access
- No additional backend code needed - frontend can call these directly
