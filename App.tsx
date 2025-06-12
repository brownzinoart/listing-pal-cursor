import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/shared/Navbar';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import DashboardPage from './components/dashboard/DashboardPage';
import ListingFormPage from './components/listings/ListingFormPage';
import ListingDetailPage from './components/listings/ListingDetailPage';
import LandingPage from './components/shared/LandingPage';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import ListingDescriptionGeneratorPage from './components/listings/generation/ListingDescriptionGeneratorPage';
import AiRoomRedesignPage from './components/listings/AiRoomRedesignPage';
import FacebookPostGeneratorPage from './components/listings/generation/FacebookPostGeneratorPage';
import InstagramPostGeneratorPage from './components/listings/generation/InstagramPostGeneratorPage';
import XPostGeneratorPage from './components/listings/generation/XPostGeneratorPage';
import EmailGeneratorPage from './components/listings/generation/EmailGeneratorPage';
import FlyerGeneratorPage from './components/listings/generation/FlyerGeneratorPage';
import PaidAdGeneratorPage from './components/listings/generation/PaidAdGeneratorPage';
import PrintGeneratorPage from './components/print/PrintGeneratorPage';
import { OllamaStatusProvider } from './contexts/OllamaStatusContext';

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-brand-background">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <div className="min-h-screen flex flex-col bg-brand-background overflow-x-hidden">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 overflow-hidden">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/listings/new" element={<PrivateRoute><ListingFormPage /></PrivateRoute>} />
          <Route path="/listings/:id/edit" element={<PrivateRoute><ListingFormPage /></PrivateRoute>} />
          <Route path="/listings/:id" element={<PrivateRoute><ListingDetailPage /></PrivateRoute>} />
          <Route 
            path="/listings/:id/generate/description" 
            element={<PrivateRoute><ListingDescriptionGeneratorPage /></PrivateRoute>} 
          />
          <Route
            path="/listings/:id/generate/facebook-post"
            element={<PrivateRoute><FacebookPostGeneratorPage /></PrivateRoute>}
          />
          <Route
            path="/listings/:id/generate/instagram-post"
            element={<PrivateRoute><InstagramPostGeneratorPage /></PrivateRoute>}
          />
          <Route
            path="/listings/:id/generate/x-post"
            element={<PrivateRoute><XPostGeneratorPage /></PrivateRoute>}
          />
          <Route
            path="/listings/:id/generate/email"
            element={<PrivateRoute><EmailGeneratorPage /></PrivateRoute>}
          />
          <Route
            path="/listings/:id/generate/flyer"
            element={<PrivateRoute><FlyerGeneratorPage /></PrivateRoute>}
          />
          <Route
            path="/listings/:id/generate/paid-ad"
            element={<PrivateRoute><PaidAdGeneratorPage /></PrivateRoute>}
          />
          <Route
            path="/listings/:id/print"
            element={<PrivateRoute><PrintGeneratorPage /></PrivateRoute>}
          />
          <Route
            path="/listings/:id/ai/room-redesign"
            element={<PrivateRoute><AiRoomRedesignPage /></PrivateRoute>}
          />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <footer className="bg-brand-panel text-center p-4 text-sm text-brand-text-secondary border-t border-brand-border overflow-hidden">
        <span className="break-words">&copy; {new Date().getFullYear()} ListingPal. All rights reserved.</span>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <OllamaStatusProvider>
        <AppRoutes />
      </OllamaStatusProvider>
    </AuthProvider>
  );
}

export default App;
