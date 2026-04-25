# The Locker Room - Sports Directory Frontend

A modern React application for browsing college sports programs across the nation.

## Features

- **Sports Directory**: Browse all college sports programs with filtering capabilities
- **Advanced Filtering**: Filter by sport type, gender, and state
- **School Profiles**: Detailed view of individual schools and their sports programs
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Real-time Data**: Connected to Supabase backend with live data

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Backend**: Supabase (PostgreSQL + REST API)
- **State Management**: React Hooks with custom data fetching hooks

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_SUPABASE_URL=https://viompwdazjukiuatffuk.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Start Development Server**:
   ```bash
   npm start
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/          # React components
│   ├── SportsDirectory.tsx    # Main directory page
│   ├── SportsFilters.tsx      # Filter controls
│   ├── SchoolCard.tsx         # Individual school card
│   └── SchoolProfile.tsx      # School detail page
├── hooks/              # Custom React hooks
│   └── useSupabaseData.ts     # Data fetching hooks
├── lib/                # Utility libraries
│   └── supabase.ts            # Supabase client & types
└── App.tsx             # Main app with routing
```

## API Endpoints

The frontend connects to these Supabase views:
- `v_school_profile` - School-centric data with sports programs
- `v_sports_directory` - Sport-centric data for filtering

## Features

### Sports Directory
- View all college sports programs
- Filter by sport, gender, and state
- Responsive grid layout
- Real-time search and filtering

### School Profiles
- Detailed school information
- Complete sports program listing
- Navigation between directory and profiles

### Responsive Design
- Mobile-first approach
- Tailwind CSS for consistent styling
- Modern card-based UI components

## Development

- **TypeScript**: Full type safety for all components and data
- **Custom Hooks**: Reusable data fetching logic
- **Component Architecture**: Modular, reusable components
- **Error Handling**: Graceful error states and loading indicators

## Deployment

The app is ready for deployment to any static hosting service:
- Netlify
- AWS S3
- GitHub Pages

Simply run `npm run build` and deploy the `build` folder.
