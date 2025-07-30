import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import PaidAdGeneratorPage from './components/listings/generation/PaidAdGeneratorPage';
import PrintGeneratorPage from './components/print/PrintGeneratorPage';
import ContentGenerationProgressPage from './components/listings/ContentGenerationProgressPage';
import PreselectBatchPage from './components/listings/generation/PreselectBatchPage';
import PortfolioAnalyticsDashboard from './components/dashboard/PortfolioAnalyticsDashboard';
import PortfolioAnalyticsDebug from './components/dashboard/PortfolioAnalyticsDebug';
import PortfolioAnalyticsProgressive from './components/dashboard/PortfolioAnalyticsProgressive';
import PortfolioAnalyticsNoCharts from './components/dashboard/PortfolioAnalyticsNoCharts';
import PortfolioAnalyticsMinimal from './components/dashboard/PortfolioAnalyticsMinimal';
import ModernPortfolioAnalytics from './components/dashboard/ModernPortfolioAnalytics';
import ContractWizard from './components/listings/contract/ContractWizard';
import InspectorSearchWizard from './components/listings/inspector/InspectorSearchWizard';
import ContractorSearchWizard from './components/listings/contractor/ContractorSearchWizard';
import RealEstateWorkflow from './components/shared/RealEstateWorkflow';
import { OllamaStatusProvider } from './contexts/OllamaStatusContext';
import { LayoutProvider } from './contexts/LayoutContext';

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
  const location = useLocation();
  
  // Pages that use ModernDashboardLayout shouldn't show the old Navbar
  const usesModernLayout = [
    '/dashboard',
    '/dashboard/portfolio',
    '/dashboard/ads',
    '/dashboard/social', 
    '/dashboard/videos',
    '/dashboard/interior',
    '/dashboard/descriptions',
    '/dashboard/email',
    '/dashboard/print',
    '/dashboard/resources',
    '/dashboard/settings'
  ].some(path => location.pathname === path) || 
  location.pathname.startsWith('/dashboard/resources/') ||
  location.pathname.startsWith('/listings/');

  return (
    <div className="min-h-screen flex flex-col bg-brand-background overflow-x-hidden">
      {!usesModernLayout && <Navbar />}
      <main className={`flex-grow ${!usesModernLayout ? 'container mx-auto px-4 py-8' : ''} overflow-hidden`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage section="dashboard" /></PrivateRoute>} />
          <Route path="/dashboard/portfolio" element={<PrivateRoute><ModernPortfolioAnalytics /></PrivateRoute>} />
          <Route path="/dashboard/ads" element={<PrivateRoute><DashboardPage section="ads" /></PrivateRoute>} />
          <Route path="/dashboard/social" element={<PrivateRoute><DashboardPage section="social" /></PrivateRoute>} />
          <Route path="/dashboard/videos" element={<PrivateRoute><DashboardPage section="videos" /></PrivateRoute>} />
          <Route path="/dashboard/interior" element={<PrivateRoute><DashboardPage section="interior" /></PrivateRoute>} />
          <Route path="/dashboard/descriptions" element={<PrivateRoute><DashboardPage section="descriptions" /></PrivateRoute>} />
          <Route path="/dashboard/email" element={<PrivateRoute><DashboardPage section="email" /></PrivateRoute>} />
          <Route path="/dashboard/print" element={<PrivateRoute><DashboardPage section="print" /></PrivateRoute>} />
          <Route path="/dashboard/resources" element={<PrivateRoute><DashboardPage section="resources" /></PrivateRoute>} />
          <Route path="/dashboard/resources/workflow" element={<PrivateRoute><RealEstateWorkflow /></PrivateRoute>} />
          <Route path="/dashboard/settings" element={<PrivateRoute><DashboardPage section="settings" /></PrivateRoute>} />
          <Route path="/listings/new" element={<PrivateRoute><ListingFormPage /></PrivateRoute>} />
          <Route path="/listings/:id/edit" element={<PrivateRoute><ListingFormPage /></PrivateRoute>} />
          
          {/* Contract Wizard Routes - Must come before generic :id route */}
          <Route
            path="/listings/:id/contract"
            element={<PrivateRoute><ContractWizard /></PrivateRoute>}
          />
          <Route
            path="/listings/:id/contract/:stepId"
            element={<PrivateRoute><ContractWizard /></PrivateRoute>}
          />
          
          {/* Inspector Search Wizard Routes */}
          <Route
            path="/listings/:id/inspector"
            element={<PrivateRoute><InspectorSearchWizard /></PrivateRoute>}
          />
          <Route
            path="/listings/:id/inspector/:stepId"
            element={<PrivateRoute><InspectorSearchWizard /></PrivateRoute>}
          />
          
          {/* Contractor Search Wizard Routes */}
          <Route
            path="/listings/:id/contractor"
            element={<PrivateRoute><ContractorSearchWizard /></PrivateRoute>}
          />
          <Route
            path="/listings/:id/contractor/:stepId"
            element={<PrivateRoute><ContractorSearchWizard /></PrivateRoute>}
          />
          
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
          <Route
            path="/listings/:id/generate-all"
            element={<PrivateRoute><ContentGenerationProgressPage /></PrivateRoute>}
          />
          <Route
            path="/listings/:id/preselect-batch"
            element={<PrivateRoute><PreselectBatchPage /></PrivateRoute>}
          />
          
          {/* Generic listing detail route - Must come AFTER all specific routes */}
          <Route path="/listings/:id" element={<PrivateRoute><ListingDetailPage /></PrivateRoute>} />
          
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
        <LayoutProvider>
          <AppRoutes />
        </LayoutProvider>
      </OllamaStatusProvider>
    </AuthProvider>
  );
}

export default App;
