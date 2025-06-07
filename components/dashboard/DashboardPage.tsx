
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as listingService from '../../services/listingService';
import { Listing } from '../../types';
import ListingCard from './ListingCard';
import Button from '../shared/Button';
import { PlusIcon, SquaresPlusIcon } from '@heroicons/react/24/solid';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-brand-danger bg-red-900/20 p-4 rounded-md">{error}</p>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-brand-text-primary">Dashboard</h1>
            <p className="text-brand-text-secondary mt-1">Manage your property listings</p>
        </div>
        <Link to="/listings/new">
          <Button variant="primary" leftIcon={<PlusIcon className="h-5 w-5"/>} className="w-full sm:w-auto">
            New Listing
          </Button>
        </Link>
      </div>
      
      <h2 className="text-xl font-semibold text-brand-text-primary mb-4">Your Listings</h2>
      {listings.length === 0 ? (
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
    </div>
  );
};

export default DashboardPage;