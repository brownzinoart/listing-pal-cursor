
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as listingService from '../../services/listingService';
import { Listing } from '../../types';
import ListingCard from './ListingCard';
import Button from '../shared/Button';
import { PlusIcon, SquaresPlusIcon, PencilIcon, TrashIcon, BuildingOfficeIcon } from '@heroicons/react/24/solid';
import { Cog6ToothIcon, MapPinIcon, Squares2X2Icon, TableCellsIcon } from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';
import PaidAdsDashboard from './PaidAdsDashboard';
import SocialPostsDashboard from './SocialPostsDashboard';
import DescriptionsDashboard from './DescriptionsDashboard';
import EmailMarketingDashboard from './EmailMarketingDashboard';
import InteriorDesignDashboard from './InteriorDesignDashboard';
import PrintMaterialsDashboard from './PrintMaterialsDashboard';
import SettingsDashboard from './SettingsDashboard';
import VideoStudioDashboard from './VideoStudioDashboard';
import ModernDashboardLayout from '../shared/ModernDashboardLayout';

const NAV_LINKS = [
  { key: 'dashboard', label: 'Home', path: '/dashboard' },
  { key: 'portfolio', label: 'Portfolio Analytics', path: '/dashboard/portfolio' },
  { key: 'descriptions', label: 'Descriptions', path: '/dashboard/descriptions' },
  { key: 'social', label: 'Social Posts', path: '/dashboard/social' },
  { key: 'email', label: 'Email', path: '/dashboard/email' },
  { key: 'ads', label: 'Paid Ads', path: '/dashboard/ads' },
  { key: 'interior', label: 'Interior Deco', path: '/dashboard/interior' },
  { key: 'print', label: 'Print Materials', path: '/dashboard/print' },
  { key: 'resources', label: 'Resources', path: '/dashboard/resources' },
];

// Resource cards data
const RESOURCE_CARDS = [
  {
    key: 'contract-helper',
    title: 'Contract Helper',
    description: 'Get assistance with real estate contracts and forms.',
  },
  {
    key: 'inspector-search',
    title: 'Inspector Search',
    description: 'Find certified home inspectors in your area.',
  },
  {
    key: 'contractor-search',
    title: 'Contractor Search',
    description: 'Locate trusted contractors for repairs and renovations.',
  },
  // Add more resources as needed
];

// Mock contract templates by state
const CONTRACT_TEMPLATES: { [key: string]: { name: string; fields: { key: string; label: string; type: string; }[] } } = {
  CA: {
    name: 'California Residential Purchase Agreement',
    fields: [
      { key: 'buyer', label: 'Buyer Name', type: 'text' },
      { key: 'seller', label: 'Seller Name', type: 'text' },
      { key: 'price', label: 'Purchase Price', type: 'number' },
      { key: 'address', label: 'Property Address', type: 'text' },
    ],
  },
  NY: {
    name: 'New York Residential Contract',
    fields: [
      { key: 'buyer', label: 'Buyer Name', type: 'text' },
      { key: 'seller', label: 'Seller Name', type: 'text' },
      { key: 'price', label: 'Purchase Price', type: 'number' },
      { key: 'address', label: 'Property Address', type: 'text' },
      { key: 'attorney', label: 'Attorney Name', type: 'text' },
    ],
  },
  TX: {
    name: 'Texas One to Four Family Residential Contract',
    fields: [
      { key: 'buyer', label: 'Buyer Name', type: 'text' },
      { key: 'seller', label: 'Seller Name', type: 'text' },
      { key: 'price', label: 'Purchase Price', type: 'number' },
      { key: 'address', label: 'Property Address', type: 'text' },
      { key: 'optionFee', label: 'Option Fee', type: 'number' },
    ],
  },
};

interface DashboardPageProps {
  section?: string;
}

type ViewMode = 'cards' | 'table';

// Always use 'Pavano' as the test user's name
function getFirstName() {
  return 'Pavano';
}

