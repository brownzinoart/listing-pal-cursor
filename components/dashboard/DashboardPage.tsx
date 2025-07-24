
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as listingService from '../../services/listingService';
import { Listing } from '../../types';
import ListingCard from './ListingCard';
import Button from '../shared/Button';
import { PlusIcon, SquaresPlusIcon } from '@heroicons/react/24/solid';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';

const NAV_LINKS = [
  { key: 'dashboard', label: 'Home', path: '/dashboard' },
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

// Always use 'Pavano' as the test user's name
function getFirstName() {
  return 'Pavano';
}

const DashboardPage: React.FC<DashboardPageProps> = ({ section }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showContractHelper, setShowContractHelper] = useState(false);
  const [selectedState, setSelectedState] = useState('CA');
  const [contractFields, setContractFields] = useState<Record<string, string | number>>({});
  const contractTemplate = CONTRACT_TEMPLATES[selectedState];

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

  // Sidebar navigation
  const Sidebar = () => (
    <aside className={`fixed z-30 inset-y-0 left-0 w-64 transform transition-transform duration-200 ease-in-out
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      md:relative md:translate-x-0 md:flex md:flex-col md:w-64 md:min-h-screen`}
    >
      <div className="flex items-center justify-between px-6 py-4 md:hidden">
        <span className="font-bold text-lg text-brand-text-primary">Menu</span>
        <button onClick={() => setSidebarOpen(false)} className="text-brand-text-secondary hover:text-brand-text-primary focus:outline-none">✕</button>
      </div>
      <nav className="flex flex-col gap-1 p-4 flex-1">
        {NAV_LINKS.map(link => (
          <Link
            key={link.key}
            to={link.path}
            className={`block px-4 py-2 rounded-md font-medium transition-colors
              ${location.pathname === link.path
                ? 'text-brand-text-primary font-semibold'
                : 'text-brand-text-secondary hover:text-brand-text-primary'}`}
            onClick={() => setSidebarOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      {/* Avatar and Settings at the bottom */}
      <div className="p-4 border-t border-brand-border flex flex-col items-center">
        <div className="w-14 h-14 rounded-full bg-brand-panel border border-brand-border flex items-center justify-center text-2xl font-bold text-brand-text-primary select-none mb-2">
          P
        </div>
        <div className="relative w-full flex flex-col items-center">
          <button
            className="flex items-center px-3 py-2 rounded-md border border-brand-border text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-panel focus:outline-none w-full justify-center gap-2"
            onClick={() => setShowSettings(s => !s)}
            type="button"
            aria-label="Open settings menu"
          >
            <Cog6ToothIcon className="w-5 h-5 mr-1" />
            <span>Settings</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showSettings && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-52 bg-gray-900 text-white border border-brand-border rounded-md shadow-lg z-50">
              <Link to="/account" className="block px-4 py-2 hover:bg-gray-800">Account Details</Link>
              <Link to="/subscription" className="block px-4 py-2 hover:bg-gray-800">Subscription</Link>
              <Link to="/settings" className="block px-4 py-2 hover:bg-gray-800">Settings</Link>
            </div>
          )}
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar for desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      {/* Sidebar slide-in for mobile */}
      <div className="md:hidden">
        <Sidebar />
      </div>
      {/* Main content */}
      <main className="flex-1 p-6 md:p-10">
        {/* Mobile menu button */}
        <button
          className="md:hidden mb-4 px-3 py-2 rounded-md border border-brand-border shadow"
          onClick={() => setSidebarOpen(true)}
        >
          Menu
        </button>
        {(!section || section === 'dashboard') && (
          <>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
              <div>
                {/* Personalized Greeting */}
                <h1 className="text-3xl font-bold text-brand-text-primary">
                  {(() => {
                    const hour = new Date().getHours();
                    let greeting = 'Welcome Back';
                    if (hour < 12) greeting = 'Good Morning';
                    else if (hour < 18) greeting = 'Good Afternoon';
                    else greeting = 'Good Evening';
                    return `${greeting}, Pavano`;
                  })()}
                </h1>
                <p className="text-brand-text-secondary mt-1">Manage your property listings</p>
              </div>
              <Link to="/listings/new">
                <Button variant="primary" leftIcon={<PlusIcon className="h-5 w-5"/>} className="w-full sm:w-auto">
                  New Listing
                </Button>
              </Link>
            </div>
            <h2 className="text-xl font-semibold text-brand-text-primary mb-4">Your Listings</h2>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
              </div>
            ) : error ? (
              <p className="text-center text-brand-danger bg-red-900/20 p-4 rounded-md">{error}</p>
            ) : listings.length === 0 ? (
              <div className="text-center py-12 bg-brand-panel rounded-lg shadow-xl border border-brand-border">
                <SquaresPlusIcon className="h-16 w-16 text-brand-text-tertiary mx-auto mb-4" />
                <p className="text-xl text-brand-text-secondary mb-2">No listings yet.</p>
                <p className="text-brand-text-tertiary mb-6">Get started by creating your first property listing.</p>
                <Link to="/listings/new">
                  <Button variant="primary" size="lg" leftIcon={<PlusIcon className="h-6 w-6"/>}>
                    Create First Listing
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} onDelete={handleDeleteListing} />
                ))}
              </div>
            )}
          </>
        )}
        {section && section !== 'dashboard' && section !== 'resources' && (
          <div className="flex flex-col items-center justify-center h-full p-12">
            <h2 className="text-2xl font-bold text-brand-text-primary mb-2 capitalize">{NAV_LINKS.find(l => l.path.endsWith(section))?.label || section}</h2>
            <p className="text-brand-text-secondary text-lg">This section will show actionable analytics and insights for <span className="font-semibold">{NAV_LINKS.find(l => l.path.endsWith(section))?.label || section}</span>.</p>
            <div className="mt-8 text-brand-text-tertiary">(Coming soon in Beta!)</div>
          </div>
        )}
        {section === 'resources' && (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-brand-text-primary mb-6">Agent Resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {RESOURCE_CARDS.map(card => (
                <div
                  key={card.key}
                  className="bg-brand-panel border border-brand-border rounded-xl shadow hover:shadow-lg p-6 flex flex-col items-start transition-all cursor-pointer group"
                  onClick={() => card.key === 'contract-helper' ? setShowContractHelper(true) : null}
                >
                  <div className="w-12 h-12 rounded-full bg-brand-card flex items-center justify-center mb-4 text-brand-primary text-xl font-bold group-hover:bg-brand-primary group-hover:text-white transition-all">
                    {/* Placeholder for icon */}
                    <span>{card.title[0]}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-brand-text-primary mb-2">{card.title}</h3>
                  <p className="text-brand-text-secondary mb-2">{card.description}</p>
                  <span className="text-brand-primary font-medium mt-auto group-hover:underline">Open</span>
                </div>
              ))}
            </div>
            {/* Contract Helper Modal */}
            <Dialog open={showContractHelper} onClose={() => setShowContractHelper(false)} className="fixed z-50 inset-0 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4">
                <div className="fixed inset-0 bg-black bg-opacity-40" />
                <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-auto p-8 z-10">
                  <Dialog.Title className="text-2xl font-bold mb-4 text-brand-text-primary">Contract Helper</Dialog.Title>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-brand-text-secondary">Select State</label>
                    <select
                      className="w-full border border-brand-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      value={selectedState}
                      onChange={e => setSelectedState(e.target.value)}
                    >
                      {Object.keys(CONTRACT_TEMPLATES).map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2 text-brand-text-primary">{contractTemplate.name}</h3>
                    <form className="space-y-3">
                      {contractTemplate.fields.map((field: any) => (
                        <div key={field.key}>
                          <label className="block text-sm font-medium text-brand-text-secondary mb-1">{field.label}</label>
                          <input
                            type={field.type}
                            className="w-full border border-brand-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            value={contractFields[field.key] || ''}
                            onChange={e => setContractFields(f => ({ ...f, [field.key]: e.target.value }))}
                          />
                        </div>
                      ))}
                    </form>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      className="px-4 py-2 rounded-md bg-brand-panel border border-brand-border text-brand-text-secondary hover:bg-brand-primary hover:text-white transition"
                      onClick={() => setShowContractHelper(false)}
                    >
                      Close
                    </button>
                    <button
                      className="px-4 py-2 rounded-md bg-brand-primary text-white font-semibold hover:bg-brand-accent transition"
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
      </main>
    </div>
  );
};

export default DashboardPage;