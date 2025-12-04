import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Dashboard from './components/Dashboard';
import FlightManifestForm from './components/FlightManifestForm';
import ManifestViewer from './components/ManifestViewer';
import Toast from './components/Toast';
import './App.css';

function App() {
  const [aircraft, setAircraft] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedManifestId, setSelectedManifestId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchAircraft();
  }, []);

  async function fetchAircraft() {
    try {
      const { data, error } = await supabase
        .from('aircraft_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setAircraft(data || []);
    } catch (error) {
      console.error('Error fetching aircraft:', error.message);
      showToast('error', 'Failed to load aircraft data');
    } finally {
      setLoading(false);
    }
  }

  function showToast(type, message) {
    setToast({ type, message });
  }

  function handleCreateNew() {
    setCurrentView('create');
    setSelectedManifestId(null);
  }

  function handleViewManifest(manifestId) {
    setSelectedManifestId(manifestId);
    setCurrentView('view');
  }

  function handleBackToDashboard() {
    setCurrentView('dashboard');
    setSelectedManifestId(null);
  }

  function handleSaveSuccess(result) {
    if (result.type === 'success') {
      showToast('success', result.message);
      setCurrentView('dashboard');
    } else {
      showToast(result.type, result.message);
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading aircraft data...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-logo-section">
            <div className="header-logo">
              <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="12" width="48" height="6" rx="1" fill="currentColor"/>
                <rect x="8" y="22" width="48" height="6" rx="1" fill="currentColor"/>
                <rect x="8" y="32" width="48" height="6" rx="1" fill="currentColor"/>
                <rect x="8" y="42" width="36" height="6" rx="1" fill="currentColor"/>
                <circle cx="52" cy="45" r="4" fill="currentColor"/>
              </svg>
            </div>
            <h1>MANIFEST</h1>
            <div className="header-badge">Flight Operations</div>
          </div>
          <h2>Flight Manifest & Weight Balance System</h2>
        </div>
      </header>

      <main className="app-main">
        {currentView === 'dashboard' && (
          <Dashboard
            onCreateNew={handleCreateNew}
            onViewManifest={handleViewManifest}
          />
        )}

        {currentView === 'create' && (
          <FlightManifestForm
            aircraft={aircraft}
            onSaveSuccess={handleSaveSuccess}
            onCancel={handleBackToDashboard}
          />
        )}

        {currentView === 'view' && selectedManifestId && (
          <ManifestViewer
            manifestId={selectedManifestId}
            onClose={handleBackToDashboard}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>MANIFEST Flight Operations System &copy; {new Date().getFullYear()}</p>
        <p className="footer-note">Compliant with FAA regulations (14 CFR § 135.63)</p>
      </footer>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