const DashboardPage: React.FC<DashboardPageProps> = ({ section }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContractHelper, setShowContractHelper] = useState(false);
  const [selectedState, setSelectedState] = useState('CA');
  const [contractFields, setContractFields] = useState<Record<string, string | number>>({});
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Default to cards on mobile, allow saved preference on desktop
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      if (isMobile) return 'cards';
      
      const savedView = localStorage.getItem('dashboardViewMode');
      return (savedView as ViewMode) || 'cards';
    }
    return 'cards';
  });
  const contractTemplate = CONTRACT_TEMPLATES[selectedState];

  // Save view preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboardViewMode', viewMode);
    }
  }, [viewMode]);

  const fetchListings = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const userListings = await listingService.getListings(user.id);
      setListings(userListings);
    } catch (err) {
      setError('Failed to fetch listings. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleDeleteListing = async (listingId: string) => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }
    try {
      await listingService.deleteListing(listingId);
      fetchListings(); 
    } catch (err) {
      setError('Failed to delete listing. Please try again.');
      console.error(err);
    }
  };

  // Get page title and subtitle based on section
  const getPageInfo = () => {
    const pageMap: { [key: string]: { title: string; subtitle: string } } = {
      'dashboard': { title: 'Dashboard Home', subtitle: 'Manage your property listings and business' },
      'descriptions': { title: 'Listing Descriptions', subtitle: 'AI-powered property descriptions and content' },
      'social': { title: 'Social Media Posts', subtitle: 'Create engaging social content for your listings' },
      'videos': { title: 'Video Studio', subtitle: 'Create AI-powered property videos' },
      'email': { title: 'Email Marketing', subtitle: 'Professional email templates and campaigns' },
      'ads': { title: 'Paid Advertising', subtitle: 'Optimize your digital advertising campaigns' },
      'interior': { title: 'Interior Design', subtitle: 'AI-powered room staging and design tools' },
      'print': { title: 'Print Materials', subtitle: 'Professional flyers and marketing materials' },
      'resources': { title: 'Agent Resources', subtitle: 'Tools and templates for real estate professionals' },
      'settings': { title: 'Settings', subtitle: 'Manage your account and preferences' }
    };
    return pageMap[section || 'dashboard'] || { title: 'Dashboard', subtitle: 'Your real estate command center' };
  };

  const { title, subtitle } = getPageInfo();

  // Helper functions for listings display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      minimumFractionDigits: 0 
    }).format(price);
  };

  const getCityState = (address: string) => {
    return address.split(',').slice(1,3).join(',').trim() || 'N/A';
  };

  const renderListingsTable = () => (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Your Active Listings</h2>
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-white/10 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'cards'
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                  title="Card View"
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'table'
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                  title="Table View"
                >
                  <TableCellsIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Property
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Location
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Bedrooms
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Bathrooms
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Sq Ft
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {listings.map((listing) => {
                const primaryImage = listing.images && listing.images.length > 0 ? listing.images[0].url : null;
                
                return (
                  <tr key={listing.id} className="hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden">
                          {primaryImage ? (
                            <img 
                              src={primaryImage} 
                              alt={listing.address} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-600 flex items-center justify-center">
                              <BuildingOfficeIcon className="w-6 h-6 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{listing.address.split(',')[0]}</p>
                          <p className="text-slate-400 text-sm">{listing.propertyType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-300">{getCityState(listing.address)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-emerald-400 font-bold text-lg">{formatPrice(listing.price)}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-white font-medium">
                      {listing.bedrooms}
                    </td>
                    <td className="px-6 py-4 text-center text-white font-medium">
                      {listing.bathrooms}
                    </td>
                    <td className="px-6 py-4 text-center text-white font-medium">
                      {listing.squareFootage?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-medium">
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/listings/${listing.id}`)}
                          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                          title="Manage Listing"
                        >
                          <Squares2X2Icon className="h-4 w-4 text-white" />
                        </button>
                        <Link
                          to={`/listings/${listing.id}/edit`}
                          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                          title="Edit Listing"
                        >
                          <PencilIcon className="h-4 w-4 text-white" />
                        </Link>
                        <button
                          onClick={() => handleDeleteListing(listing.id)}
                          className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-all duration-200"
                          title="Delete Listing"
                        >
                          <TrashIcon className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderListingsCards = () => (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Your Active Listings</h2>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white/10 rounded-xl p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'cards'
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title="Card View"
              >
                <Squares2X2Icon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'table'
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title="Table View"
              >
                <TableCellsIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(listing => (
            <ListingCard key={listing.id} listing={listing} onDelete={handleDeleteListing} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <ModernDashboardLayout
      title={title}
      subtitle={subtitle}
    >
        {(!section || section === 'dashboard') && (
          <>
            {/* Personalized Welcome Section */}
            <div className="relative group mb-12">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    {/* Personalized Greeting */}
                    <h1 className="text-3xl font-bold text-white">
                      {(() => {
                        const hour = new Date().getHours();
                        let greeting = 'Welcome Back';
                        if (hour < 12) greeting = 'Good Morning';
                        else if (hour < 18) greeting = 'Good Afternoon';
                        else greeting = 'Good Evening';
                        return `${greeting}, Pavano`;
                      })()}
                    </h1>
                    <p className="text-slate-400 mt-2">Manage your property listings and grow your business</p>
                  </div>
                  <Link to="/listings/new">
                    <Button variant="glass" glowColor="emerald" leftIcon={<PlusIcon className="h-5 w-5"/>} className="w-full sm:w-auto">
                      New Listing
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Your Listings Section */}
            {isLoading ? (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
                  <div className="text-center bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                    <p className="text-red-400">{error}</p>
                  </div>
                </div>
              </div>
            ) : listings.length === 0 ? (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-12">
                  <div className="text-center">
                    <SquaresPlusIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-xl text-white mb-2">No listings yet.</p>
                    <p className="text-slate-400 mb-6">Get started by creating your first property listing.</p>
                    <Link to="/listings/new">
                      <Button variant="gradient" size="lg" leftIcon={<PlusIcon className="h-6 w-6"/>}>
                        Create First Listing
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              viewMode === 'table' ? renderListingsTable() : renderListingsCards()
            )}
          </>
        )}
        {section === 'descriptions' && (
          <DescriptionsDashboard />
        )}
        {section === 'email' && (
          <EmailMarketingDashboard />
        )}
        {section === 'interior' && (
          <InteriorDesignDashboard />
        )}
        {section === 'print' && (
          <PrintMaterialsDashboard />
        )}
        {section === 'ads' && (
          <PaidAdsDashboard />
        )}
        {section === 'social' && (
          <SocialPostsDashboard />
        )}
        {section === 'videos' && (
          <VideoStudioDashboard />
        )}
        {section === 'settings' && (
          <SettingsDashboard />
        )}
        {section && section !== 'dashboard' && section !== 'resources' && section !== 'ads' && section !== 'social' && section !== 'videos' && section !== 'descriptions' && section !== 'email' && section !== 'interior' && section !== 'print' && section !== 'settings' && (
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-12">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-amber-500/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4 capitalize">{NAV_LINKS.find(l => l.path.endsWith(section))?.label || section}</h2>
                <p className="text-slate-300 text-lg mb-8">This section will show actionable analytics and insights for <span className="font-semibold text-amber-400">{NAV_LINKS.find(l => l.path.endsWith(section))?.label || section}</span>.</p>
                <div className="inline-flex items-center px-6 py-3 bg-amber-500/20 border border-amber-500/30 rounded-2xl text-amber-400 font-medium">
                  Coming Soon in Beta!
                </div>
              </div>
            </div>
          </div>
        )}
        {section === 'resources' && (
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white mb-8">Agent Resources</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {RESOURCE_CARDS.map(card => (
                  <div
                    key={card.key}
                    className="relative cursor-pointer transform transition-transform duration-200 hover:scale-105"
                    onClick={() => card.key === 'contract-helper' ? setShowContractHelper(true) : null}
                  >
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-200">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                        <span className="text-emerald-400 text-xl font-bold">{card.title[0]}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
                      <p className="text-slate-300 mb-4 text-sm leading-relaxed">{card.description}</p>
                      <div className="flex items-center text-emerald-400 font-medium text-sm">
                        <span>Open</span>
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Contract Helper Modal */}
            <Dialog open={showContractHelper} onClose={() => setShowContractHelper(false)} className="fixed z-50 inset-0 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4">
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                <div className="relative bg-slate-800 border border-white/20 rounded-2xl shadow-2xl max-w-lg w-full mx-auto p-8 z-10">
                  <Dialog.Title className="text-2xl font-bold mb-6 text-white">Contract Helper</Dialog.Title>
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 text-slate-300">Select State</label>
                    <select
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      value={selectedState}
                      onChange={e => setSelectedState(e.target.value)}
                    >
                      {Object.keys(CONTRACT_TEMPLATES).map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4 text-white">{contractTemplate.name}</h3>
                    <form className="space-y-4">
                      {contractTemplate.fields.map((field: any) => (
                        <div key={field.key}>
                          <label className="block text-sm font-medium text-slate-300 mb-2">{field.label}</label>
                          <input
                            type={field.type}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            value={contractFields[field.key] || ''}
                            onChange={e => setContractFields(f => ({ ...f, [field.key]: e.target.value }))}
                          />
                        </div>
                      ))}
                    </form>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      className="px-6 py-3 rounded-lg bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white transition-all"
                      onClick={() => setShowContractHelper(false)}
                    >
                      Close
                    </button>
                    <button
                      className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all"
                      onClick={() => setShowContractHelper(false)}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </Dialog>
          </div>
        )}
    </ModernDashboardLayout>
  );
};

export default DashboardPage;