import React, { useMemo } from 'react';
import { 
  CurrencyDollarIcon, 
  HomeIcon,
  CalendarDaysIcon,
  FireIcon,
  EyeIcon,
  UserGroupIcon
} from '@heroicons/react/24/solid';
import { ChartBarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import PortfolioErrorBoundary from '../shared/PortfolioErrorBoundary';
import ModernDashboardLayout from '../shared/ModernDashboardLayout';
import { AreaChart } from '../shared/charts';
import { Listing } from '../../types';
import {
  mockListings,
  generateTimeSeriesData,
  generatePropertyPerformanceData
} from '../../data/mockPortfolioData';

// Generate modern data
const timeSeriesData = generateTimeSeriesData();
const propertyPerformanceData = generatePropertyPerformanceData();

const ModernPortfolioAnalytics: React.FC = () => {
  console.log('Modern Portfolio Analytics rendering...');

  // Calculate hero metrics
  const heroMetrics = useMemo(() => {
    const totalValue = mockListings.reduce((sum, l) => sum + (l.price || 0), 0);
    const activeListings = mockListings.filter(l => l.status === 'active').length;
    const currentMonth = timeSeriesData[timeSeriesData.length - 1];
    const previousMonth = timeSeriesData[timeSeriesData.length - 2];
    
    const leadGrowth = previousMonth ? 
      Math.round(((currentMonth.leads - previousMonth.leads) / previousMonth.leads) * 100) : 0;
    
    const hotProperties = propertyPerformanceData.filter(p => p.performanceTemp === 'hot').length;
    const avgDaysOnMarket = Math.round(
      propertyPerformanceData.reduce((sum, p) => sum + p.daysOnMarket, 0) / propertyPerformanceData.length
    );

    return {
      totalValue,
      activeListings,
      monthlyLeads: currentMonth.leads,
      leadGrowth,
      hotProperties,
      avgDaysOnMarket
    };
  }, []);

  // Get top performing properties
  const topProperties = useMemo(() => {
    return propertyPerformanceData
      .filter(p => p.performanceTemp === 'hot')
      .sort((a, b) => b.monthlyLeads - a.monthlyLeads)
      .slice(0, 6);
  }, []);

  // Properties needing attention
  const needsAttention = useMemo(() => {
    return propertyPerformanceData
      .filter(p => p.needsAttention)
      .slice(0, 3);
  }, []);

  const headerActions = (
    <div className="text-slate-400 text-sm">
      <span className="text-emerald-400 font-medium">{mockListings.filter(l => l.status === 'active').length}</span> Active • 
      <span className="text-blue-400 font-medium ml-1">${(heroMetrics.totalValue / 1000000).toFixed(1)}M</span> Portfolio
    </div>
  );

  return (
    <PortfolioErrorBoundary>
      <ModernDashboardLayout
        title="Portfolio Command Center"
        subtitle="Your real estate empire at a glance"
        actions={headerActions}
      >
        {/* Data Explanation */}
        <div className="text-center mb-12">
          {/* Data Source Explanation */}
          <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="text-blue-400 mr-3">ℹ️</div>
              <h3 className="text-white font-semibold">What Your Data Represents</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="text-emerald-400 font-medium mb-2">Leads</h4>
                <p className="text-slate-300">
                  Potential buyers who contacted you about properties via website forms, phone calls, open houses, or referrals.
                </p>
              </div>
              <div>
                <h4 className="text-blue-400 font-medium mb-2">Showings</h4>
                <p className="text-slate-300">
                  In-person or virtual property tours scheduled with qualified prospects who expressed serious interest.
                </p>
              </div>
              <div>
                <h4 className="text-amber-400 font-medium mb-2">Offers</h4>
                <p className="text-slate-300">
                  Formal purchase offers submitted by buyers, representing concrete interest in your listings.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-slate-400 text-xs">
                Data sources: CRM systems, website analytics, manual tracking, and lead generation platforms
              </p>
            </div>
          </div>
        </div>

          {/* Hero Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            
            {/* Total Portfolio Value */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <CurrencyDollarIcon className="h-12 w-12 text-green-400" />
                  <div className="text-right">
                    <p className="text-slate-400 text-sm font-medium">Portfolio Value</p>
                    <p className="text-3xl font-bold text-white">
                      ${(heroMetrics.totalValue / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-green-400 text-sm">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  +12.5% this quarter
                </div>
              </div>
            </div>

            {/* Monthly Leads */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <UserGroupIcon className="h-12 w-12 text-emerald-400" />
                  <div className="text-right">
                    <p className="text-slate-400 text-sm font-medium">This Month's Leads</p>
                    <p className="text-3xl font-bold text-white">{heroMetrics.monthlyLeads}</p>
                  </div>
                </div>
                <div className={`flex items-center text-sm ${heroMetrics.leadGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  {heroMetrics.leadGrowth >= 0 ? '+' : ''}{heroMetrics.leadGrowth}% vs last month
                </div>
              </div>
            </div>

            {/* Hot Properties */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <FireIcon className="h-12 w-12 text-orange-400" />
                  <div className="text-right">
                    <p className="text-slate-400 text-sm font-medium">Hot Properties</p>
                    <p className="text-3xl font-bold text-white">{heroMetrics.hotProperties}</p>
                  </div>
                </div>
                <div className="flex items-center text-orange-400 text-sm">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse"></span>
                  High activity
                </div>
              </div>
            </div>

            {/* Days on Market */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <CalendarDaysIcon className="h-12 w-12 text-purple-400" />
                  <div className="text-right">
                    <p className="text-slate-400 text-sm font-medium">Avg Days on Market</p>
                    <p className="text-3xl font-bold text-white">{heroMetrics.avgDaysOnMarket}</p>
                  </div>
                </div>
                <div className="flex items-center text-purple-400 text-sm">
                  <ChartBarIcon className="h-4 w-4 mr-1" />
                  Market benchmark: 35
                </div>
              </div>
            </div>
          </div>

          {/* Lead Generation Performance - Client Conversation Starter */}
          <div className="relative group mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 overflow-hidden">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Lead Generation Momentum</h2>
                <p className="text-slate-400">Perfect for showing clients your growing pipeline and market expertise</p>
              </div>
              <div className="h-80 w-full">
                <AreaChart
                  data={timeSeriesData}
                  areas={[
                    { key: 'leads', color: '#10B981', name: 'Buyer Inquiries', fillOpacity: 0.4 },
                    { key: 'offers', color: '#F59E0B', name: 'Offers Generated', fillOpacity: 0.3 }
                  ]}
                  xAxisKey="month"
                  height={300}
                  showGrid={true}
                  showLegend={true}
                />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-emerald-400 font-bold text-lg">{heroMetrics.monthlyLeads}</p>
                  <p className="text-slate-400 text-sm">This Month</p>
                </div>
                <div>
                  <p className="text-amber-400 font-bold text-lg">
                    {timeSeriesData[timeSeriesData.length - 1]?.offers || 0}
                  </p>
                  <p className="text-slate-400 text-sm">Offers This Month</p>
                </div>
                <div>
                  <p className="text-blue-400 font-bold text-lg">{heroMetrics.leadGrowth >= 0 ? '+' : ''}{heroMetrics.leadGrowth}%</p>
                  <p className="text-slate-400 text-sm">Growth Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Property Performance Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            
            {/* Hot Properties */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Top Performers</h3>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium">
                    {topProperties.length} properties
                  </span>
                </div>
                <div className="space-y-4">
                  {topProperties.map((property) => (
                    <div key={property.listingId} className="bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-semibold">{property.property}</h4>
                          <p className="text-slate-400 text-sm">{property.city}, {property.state}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-emerald-400 font-bold">{property.monthlyLeads} leads</p>
                          <p className="text-slate-400 text-sm">${(property.price / 1000000).toFixed(1)}M</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center">
                        <div className="flex-1 bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-emerald-400 rounded-full h-2 transition-all duration-500"
                            style={{ width: `${Math.min(100, (property.monthlyLeads / 10) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="ml-3 text-emerald-400 text-xs font-medium">
                          {property.performanceTemp.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Required - Immediate Business Impact */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-red-500/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Action Required Today</h3>
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium">
                    {needsAttention.length} {needsAttention.length === 1 ? 'property' : 'properties'}
                  </span>
                </div>
                {needsAttention.length > 0 ? (
                  <div className="space-y-4">
                    {needsAttention.map((property) => (
                      <div key={property.listingId} className="bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-all duration-200 border-l-4 border-amber-400">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="text-white font-semibold">{property.property}</h4>
                            <p className="text-slate-400 text-sm">{property.city}, {property.state} • ${(property.price / 1000000).toFixed(1)}M</p>
                          </div>
                          <div className="text-right">
                            <p className="text-amber-400 font-bold">{property.daysOnMarket} days</p>
                            <p className="text-red-400 text-sm font-medium">{property.monthlyLeads} leads/month</p>
                          </div>
                        </div>
                        <div className="bg-amber-500/10 rounded-lg p-3">
                          <p className="text-amber-400 text-sm font-medium mb-1">
                            Recommended Action:
                          </p>
                          <p className="text-amber-300 text-sm">
                            {property.actionNeeded || 'Review pricing and marketing strategy'}
                          </p>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-slate-400 text-xs">
                            Potential monthly commission loss: ${((property.price * 0.03) / 12).toLocaleString()}
                          </span>
                          <button className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-medium hover:bg-amber-500/30 transition-colors">
                            Take Action
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 mx-auto mb-2 bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-emerald-400 font-semibold">Portfolio Running Smoothly!</p>
                    <p className="text-slate-400 text-sm mt-1">All properties are performing within target metrics</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Client Conversation Starters - Business Development Focus */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Client Talking Points</h3>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                  Show prospects your expertise
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-2xl p-6 border border-blue-500/20">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Market Performance</h4>
                      <p className="text-blue-400 text-sm font-medium">+23% vs. local average</p>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm mb-3">
                    "My portfolio consistently outperforms the local market, with properties selling 23% faster than average."
                  </p>
                  <div className="text-blue-400 text-xs font-medium">
                    Perfect for: Listing presentations
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-2xl p-6 border border-emerald-500/20">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Lead Quality Score</h4>
                      <p className="text-emerald-400 text-sm font-medium">85% qualified buyers</p>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm mb-3">
                    "My marketing attracts serious buyers - 85% of inquiries convert to showings or offers."
                  </p>
                  <div className="text-emerald-400 text-xs font-medium">
                    Perfect for: Seller confidence building
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-2xl p-6 border border-amber-500/20">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Portfolio Value</h4>
                      <p className="text-amber-400 text-sm font-medium">${(heroMetrics.totalValue / 1000000).toFixed(1)}M under management</p>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm mb-3">
                    "I currently manage ${(heroMetrics.totalValue / 1000000).toFixed(1)} million in active listings, demonstrating trusted expertise in your market."
                  </p>
                  <div className="text-amber-400 text-xs font-medium">
                    Perfect for: Establishing credibility
                  </div>
                </div>
              </div>

              {/* Market Opportunity Alert */}
              <div className="mt-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="text-white font-semibold">Expansion Opportunity</h4>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Based on current lead velocity and market conditions, your portfolio could support 2-3 additional premium listings. 
                  Spring market approaching - perfect timing for expansion.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-purple-400 text-xs font-medium">
                    Projected additional monthly commission: ${((heroMetrics.totalValue * 0.02) / 12).toLocaleString()}
                  </span>
                  <button className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-medium hover:bg-purple-500/30 transition-colors">
                    Plan Expansion
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* High-Value Action Center */}
          <div className="text-center pb-12">
            <h3 className="text-white text-lg font-semibold mb-6">Ready to impress clients and grow your business?</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 transform hover:scale-105 shadow-lg">
                Generate Market Report
                <div className="text-emerald-100 text-xs font-normal mt-1">Perfect for client meetings</div>
              </button>
              
              <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-lg">
                Plan Listing Strategy  
                <div className="text-blue-100 text-xs font-normal mt-1">Maximize your pipeline</div>
              </button>
              
              <button className="px-8 py-4 bg-white/10 backdrop-blur-lg border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/15 transition-all duration-200 shadow-lg">
                Share Success Story
                <div className="text-slate-300 text-xs font-normal mt-1">Social media ready</div>
              </button>
            </div>
            
            {/* Professional Note */}
            <div className="mt-8 text-center">
              <p className="text-slate-400 text-sm">
                <span className="text-slate-300 font-medium">Pro Tip:</span> Show this dashboard to prospects during listing presentations to demonstrate your tech-savvy approach and portfolio success.
              </p>
            </div>
          </div>

      </ModernDashboardLayout>
    </PortfolioErrorBoundary>
  );
};

export default ModernPortfolioAnalytics;