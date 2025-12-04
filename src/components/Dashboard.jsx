import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

function Dashboard({ onCreateNew, onViewManifest }) {
  const [manifests, setManifests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchManifests();
  }, []);

  async function fetchManifests() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('flight_manifests')
        .select(`
          *,
          aircraft:aircraft_types(name, registration)
        `)
        .order('flight_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setManifests(data || []);
    } catch (error) {
      console.error('Error fetching manifests:', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this manifest?')) return;

    try {
      const { error } = await supabase
        .from('flight_manifests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setManifests(manifests.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting manifest:', error.message);
      alert('Error deleting manifest');
    }
  }

  const filteredManifests = manifests.filter(manifest => {
    const matchesSearch =
      manifest.flight_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manifest.pilot_in_command.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manifest.aircraft?.registration.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'safe') return matchesSearch && manifest.is_within_limits;
    if (filter === 'warnings') return matchesSearch && !manifest.is_within_limits;
    return matchesSearch;
  });

  const stats = {
    total: manifests.length,
    safe: manifests.filter(m => m.is_within_limits).length,
    warnings: manifests.filter(m => !m.is_within_limits).length,
    today: manifests.filter(m => m.flight_date === new Date().toISOString().split('T')[0]).length
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading manifests...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Flight Manifest Dashboard</h2>
          <p className="dashboard-subtitle">View and manage all flight manifests</p>
        </div>
        <button onClick={onCreateNew} className="btn-create-new">
          <span className="btn-icon">+</span>
          Create New Manifest
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">📋</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Manifests</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon safe">✓</div>
          <div className="stat-content">
            <div className="stat-value">{stats.safe}</div>
            <div className="stat-label">Within Limits</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">⚠</div>
          <div className="stat-content">
            <div className="stat-value">{stats.warnings}</div>
            <div className="stat-label">With Warnings</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon today">📅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.today}</div>
            <div className="stat-label">Today's Flights</div>
          </div>
        </div>
      </div>

      <div className="dashboard-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by flight number, pilot, or registration..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({stats.total})
          </button>
          <button
            className={`filter-tab ${filter === 'safe' ? 'active' : ''}`}
            onClick={() => setFilter('safe')}
          >
            Safe ({stats.safe})
          </button>
          <button
            className={`filter-tab ${filter === 'warnings' ? 'active' : ''}`}
            onClick={() => setFilter('warnings')}
          >
            Warnings ({stats.warnings})
          </button>
        </div>
      </div>

      <div className="manifests-table-container">
        {filteredManifests.length === 0 ? (
          <div className="empty-state-large">
            <div className="empty-icon">📋</div>
            <h3>No manifests found</h3>
            <p>
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Create your first flight manifest to get started'}
            </p>
            {!searchTerm && (
              <button onClick={onCreateNew} className="btn-create-first">
                Create First Manifest
              </button>
            )}
          </div>
        ) : (
          <table className="manifests-table">
            <thead>
              <tr>
                <th>Flight #</th>
                <th>Date</th>
                <th>Aircraft</th>
                <th>Pilot in Command</th>
                <th>Weight</th>
                <th>CG</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredManifests.map(manifest => (
                <tr key={manifest.id}>
                  <td className="flight-number">{manifest.flight_number}</td>
                  <td>{new Date(manifest.flight_date).toLocaleDateString()}</td>
                  <td>
                    <div className="aircraft-cell">
                      <div className="aircraft-name">{manifest.aircraft?.name}</div>
                      <div className="aircraft-reg">{manifest.aircraft?.registration}</div>
                    </div>
                  </td>
                  <td>{manifest.pilot_in_command}</td>
                  <td>{parseFloat(manifest.calculated_total_weight).toFixed(0)} lbs</td>
                  <td>{manifest.calculated_cg ? parseFloat(manifest.calculated_cg).toFixed(2) + '"' : 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${manifest.is_within_limits ? 'safe' : 'warning'}`}>
                      {manifest.is_within_limits ? '✓ Safe' : '⚠ Warning'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => onViewManifest(manifest.id)}
                        className="btn-action view"
                        title="View Manifest"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(manifest.id)}
                        className="btn-action delete"
                        title="Delete Manifest"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
