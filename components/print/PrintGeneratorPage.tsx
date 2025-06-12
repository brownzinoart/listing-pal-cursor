import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Listing } from '../../types';
import FlyerGeneratorPage from '../listings/generation/FlyerGeneratorPage';
import * as listingService from '../../services/listingService';

interface PrintGeneratorPageProps {}

type printType = 'flyer' | 'lawnSign' | 'busPanel' | 'postcard' | 'doorHanger';

// Simple price formatter
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0 
  }).format(price);
};

// --- Placeholder Generators -------------------------
const LawnSignGenerator: React.FC<{ listing: Listing }> = ({ listing }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">Lawn Sign Generator</h3>
      
      {/* Preview */}
      <div className="mb-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8 rounded-lg max-w-md mx-auto aspect-[3/2] flex flex-col justify-between">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{listing.listingType?.toUpperCase() || 'FOR SALE'}</div>
            <div className="text-lg opacity-90">{listing.address}</div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{formatPrice(listing.price)}</div>
            <div className="flex justify-center space-x-4 text-sm">
              {listing.bedrooms && <span>{listing.bedrooms} BD</span>}
              {listing.bathrooms && <span>{listing.bathrooms} BA</span>}
              {listing.squareFootage && <span>{listing.squareFootage.toLocaleString()} SF</span>}
            </div>
          </div>
          
          <div className="text-center text-sm">
            <div className="font-semibold">Your Name</div>
            <div>Your Phone</div>
            <div>Your Email</div>
          </div>
        </div>
      </div>
      
      {/* Customization Options */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Background Color
          </label>
          <div className="flex space-x-2">
            <button className="w-8 h-8 bg-blue-600 rounded border-2 border-gray-300"></button>
            <button className="w-8 h-8 bg-red-600 rounded border-2 border-gray-300"></button>
            <button className="w-8 h-8 bg-green-600 rounded border-2 border-gray-300"></button>
            <button className="w-8 h-8 bg-purple-600 rounded border-2 border-gray-300"></button>
          </div>
        </div>
        
        <button className="w-full bg-brand-primary text-white py-2 px-4 rounded-lg hover:bg-brand-primary-dark transition-colors">
          Generate Lawn Sign
        </button>
      </div>
    </div>
  );
};

