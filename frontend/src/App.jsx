import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './navbar/Navbar'
import Home from './pages/home/Home'
import Footer from './fotter/Fotter'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Profile from './pages/profile/Profile'
import Dashboard from './pages/dashboard/Dashboard'
import PostJob from './pages/jobs/PostJob'
import JobRecommendations from './pages/jobs/JobRecommendations'
import JobDetail from './pages/jobs/JobDetail'
import BrowseJobs from './pages/jobs/BrowseJobs'
import CompaniesDashboard from './pages/dashboard/CompaniesDashboard'
import RecruiterDashboard from './pages/dashboard/RecruiterDashboard'

import './index.css'

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/login" 
            element={
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <ProtectedRoute requireAuth={false}>
                <Signup />
              </ProtectedRoute>
            } 
          />
          {/* Add more protected routes here */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                {user?.role === 'recruiter' ? <RecruiterDashboard /> : <Dashboard />}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/post-job" 
            element={
              <ProtectedRoute>
                <PostJob />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/job-recommendations" 
            element={
              <ProtectedRoute>
                <JobRecommendations />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/browse-jobs" 
            element={
              <ProtectedRoute>
                <BrowseJobs />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/jobs/:id" 
            element={
              <ProtectedRoute>
                <JobDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/companies" 
            element={<CompaniesDashboard />} 
          />
        </Routes>
      </main>
      <Footer />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AuthProvider>
);

export default App;