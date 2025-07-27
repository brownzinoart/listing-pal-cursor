import React from 'react';

const PortfolioAnalyticsDebug: React.FC = () => {
  console.log('🔍 Portfolio Analytics Debug component rendering...');
  console.log('📍 Current time:', new Date().toISOString());

  return (
    <div className="min-h-screen bg-brand-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <h1 className="text-2xl font-bold mb-2">✅ Portfolio Analytics Debug</h1>
          <p className="text-lg">If you can see this message, the routing is working correctly!</p>
        </div>

        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
          <h2 className="text-xl font-semibold mb-2">🔍 Debug Information:</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Route: /dashboard/portfolio</li>
            <li>Component: PortfolioAnalyticsDebug</li>
            <li>Authentication: Working (you're seeing this page)</li>
            <li>Routing: Working (React Router found this component)</li>
            <li>Styling: Working (Tailwind classes are applied)</li>
          </ul>
        </div>

        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          <h2 className="text-xl font-semibold mb-2">⚠️ Next Steps:</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>Check browser console for any error messages</li>
            <li>Verify that this debug component renders completely</li>
            <li>Test adding simple components one by one</li>
            <li>Switch back to full PortfolioAnalyticsDashboard once this works</li>
          </ol>
        </div>

        <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded">
          <h2 className="text-xl font-semibold mb-2">🎯 Test Navigation:</h2>
          <p className="mb-2">Try navigating to other dashboard sections and back to verify navigation works:</p>
          <div className="space-x-2">
            <a href="/dashboard" className="text-blue-600 underline">Dashboard Home</a>
            <a href="/dashboard/social" className="text-blue-600 underline">Social Posts</a>
            <a href="/dashboard/ads" className="text-blue-600 underline">Paid Ads</a>
            <a href="/dashboard/portfolio" className="text-blue-600 underline">Portfolio (this page)</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioAnalyticsDebug;