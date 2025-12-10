import React, { useState } from 'react';
import { bookingAPI } from '../api/api';

function ApiTest() {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    setTestResult('Testing API connection...');
    
    try {
      // Test if token exists
      const token = localStorage.getItem('token');
      setTestResult(prev => prev + `\nToken exists: ${!!token}`);
      
      if (token) {
        setTestResult(prev => prev + `\nToken: ${token.substring(0, 20)}...`);
      }
      
      // Test API call
      const response = await bookingAPI.getUserBookings();
      setTestResult(prev => prev + `\nAPI Response Status: ${response.status}`);
      setTestResult(prev => prev + `\nAPI Response Data: ${JSON.stringify(response.data, null, 2)}`);
      
    } catch (error) {
      setTestResult(prev => prev + `\nError: ${error.message}`);
      if (error.response) {
        setTestResult(prev => prev + `\nError Status: ${error.response.status}`);
        setTestResult(prev => prev + `\nError Data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', margin: '20px', borderRadius: '8px' }}>
      <h3>API Connection Test</h3>
      <button 
        onClick={testApi} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test API'}
      </button>
      
      {testResult && (
        <pre style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderRadius: '5px',
          fontSize: '12px',
          whiteSpace: 'pre-wrap',
          maxHeight: '400px',
          overflow: 'auto'
        }}>
          {testResult}
        </pre>
      )}
    </div>
  );
}

export default ApiTest;