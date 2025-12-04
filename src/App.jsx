import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import FlightManifestForm from './components/FlightManifestForm';
import './App.css';

function App() {
  const [aircraft, setAircraft] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
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
          <h1>Southern Airways</h1>
          <h2>Flight Manifest & Weight Balance</h2>
        </div>
      </header>
      <main className="app-main">
        <FlightManifestForm aircraft={aircraft} />
      </main>
    </div>
  );
}

export default App;
