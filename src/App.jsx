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
                <path d="M58 28l-22-10-4-12c0-1.1-.9-2-2-2s-2 .9-2 2l-4 12-22 10c-1.1.5-1.6 1.8-1.1 2.9.3.7 1 1.1 1.7 1.1.3 0 .6-.1.9-.2l20-9 2 16-8 4c-.8.4-1.2 1.3-.9 2.1.2.6.8 1 1.4 1 .2 0 .4 0 .6-.1L30 42l12 4c.2.1.4.1.6.1.6 0 1.2-.4 1.4-1 .3-.8-.1-1.7-.9-2.1l-8-4 2-16 20 9c.3.1.6.2.9.2.7 0 1.4-.4 1.7-1.1.5-1.1 0-2.4-1.1-2.9z"/>
              </svg>
            </div>
            <h1>Southern Airways</h1>
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
        <p>Southern Airways Flight Operations System &copy; {new Date().getFullYear()}</p>
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
