import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './ManifestViewer.css';

function ManifestViewer({ manifestId, onClose }) {
  const [manifest, setManifest] = useState(null);
  const [aircraft, setAircraft] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (manifestId) {
      fetchManifestData();
    }
  }, [manifestId]);

  async function fetchManifestData() {
    try {
      setLoading(true);

      const { data: manifestData, error: manifestError } = await supabase
        .from('flight_manifests')
        .select('*')
        .eq('id', manifestId)
        .single();

      if (manifestError) throw manifestError;

      const { data: aircraftData, error: aircraftError } = await supabase
        .from('aircraft_types')
        .select('*')
        .eq('id', manifestData.aircraft_id)
        .single();

      if (aircraftError) throw aircraftError;

      const { data: passengersData, error: passengersError } = await supabase
        .from('manifest_passengers')
        .select('*')
        .eq('manifest_id', manifestId)
        .order('row_number')
        .order('seat_position');

      if (passengersError) throw passengersError;

      setManifest(manifestData);
      setAircraft(aircraftData);
      setPassengers(passengersData || []);
    } catch (error) {
      console.error('Error fetching manifest:', error.message);
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="manifest-viewer-loading">
        <div className="loading-spinner"></div>
        <p>Loading manifest...</p>
      </div>
    );
  }

  if (!manifest || !aircraft) {
    return (
      <div className="manifest-viewer-error">
        <p>Error loading manifest data</p>
        <button onClick={onClose} className="btn-close-error">Close</button>
      </div>
    );
  }

  const warnings = JSON.parse(manifest.warnings || '[]');
  const departureDate = new Date(manifest.departure_time);
  const arrivalDate = new Date(manifest.arrival_time);

  return (
    <div className="manifest-viewer">
      <div className="viewer-actions no-print">
        <button onClick={onClose} className="btn-back">
          ← Back to Dashboard
        </button>
        <button onClick={handlePrint} className="btn-print">
          🖨 Print Manifest
        </button>
      </div>

      <div className="manifest-document">
        <div className="manifest-header-section">
          <div className="company-header">
            <h1>SOUTHERN AIRWAYS</h1>
            <p className="header-subtitle">Flight Manifest & Weight Balance</p>
          </div>
          <div className="manifest-status-header">
            <div className={`status-indicator ${manifest.is_within_limits ? 'safe' : 'unsafe'}`}>
              {manifest.is_within_limits ? '✓ AIRWORTHY' : '✗ NOT AIRWORTHY'}
            </div>
          </div>
        </div>

        <div className="manifest-info-grid">
          <div className="info-section">
            <h3>Flight Information</h3>
            <div className="info-row">
              <span className="info-label">Flight Number:</span>
              <span className="info-value">{manifest.flight_number}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Date:</span>
              <span className="info-value">{new Date(manifest.flight_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Departure:</span>
              <span className="info-value">{departureDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Arrival:</span>
              <span className="info-value">{arrivalDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          <div className="info-section">
            <h3>Aircraft Details</h3>
            <div className="info-row">
              <span className="info-label">Type:</span>
              <span className="info-value">{aircraft.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Registration:</span>
              <span className="info-value">{aircraft.registration}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Max Gross Weight:</span>
              <span className="info-value">{aircraft.max_gross_weight} lbs</span>
            </div>
            <div className="info-row">
              <span className="info-label">CG Limits:</span>
              <span className="info-value">{aircraft.cg_forward_limit}" - {aircraft.cg_aft_limit}"</span>
            </div>
          </div>

          <div className="info-section">
            <h3>Crew</h3>
            <div className="info-row">
              <span className="info-label">Pilot in Command:</span>
              <span className="info-value">{manifest.pilot_in_command}</span>
            </div>
            {manifest.second_in_command && (
              <div className="info-row">
                <span className="info-label">Second in Command:</span>
                <span className="info-value">{manifest.second_in_command}</span>
              </div>
            )}
            <div className="info-row">
              <span className="info-label">Total Crew Weight:</span>
              <span className="info-value">{manifest.pilot_weight} lbs</span>
            </div>
          </div>
        </div>

        <div className="weight-balance-section">
          <h3>Weight & Balance Calculation</h3>
          <table className="calculation-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Weight (lbs)</th>
                <th>Arm (inches)</th>
                <th>Moment (lb-in)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Basic Empty Weight</td>
                <td>{aircraft.basic_empty_weight}</td>
                <td>{((aircraft.cg_forward_limit + aircraft.cg_aft_limit) / 2).toFixed(2)}</td>
                <td>{(aircraft.basic_empty_weight * ((aircraft.cg_forward_limit + aircraft.cg_aft_limit) / 2)).toFixed(0)}</td>
              </tr>
              <tr>
                <td>Pilot & Crew</td>
                <td>{manifest.pilot_weight}</td>
                <td>{aircraft.pilot_station_arm}</td>
                <td>{(manifest.pilot_weight * aircraft.pilot_station_arm).toFixed(0)}</td>
              </tr>
              <tr>
                <td>Passengers ({passengers.length})</td>
                <td>{manifest.total_passenger_weight}</td>
                <td>Variable</td>
                <td>—</td>
              </tr>
              <tr>
                <td>Fuel ({(manifest.fuel_onboard).toFixed(1)} gal)</td>
                <td>{(manifest.fuel_onboard * aircraft.fuel_weight_per_gallon).toFixed(1)}</td>
                <td>{aircraft.fuel_arm}</td>
                <td>{(manifest.fuel_onboard * aircraft.fuel_weight_per_gallon * aircraft.fuel_arm).toFixed(0)}</td>
              </tr>
              <tr>
                <td>Baggage</td>
                <td>{manifest.total_baggage_weight}</td>
                <td>{aircraft.baggage_arm}</td>
                <td>{(manifest.total_baggage_weight * aircraft.baggage_arm).toFixed(0)}</td>
              </tr>
              <tr className="total-row">
                <td><strong>Total Loaded Weight</strong></td>
                <td><strong>{parseFloat(manifest.calculated_total_weight).toFixed(1)}</strong></td>
                <td></td>
                <td></td>
              </tr>
              <tr className="total-row">
                <td><strong>Center of Gravity</strong></td>
                <td></td>
                <td><strong>{parseFloat(manifest.calculated_cg).toFixed(2)}"</strong></td>
                <td></td>
              </tr>
            </tbody>
          </table>

          <div className="weight-summary">
            <div className="summary-item">
              <span className="summary-label">Weight Margin:</span>
              <span className={`summary-value ${(aircraft.max_gross_weight - manifest.calculated_total_weight) < 0 ? 'negative' : 'positive'}`}>
                {(aircraft.max_gross_weight - manifest.calculated_total_weight).toFixed(1)} lbs
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">CG Position:</span>
              <span className="summary-value">
                {manifest.calculated_cg ? `${parseFloat(manifest.calculated_cg).toFixed(2)}" (${manifest.is_within_limits ? 'Within Limits' : 'OUT OF LIMITS'})` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {passengers.length > 0 && (
          <div className="passengers-section">
            <h3>Passenger Manifest</h3>
            <table className="passengers-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Seat</th>
                  <th>Row</th>
                  <th>Weight (lbs)</th>
                </tr>
              </thead>
              <tbody>
                {passengers.map((passenger, index) => (
                  <tr key={passenger.id}>
                    <td>{index + 1}</td>
                    <td>{passenger.passenger_name}</td>
                    <td>{passenger.seat_position}</td>
                    <td>Row {passenger.row_number}</td>
                    <td>{passenger.weight}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td colSpan="4"><strong>Total Passengers: {passengers.length}</strong></td>
                  <td><strong>{manifest.total_passenger_weight} lbs</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="warnings-section">
            <h3>Warnings & Recommendations</h3>
            {warnings.map((warning, index) => (
              <div key={index} className={`warning-box ${warning.type}`}>
                <div className="warning-title">{warning.title}</div>
                <div className="warning-message">{warning.message}</div>
                <div className="warning-recommendation">
                  <strong>Recommendation:</strong> {warning.recommendation}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="manifest-footer">
          <div className="signature-section">
            <div className="signature-line">
              <div className="signature-label">Pilot in Command Signature</div>
              <div className="signature-box"></div>
              <div className="signature-date">Date: _____________</div>
            </div>
          </div>
          <div className="footer-note">
            <p><strong>Note:</strong> This manifest must be retained for 30 days per FAA regulations (14 CFR § 135.63).</p>
            <p className="generated-date">Generated: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManifestViewer;
