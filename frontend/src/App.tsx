import React from 'react'
import { BrowserRouter as Router, Route, Routes, useNavigate, useParams } from 'react-router-dom'

import { GlobalNav } from './components/layout/GlobalNav'
import { ScrollToHash } from './components/layout/ScrollToHash'
import { LandingPage } from './components/landing/LandingPage'
import { SchoolProfile } from './components/SchoolProfile'
import { SportsDirectory } from './components/SportsDirectory'
import { CollegeComparison } from './pages/CollegeComparison'

// Wrapper component for school profile with navigation
const SchoolProfileWrapper: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  
  if (!slug) return null
  
  return (
    <SchoolProfile 
      slug={slug} 
      onBack={() => navigate('/directory')} 
    />
  )
}

// Wrapper component for sports directory with navigation
const SportsDirectoryWrapper: React.FC = () => {
  const navigate = useNavigate()
  
  const handleSchoolClick = (slug: string) => {
    navigate(`/school/${slug}`)
  }
  
  return (
    <SportsDirectory onSchoolClick={handleSchoolClick} />
  )
}

const LandingPageWrapper: React.FC = () => {
  const navigate = useNavigate()

  return <LandingPage onGetStarted={() => navigate('/directory')} />
}

function App() {
  return (
    <Router>
      <ScrollToHash />
      <GlobalNav />
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPageWrapper />} />
          <Route path="/directory" element={<SportsDirectoryWrapper />} />
          <Route path="/school/:slug" element={<SchoolProfileWrapper />} />
          <Route path="/college-comparison" element={<CollegeComparison />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
