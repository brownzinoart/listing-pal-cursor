import { useState } from 'react';

export const LocationContextDebug = () => {
  const [testAddress, setTestAddress] = useState('');

  const isValidAddressForContext = (address: string): boolean => {
    return address.length > 15 && 
           address.includes(',') && 
           (!!address.match(/\d{5}/) || 
            address.toLowerCase().includes('ny') ||
            address.toLowerCase().includes('ca') ||
            address.toLowerCase().includes('tx') ||
            address.toLowerCase().includes('fl'));
  };

  const testAddresses = [
    '123 Main St, New York, NY 10001',
    '456 Oak Ave, Los Angeles, CA 90210', 
    '789 Pine Rd, Austin, TX 78701',
    '321 Elm St, Miami, FL 33101',
    'Short address',
    '123 Main Street'
  ];

  return (
    <div className="p-6 bg-white border rounded-lg shadow-lg max-w-2xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">LocationContext Debug Tool</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Test Address:</label>
          <input
            type="text"
            value={testAddress}
            onChange={(e) => setTestAddress(e.target.value)}
            placeholder="Enter an address to test..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium mb-2">Validation Results:</h3>
          <div className="space-y-1 text-sm">
            <div>Length: {testAddress.length} (needs &gt; 15)</div>
            <div>Has comma: {testAddress.includes(',') ? '✅' : '❌'}</div>
            <div>Has zip/state: {
              (!!testAddress.match(/\d{5}/) || 
               testAddress.toLowerCase().includes('ny') ||
               testAddress.toLowerCase().includes('ca') ||
               testAddress.toLowerCase().includes('tx') ||
               testAddress.toLowerCase().includes('fl')) ? '✅' : '❌'
            }</div>
            <div className="font-bold mt-2">
              Widget would show: {isValidAddressForContext(testAddress) ? '✅ YES' : '❌ NO'}
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Test with sample addresses:</h3>
          <div className="space-y-2">
            {testAddresses.map((addr, i) => (
              <button
                key={i}
                onClick={() => setTestAddress(addr)}
                className={`block w-full text-left px-3 py-2 rounded border text-sm ${
                  isValidAddressForContext(addr) 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {addr} {isValidAddressForContext(addr) ? '✅' : '❌'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 