const BusPanelGenerator: React.FC<{ listing: Listing }> = ({ listing }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">Bus Panel Generator</h3>
      
      {/* Preview */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-6 rounded-lg aspect-[5/2] flex relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent z-10"></div>
          
          <div className="flex-1 z-20 flex flex-col justify-center">
            <div className="text-4xl font-bold mb-2 text-white drop-shadow-lg">
              {listing.listingType?.toUpperCase() || 'FOR SALE'}
            </div>
            <div className="text-2xl mb-4 opacity-90">{listing.address}</div>
            <div className="text-5xl font-bold mb-4 text-yellow-400">
              {formatPrice(listing.price)}
            </div>
            <div className="flex space-x-6 text-lg mb-4">
              {listing.bedrooms && <span>{listing.bedrooms} Bedrooms</span>}
              {listing.bathrooms && <span>{listing.bathrooms} Bathrooms</span>}
              {listing.squareFootage && <span>{listing.squareFootage.toLocaleString()} SF</span>}
            </div>
            <div className="text-xl font-semibold">
              Call Your Name • Your Phone
            </div>
          </div>
          
          {listing.images && listing.images.length > 0 && (
            <div className="flex-1 z-10">
              <img 
                src={listing.images[0].url} 
                alt="Property" 
                className="w-full h-full object-cover rounded-r-lg"
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Customization Options */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Layout Style
          </label>
          <select className="w-full p-2 border border-gray-300 rounded-lg">
            <option>Image Right</option>
            <option>Image Left</option>
            <option>Image Background</option>
            <option>Text Only</option>
          </select>
        </div>
        
        <button className="w-full bg-brand-primary text-white py-2 px-4 rounded-lg hover:bg-brand-primary-dark transition-colors">
          Generate Bus Panel
        </button>
      </div>
    </div>
  );
};

const PostcardGenerator: React.FC<{ listing: Listing }> = ({ listing }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">Postcard Generator</h3>
      
      {/* Preview - Front */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Front Side</h4>
        <div className="bg-white border border-gray-300 p-4 rounded-lg aspect-[3/2] max-w-sm mx-auto relative">
          {listing.images && listing.images.length > 0 ? (
            <img 
              src={listing.images[0].url} 
              alt="Property" 
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
              <span className="text-gray-500">Property Photo</span>
            </div>
          )}
          
          <div className="absolute bottom-2 left-2 right-2 bg-white/95 p-2 rounded">
            <div className="text-lg font-bold">{formatPrice(listing.price)}</div>
            <div className="text-sm text-gray-600">{listing.address}</div>
          </div>
        </div>
      </div>
      
      {/* Preview - Back */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Back Side</h4>
        <div className="bg-white border border-gray-300 p-4 rounded-lg aspect-[3/2] max-w-sm mx-auto flex">
          <div className="w-1/2 pr-2">
            <div className="text-xs text-gray-600 mb-2">PROPERTY DETAILS</div>
            <div className="text-sm space-y-1">
              <div>{listing.bedrooms || '—'} Bedrooms</div>
              <div>{listing.bathrooms || '—'} Bathrooms</div>
              <div>{listing.squareFootage?.toLocaleString() || '—'} SF</div>
              <div className="font-semibold mt-2">{listing.listingType?.toUpperCase() || 'FOR SALE'}</div>
            </div>
          </div>
          
          <div className="w-1/2 pl-2 border-l border-gray-200">
            <div className="text-xs text-gray-600 mb-2">CONTACT INFO</div>
            <div className="text-sm space-y-1">
              <div className="font-semibold">Your Name</div>
              <div>Your Phone</div>
              <div>Your Email</div>
              <div className="text-xs text-gray-500 mt-2">
                Interested in this property?<br/>
                Call or email today!
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Customization Options */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Postcard Size
          </label>
          <select className="w-full p-2 border border-gray-300 rounded-lg">
            <option>4" x 6" Standard</option>
            <option>5" x 7" Large</option>
            <option>6" x 9" Jumbo</option>
          </select>
        </div>
        
        <button className="w-full bg-brand-primary text-white py-2 px-4 rounded-lg hover:bg-brand-primary-dark transition-colors">
          Generate Postcard
        </button>
      </div>
    </div>
  );
};

const DoorHangerGenerator: React.FC<{ listing: Listing }> = ({ listing }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">Door Hanger Generator</h3>
      
      {/* Preview */}
      <div className="mb-6">
        <div className="max-w-xs mx-auto">
          {/* Door hanger shape with cutout */}
          <div className="bg-gradient-to-b from-blue-50 to-white border-2 border-blue-200 rounded-lg relative" 
               style={{ clipPath: 'polygon(0 0, 100% 0, 100% 25%, 75% 25%, 75% 35%, 100% 35%, 100% 100%, 0 100%)' }}>
            
            <div className="p-6 pt-12">
              {/* Header */}
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-blue-800">NEW LISTING</div>
                <div className="text-lg text-gray-700">{listing.listingType?.toUpperCase() || 'FOR SALE'}</div>
              </div>
              
              {/* Property Image */}
              {listing.images && listing.images.length > 0 ? (
                <img 
                  src={listing.images[0].url} 
                  alt="Property" 
                  className="w-full h-32 object-cover rounded mb-4"
                />
              ) : (
                <div className="w-full h-32 bg-gray-200 rounded mb-4 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Property Photo</span>
                </div>
              )}
              
              {/* Property Details */}
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {formatPrice(listing.price)}
                </div>
                <div className="text-sm text-gray-700 mb-2">{listing.address}</div>
                <div className="flex justify-center space-x-3 text-sm text-gray-600">
                  {listing.bedrooms && <span>{listing.bedrooms} BD</span>}
                  {listing.bathrooms && <span>{listing.bathrooms} BA</span>}
                  {listing.squareFootage && <span>{listing.squareFootage.toLocaleString()} SF</span>}
                </div>
              </div>
              
              {/* CTA */}
              <div className="bg-blue-600 text-white p-3 rounded text-center mb-4">
                <div className="font-bold">Interested?</div>
                <div className="text-sm">Call for a showing!</div>
              </div>
              
              {/* Contact Info */}
              <div className="text-center text-sm text-gray-700">
                <div className="font-semibold">Your Name</div>
                <div>Your Phone</div>
                <div>Your Email</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Customization Options */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message Style
          </label>
          <select className="w-full p-2 border border-gray-300 rounded-lg">
            <option>New Listing</option>
            <option>Just Sold</option>
            <option>Price Reduced</option>
            <option>Open House</option>
          </select>
        </div>
        
        <button className="w-full bg-brand-primary text-white py-2 px-4 rounded-lg hover:bg-brand-primary-dark transition-colors">
          Generate Door Hanger
        </button>
      </div>
    </div>
  );
};

const PrintGeneratorPage: React.FC<PrintGeneratorPageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrintType, setSelectedPrintType] = useState<printType>('flyer');

  useEffect(() => {
    const fetchListing = async () => {
      if (!id || !user) return;

      try {
        setLoading(true);
        const data = await listingService.getListingById(id);
        if (data && data.userId === user.id) {
          setListing(data);
        } else {
          setError(data ? 'Permission denied.' : 'Listing not found.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="text-center text-red-600 p-8">
        Error: {error || 'Listing not found'}
      </div>
    );
  }

  const printTypes = [
    { id: 'flyer', name: 'Flyer', icon: '📄' },
    { id: 'lawnSign', name: 'Lawn Sign', icon: '🏠' },
    { id: 'busPanel', name: 'Bus Panel', icon: '🚌' },
    { id: 'postcard', name: 'Postcard', icon: '📮' },
    { id: 'doorHanger', name: 'Door Hanger', icon: '🚪' },
  ];

  const renderGenerator = () => {
    switch (selectedPrintType) {
      case 'flyer':
        return <FlyerGeneratorPage />;
      case 'lawnSign':
        return <LawnSignGenerator listing={listing} />;
      case 'busPanel':
        return <BusPanelGenerator listing={listing} />;
      case 'postcard':
        return <PostcardGenerator listing={listing} />;
      case 'doorHanger':
        return <DoorHangerGenerator listing={listing} />;
      default:
        return <FlyerGeneratorPage />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Print Generator</h1>
        <p className="text-gray-600">
          Create professional print materials for <span className="font-semibold">{listing.address}</span>
        </p>
      </div>

      {/* Print Type Selector */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
          {printTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedPrintType(type.id as printType)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-all ${
                selectedPrintType === type.id
                  ? 'bg-brand-primary text-white border-brand-primary shadow-lg'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-brand-primary hover:bg-brand-primary/5'
              }`}
            >
              <span className="text-lg">{type.icon}</span>
              <span className="font-medium">{type.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Generator Content */}
      <div className="bg-gray-50 rounded-lg p-6">
        {renderGenerator()}
      </div>
    </div>
  );
};

export default PrintGeneratorPage; 