import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/shared/Navbar';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import DashboardPage from './components/dashboard/DashboardPage';
import ListingFormPage from './components/listings/ListingFormPage';
import ListingDetailPage from './components/listings/ListingDetailPage';
import LandingPage from './components/shared/LandingPage';
import { useAuth } from './contexts/AuthContext';
import ListingDescriptionGeneratorPage from './components/listings/generation/ListingDescriptionGeneratorPage';
import AiRoomRedesignPage from './components/listings/AiRoomRedesignPage';
import FacebookPostGeneratorPage from './components/listings/generation/FacebookPostGeneratorPage';
import InstagramPostGeneratorPage from './components/listings/generation/InstagramPostGeneratorPage';
import XPostGeneratorPage from './components/listings/generation/XPostGeneratorPage';
import EmailGeneratorPage from './components/listings/generation/EmailGeneratorPage';
import FlyerGeneratorPage from './components/listings/generation/FlyerGeneratorPage';
import PaidAdGeneratorPage from './components/listings/generation/PaidAdGeneratorPage';

const App: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-brand-background">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-background">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" />} />
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/dashboard" />} />
          
          <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="/listings/new" element={user ? <ListingFormPage /> : <Navigate to="/login" />} />
          <Route path="/listings/:id/edit" element={user ? <ListingFormPage /> : <Navigate to="/login" />} />
          <Route path="/listings/:id" element={user ? <ListingDetailPage /> : <Navigate to="/login" />} />
          <Route 
            path="/listings/:id/generate/description" 
            element={user ? <ListingDescriptionGeneratorPage /> : <Navigate to="/login" />} 
          />
          <Route
            path="/listings/:id/generate/facebook-post"
            element={user ? <FacebookPostGeneratorPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/listings/:id/generate/instagram-post"
            element={user ? <InstagramPostGeneratorPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/listings/:id/generate/x-post"
            element={user ? <XPostGeneratorPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/listings/:id/generate/email"
            element={user ? <EmailGeneratorPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/listings/:id/generate/flyer"
            element={user ? <FlyerGeneratorPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/listings/:id/generate/paid-ad"
            element={user ? <PaidAdGeneratorPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/listings/:id/ai/room-redesign"
            element={user ? <AiRoomRedesignPage /> : <Navigate to="/login" />}
          />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <footer className="bg-brand-panel text-center p-4 text-sm text-brand-text-secondary border-t border-brand-border">
        &copy; {new Date().getFullYear()} ListingPal. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
