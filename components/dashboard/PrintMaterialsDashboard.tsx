import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../shared/Button';
import { 
  PlusIcon, 
  DocumentTextIcon, 
  ClipboardDocumentIcon,
  PrinterIcon,
  EyeIcon
} from '@heroicons/react/24/solid';
import { 
  DocumentDuplicateIcon,
  SparklesIcon,
  HeartIcon as HeartOutlineIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import ViewToggle, { ViewMode } from '../shared/ViewToggle';

// Print material types from existing generator
type PrintMaterialType = 'flyer' | 'lawnSign' | 'busPanel' | 'postcard' | 'doorHanger';

const PRINT_MATERIAL_TYPES: { id: PrintMaterialType; name: string; icon: string; description: string }[] = [
  { id: 'flyer', name: 'Flyer', icon: '📄', description: 'Professional property flyers' },
  { id: 'lawnSign', name: 'Lawn Sign', icon: '🏠', description: 'Eye-catching yard signs' },
  { id: 'busPanel', name: 'Bus Panel', icon: '🚌', description: 'Large format advertisements' },
  { id: 'postcard', name: 'Postcard', icon: '📮', description: 'Direct mail postcards' },
  { id: 'doorHanger', name: 'Door Hanger', icon: '🚪', description: 'Neighborhood door hangers' },
];

// Mock data for generated print materials
const mockPrintMaterials = [
  {
    id: 'print-001',
    listingId: 'listing-001',
    listingAddress: '123 Oak Street, San Francisco',
    type: 'flyer' as PrintMaterialType,
    title: 'Luxury Modern Home Flyer',
    colorScheme: 'Royal Blue',
    size: 'Letter (8.5" x 11")',
    createdDate: '2024-01-15',
    printCount: 150,
    lastPrinted: '2024-01-16',
    favorite: true,
    downloadUrl: '/downloads/flyer-001.pdf',
    status: 'ready'
  },
  {
    id: 'print-002',
    listingId: 'listing-001',
    listingAddress: '123 Oak Street, San Francisco',
    type: 'lawnSign' as PrintMaterialType,
    title: 'Modern Home Lawn Sign',
    colorScheme: 'Forest Green',
    size: '24" x 18" Standard',
    createdDate: '2024-01-14',
    printCount: 2,
    lastPrinted: '2024-01-15',
    favorite: false,
    downloadUrl: '/downloads/lawn-sign-002.pdf',
    status: 'ready'
  },
  {
    id: 'print-003',
    listingId: 'listing-002',
    listingAddress: '456 Pine Avenue, Oakland',
    type: 'postcard' as PrintMaterialType,
    title: 'Investment Property Postcard',
    colorScheme: 'Classic Blue',
    size: '4" x 6" Standard',
    createdDate: '2024-01-13',
    printCount: 500,
    lastPrinted: '2024-01-14',
    favorite: true,
    downloadUrl: '/downloads/postcard-003.pdf',
    status: 'ready'
  },
  {
    id: 'print-004',
    listingId: 'listing-003',
    listingAddress: '789 Maple Drive, Berkeley',
    type: 'doorHanger' as PrintMaterialType,
    title: 'New Listing Door Hanger',
    colorScheme: 'Bright Blue',
    size: 'Standard Door Hanger',
    createdDate: '2024-01-12',
    printCount: 0,
    lastPrinted: null,
    favorite: false,
    downloadUrl: '/downloads/door-hanger-004.pdf',
    status: 'generating'
  },
  {
    id: 'print-005',
    listingId: 'listing-002',
    listingAddress: '456 Pine Avenue, Oakland',
    type: 'busPanel' as PrintMaterialType,
    title: 'Investment Property Bus Ad',
    colorScheme: 'Deep Blue',
    size: '30" x 12" Bus Panel',
    createdDate: '2024-01-11',
    printCount: 1,
    lastPrinted: '2024-01-12',
    favorite: true,
    downloadUrl: '/downloads/bus-panel-005.pdf',
    status: 'ready'
  }
];

// Mock listings for Quick Generate
const mockListings = [
  { id: 'listing-001', address: '123 Oak Street, San Francisco', price: 1250000 },
  { id: 'listing-002', address: '456 Pine Avenue, Oakland', price: 875000 },
  { id: 'listing-003', address: '789 Maple Drive, Berkeley', price: 695000 },
];

type DisplayMode = ViewMode;

const PrintMaterialsDashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<'content' | 'generate'>('content');
  const [selectedType, setSelectedType] = useState<PrintMaterialType | 'all'>('all');
  const [selectedListing, setSelectedListing] = useState<string>('');
  const [selectedGenerateType, setSelectedGenerateType] = useState<PrintMaterialType>('flyer');
  const [copySuccessId, setCopySuccessId] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => {
    // Default to cards on mobile, allow saved preference on desktop
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      if (isMobile) return 'cards';
      
      const savedView = localStorage.getItem('printDisplayMode');
      return (savedView as DisplayMode) || 'cards';
    }
    return 'cards';
  });

  // Save display preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('printDisplayMode', displayMode);
    }
  }, [displayMode]);

  // Filter content based on selections
  const filteredContent = useMemo(() => {
    return mockPrintMaterials.filter(material => {
      if (selectedType !== 'all' && material.type !== selectedType) return false;
      return true;
    });
  }, [selectedType]);

  // Calculate business-focused summary metrics
  const summaryMetrics = useMemo(() => {
    // Properties with print materials
    const propertiesWithMaterials = new Set(mockPrintMaterials.map(m => m.listingId)).size;
    
    // Total materials printed and distributed
    const totalPrintRuns = mockPrintMaterials.reduce((sum, m) => sum + m.printCount, 0);
    
    // Marketing reach estimate (different multipliers per type)
    const reachMultipliers = {
      'flyer': 1, 'lawnSign': 500, 'busPanel': 2000, 'postcard': 1, 'doorHanger': 1
    };
    const estimatedReach = mockPrintMaterials.reduce((sum, m) => {
      return sum + (m.printCount * reachMultipliers[m.type]);
    }, 0);

    // Most popular material type
    const typeUsage = mockPrintMaterials.reduce((acc, m) => {
      if (!acc[m.type]) acc[m.type] = 0;
      acc[m.type]++;
      return acc;
    }, {} as Record<string, number>);
    
    const topMaterialType = Object.entries(typeUsage)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'flyer';

    return {
      propertiesWithMaterials,
      totalPrintRuns,
      estimatedReach,
      topMaterialType,
      totalMaterials: mockPrintMaterials.length
    };
  }, []);

  // Copy download URL functionality
  const handleCopyDownload = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccessId(id);
      setTimeout(() => setCopySuccessId(null), 2000);
    } catch (err) {
      console.error('Failed to copy download URL:', err);
    }
  };

  // Toggle favorite status
  const handleToggleFavorite = (id: string) => {
    // This would typically update the backend/state
    console.log('Toggle favorite for:', id);
  };

  const getMaterialTypeInfo = (type: PrintMaterialType) => {
    return PRINT_MATERIAL_TYPES.find(t => t.id === type) || { name: type, icon: '📄' };
  };

  const getTypeBadgeColor = (type: PrintMaterialType) => {
    const colorMap: Record<string, string> = {
      flyer: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      lawnSign: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      busPanel: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      postcard: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      doorHanger: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    };
    return colorMap[type] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  // Table rendering for print materials
  const renderMaterialsTable = () => (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-2xl font-bold text-white">My Print Materials</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Material & Property
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Color & Size
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Print Count
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
              {filteredContent.map((material) => {
                const typeInfo = getMaterialTypeInfo(material.type);
                
                return (
                  <tr key={material.id} className="hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-semibold">{material.title}</p>
                        <p className="text-slate-400 text-sm">{material.listingAddress}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {material.favorite && (
                            <HeartOutlineIcon className="h-4 w-4 text-rose-400 fill-current" />
                          )}
                          <span className="text-slate-400 text-xs">Created {material.createdDate}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getTypeBadgeColor(material.type)}`}>
                        {typeInfo.icon} {typeInfo.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm">
                        <p className="text-white font-medium">{material.colorScheme}</p>
                        <p className="text-slate-400 text-xs">{material.size}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-emerald-400 font-bold text-lg">{material.printCount.toLocaleString()}</span>
                      {material.lastPrinted && (
                        <p className="text-slate-400 text-xs">Last: {material.lastPrinted}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {material.status === 'ready' ? (
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-medium">
                          Ready
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-medium">
                          Generating
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleFavorite(material.id)}
                          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                          title={material.favorite ? "Remove from favorites" : "Add to favorites"}
                        >
                          <HeartOutlineIcon className={`h-4 w-4 transition-colors ${
                            material.favorite ? 'text-rose-400 fill-current' : 'text-slate-400 hover:text-rose-400'
                          }`} />
                        </button>
                        {material.status === 'ready' && (
                          <>
                            <button
                              onClick={() => handleCopyDownload(material.downloadUrl, material.id)}
                              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                              title="Copy download link"
                            >
                              {copySuccessId === material.id ? (
                                <span className="text-emerald-400 text-xs px-1">✓</span>
                              ) : (
                                <ClipboardDocumentIcon className="h-4 w-4 text-white" />
                              )}
                            </button>
                            <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200">
                              <EyeIcon className="h-4 w-4 text-white" />
                            </button>
                            <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200">
                              <PrinterIcon className="h-4 w-4 text-white" />
                            </button>
                          </>
                        )}
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

  // Card rendering for print materials
  const renderMaterialsCards = () => (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
        <h3 className="text-2xl font-bold text-white mb-6">My Print Materials</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredContent.map((material) => {
            const typeInfo = getMaterialTypeInfo(material.type);
            
            return (
              <div
                key={material.id}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-200"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-semibold text-white">{material.title}</h4>
                    {material.favorite && (
                      <HeartOutlineIcon className="h-5 w-5 text-rose-400 fill-current" />
                    )}
                    {material.status === 'generating' && (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-orange-400"></div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleFavorite(material.id)}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                      title={material.favorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <HeartOutlineIcon className={`h-4 w-4 transition-colors ${
                        material.favorite ? 'text-rose-400 fill-current' : 'text-slate-400 hover:text-rose-400'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Property and Type Info */}
                <div className="flex items-center space-x-3 mb-4">
                  <p className="text-slate-400 text-sm">{material.listingAddress}</p>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getTypeBadgeColor(material.type)}`}>
                    {typeInfo.icon} {typeInfo.name}
                  </span>
                </div>

                {/* Material Details */}
                <div className="bg-white/5 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Color Scheme:</span>
                      <span className="text-white ml-2">{material.colorScheme}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Size:</span>
                      <span className="text-white ml-2">{material.size}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Print Count:</span>
                      <span className="text-emerald-400 ml-2">{material.printCount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Created:</span>
                      <span className="text-white ml-2">{material.createdDate}</span>
                    </div>
                  </div>
                  {material.lastPrinted && (
                    <div className="mt-2 text-sm">
                      <span className="text-slate-400">Last printed:</span>
                      <span className="text-white ml-2">{material.lastPrinted}</span>
                    </div>
                  )}
                </div>

                {/* Status and Actions */}
                {material.status === 'ready' ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg">Ready to Print</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCopyDownload(material.downloadUrl, material.id)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                        title="Copy download link"
                      >
                        {copySuccessId === material.id ? (
                          <span className="text-emerald-400 text-xs px-2">Copied!</span>
                        ) : (
                          <ClipboardDocumentIcon className="h-4 w-4 text-slate-400 hover:text-white" />
                        )}
                      </button>
                      <Button variant="ghost" size="sm" leftIcon={<EyeIcon className="h-4 w-4" />}>
                        Preview
                      </Button>
                      <Button variant="ghost" size="sm" leftIcon={<PrinterIcon className="h-4 w-4" />}>
                        Download
                      </Button>
                      <Button variant="ghost" size="sm" leftIcon={<DocumentDuplicateIcon className="h-4 w-4" />}>
                        Duplicate
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-orange-400 mx-auto mb-2"></div>
                    <p className="text-slate-300 text-sm">Generating {typeInfo.name.toLowerCase()}...</p>
                    <p className="text-slate-400 text-xs">This usually takes 1-2 minutes</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header with Summary Metrics */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Print Materials Center</h2>
              <p className="text-slate-400">Professional marketing materials that drive property visibility</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="glass" glowColor="emerald" leftIcon={<SparklesIcon className="h-5 w-5" />}>
                Generate Materials
              </Button>
            </div>
          </div>

          {/* Business-Focused Summary Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🏡</span>
                <span className="text-2xl font-bold text-white">{summaryMetrics.propertiesWithMaterials}</span>
              </div>
              <p className="text-slate-400 text-sm">Properties Marketed</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <PrinterIcon className="h-8 w-8 text-orange-400" />
                <span className="text-2xl font-bold text-white">{summaryMetrics.totalPrintRuns.toLocaleString()}</span>
              </div>
              <p className="text-slate-400 text-sm">Materials Printed</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">👥</span>
                <span className="text-2xl font-bold text-white">{(summaryMetrics.estimatedReach / 1000).toFixed(0)}K</span>
              </div>
              <p className="text-slate-400 text-sm">Estimated Reach</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{getMaterialTypeInfo(summaryMetrics.topMaterialType as PrintMaterialType).icon}</span>
                <span className="text-lg font-bold text-white capitalize">{getMaterialTypeInfo(summaryMetrics.topMaterialType as PrintMaterialType).name}</span>
              </div>
              <p className="text-slate-400 text-sm">Top Material</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle and Filters */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* View Toggle */}
            <div className="flex items-center bg-white/10 rounded-xl p-1">
              {['content', 'generate'].map((view) => (
                <button
                  key={view}
                  onClick={() => setViewMode(view as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === view
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {view === 'content' ? 'My Print Materials' : 'Quick Generate'}
                </button>
              ))}
            </div>

            {/* Filters - Only for Content View */}
            {viewMode === 'content' && (
              <div className="flex items-center gap-4">
                {/* Display Mode Toggle */}
                <ViewToggle 
                  viewMode={displayMode} 
                  onViewModeChange={setDisplayMode} 
                />

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Material Types</option>
                  {PRINT_MATERIAL_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* My Print Materials View */}
      {viewMode === 'content' && (
        <>
          {/* Content - Conditional Rendering */}
          {displayMode === 'table' ? renderMaterialsTable() : renderMaterialsCards()}
          
          {/* Empty State */}
          {filteredContent.length === 0 && (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-12">
                <div className="text-center">
                  <DocumentTextIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-xl text-white mb-2">No print materials found</p>
                  <p className="text-slate-400 mb-6">
                    {selectedType !== 'all' 
                      ? 'Try adjusting your filter selection.' 
                      : 'Start by generating your first print material.'}
                  </p>
                  <Button 
                    variant="gradient" 
                    leftIcon={<SparklesIcon className="h-5 w-5" />}
                    onClick={() => setViewMode('generate')}
                  >
                    Generate Print Materials
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Quick Generate View */}
      {viewMode === 'generate' && (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Quick Generate Print Materials</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Selection Panel */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-3">Select Property</label>
                  <select
                    value={selectedListing}
                    onChange={(e) => setSelectedListing(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Choose a listing...</option>
                    {mockListings.map((listing) => (
                      <option key={listing.id} value={listing.id}>
                        {listing.address} - ${listing.price.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-3">Material Type</label>
                  <div className="grid grid-cols-1 gap-3">
                    {PRINT_MATERIAL_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedGenerateType(type.id)}
                        className={`p-4 rounded-lg border text-left transition-all duration-200 ${
                          selectedGenerateType === type.id
                            ? 'bg-white/20 border-white/30 text-white'
                            : 'bg-white/10 border-white/20 text-slate-300 hover:bg-white/15 hover:border-white/25'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{type.icon}</span>
                          <div>
                            <div className="font-medium">{type.name}</div>
                            <div className="text-sm text-slate-400">{type.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generate Panel */}
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Generate Options</h4>
                  
                  {selectedListing ? (
                    <div className="space-y-4">
                      <div className="bg-white/5 rounded-lg p-4">
                        <h5 className="font-medium text-white mb-2">Selected Property</h5>
                        <p className="text-slate-300 text-sm">
                          {mockListings.find(l => l.id === selectedListing)?.address}
                        </p>
                        <p className="text-slate-400 text-xs">
                          ${mockListings.find(l => l.id === selectedListing)?.price.toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4">
                        <h5 className="font-medium text-white mb-2">Material Type</h5>
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{getMaterialTypeInfo(selectedGenerateType).icon}</span>
                          <div>
                            <span className="text-slate-300 text-sm block">
                              {getMaterialTypeInfo(selectedGenerateType).name}
                            </span>
                            <span className="text-slate-400 text-xs">
                              {PRINT_MATERIAL_TYPES.find(t => t.id === selectedGenerateType)?.description}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Link 
                          to={`/listings/${selectedListing}/print?type=${selectedGenerateType}`}
                          className="w-full"
                        >
                          <Button 
                            variant="gradient" 
                            size="lg" 
                            className="w-full"
                            leftIcon={<SparklesIcon className="h-5 w-5" />}
                          >
                            Generate Print Material
                          </Button>
                        </Link>
                        
                        <p className="text-slate-400 text-xs text-center">
                          This will open the print generator with your selected options
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <DocumentTextIcon className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-300 text-sm mb-2">Ready to create</p>
                      <p className="text-slate-400 text-xs">
                        Select a property to get started with print materials
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-orange-400 mb-2">📄 Material Types</h4>
                  <div className="space-y-2 text-slate-300 text-sm">
                    <p><strong>Flyers:</strong> Detailed property sheets for showings</p>
                    <p><strong>Lawn Signs:</strong> Eye-catching yard displays</p>
                    <p><strong>Postcards:</strong> Direct mail marketing pieces</p>
                    <p><strong>Door Hangers:</strong> Neighborhood marketing materials</p>
                    <p><strong>Bus Panels:</strong> Large-format advertising displays</p>
                  </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-emerald-400 mb-2">📊 Marketing Impact</h4>
                  <div className="space-y-2 text-slate-300 text-sm">
                    <p>• Properties with print materials sell 18% faster</p>
                    <p>• Lawn signs drive 40% of drive-by inquiries</p>
                    <p>• Postcards have 3.7% response rate</p>
                    <p>• Professional materials boost agent credibility</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintMaterialsDashboard;