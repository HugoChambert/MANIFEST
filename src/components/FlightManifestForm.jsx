import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { calculateWeightAndBalance } from '../utils/weightBalance';
import PassengerList from './PassengerList';
import WarningPanel from './WarningPanel';
import WeightBalanceDisplay from './WeightBalanceDisplay';
import './FlightManifestForm.css';

function FlightManifestForm({ aircraft }) {
  const [selectedAircraft, setSelectedAircraft] = useState(null);
  const [formData, setFormData] = useState({
    flightNumber: '',
    flightDate: new Date().toISOString().split('T')[0],
    pilotInCommand: '',
    secondInCommand: '',
    pilotWeight: '',
    departureTime: '',
    arrivalTime: '',
    fuelOnboard: '',
    baggageWeight: ''
  });

  const [passengers, setPassengers] = useState([]);
  const [calculations, setCalculations] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (selectedAircraft && formData.pilotWeight && formData.fuelOnboard !== '' && formData.baggageWeight !== '') {
      const result = calculateWeightAndBalance(selectedAircraft, {
        pilotWeight: parseFloat(formData.pilotWeight) || 0,
        fuelOnboard: parseFloat(formData.fuelOnboard) || 0,
        baggageWeight: parseFloat(formData.baggageWeight) || 0
      }, passengers);
      setCalculations(result);
    }
  }, [selectedAircraft, formData, passengers]);

  const handleAircraftChange = (e) => {
    const aircraftId = e.target.value;
    const aircraft = aircraftId ? JSON.parse(aircraftId) : null;
    setSelectedAircraft(aircraft);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveManifest = async () => {
    if (!selectedAircraft || !formData.flightNumber || !formData.pilotInCommand) {
      setSaveMessage('Please fill in required fields: Aircraft, Flight Number, and Pilot in Command');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    setSaving(true);
    setSaveMessage('');

    try {
      const manifestData = {
        aircraft_id: selectedAircraft.id,
        flight_number: formData.flightNumber,
        flight_date: formData.flightDate,
        pilot_in_command: formData.pilotInCommand,
        second_in_command: formData.secondInCommand || null,
        pilot_weight: parseFloat(formData.pilotWeight) || 0,
        departure_time: formData.departureTime ? new Date(formData.flightDate + 'T' + formData.departureTime).toISOString() : new Date().toISOString(),
        arrival_time: formData.arrivalTime ? new Date(formData.flightDate + 'T' + formData.arrivalTime).toISOString() : new Date().toISOString(),
        fuel_onboard: parseFloat(formData.fuelOnboard) || 0,
        total_passenger_weight: calculations ? parseFloat(calculations.totalPassengerWeight) : 0,
        total_baggage_weight: parseFloat(formData.baggageWeight) || 0,
        calculated_cg: calculations ? parseFloat(calculations.calculatedCG) : null,
        calculated_total_weight: calculations ? parseFloat(calculations.totalWeight) : null,
        is_within_limits: calculations ? calculations.isWithinLimits : false,
        warnings: calculations ? JSON.stringify(calculations.warnings) : '[]'
      };

      const { data: manifest, error: manifestError } = await supabase
        .from('flight_manifests')
        .insert([manifestData])
        .select()
        .single();

      if (manifestError) throw manifestError;

      if (passengers.length > 0) {
        const passengerData = passengers.map(p => ({
          manifest_id: manifest.id,
          passenger_name: p.name,
          weight: p.weight,
          seat_position: p.seatPosition,
          row_number: p.rowNumber
        }));

        const { error: passengersError } = await supabase
          .from('manifest_passengers')
          .insert(passengerData);

        if (passengersError) throw passengersError;
      }

      setSaveMessage('Flight manifest saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);

    } catch (error) {
      console.error('Error saving manifest:', error);
      setSaveMessage('Error saving manifest: ' + error.message);
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="manifest-form">
      <div className="form-section">
        <h3 className="section-title">Aircraft Selection</h3>
        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="aircraft">Aircraft Type & Registration</label>
            <select
              id="aircraft"
              onChange={handleAircraftChange}
              className="form-control"
              required
            >
              <option value="">Select Aircraft...</option>
              {aircraft.map(a => (
                <option key={a.id} value={JSON.stringify(a)}>
                  {a.name} - {a.registration}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedAircraft && (
          <div className="aircraft-specs">
            <div className="spec-item">
              <span className="spec-label">Max Gross Weight:</span>
              <span className="spec-value">{selectedAircraft.max_gross_weight} lbs</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Max Passengers:</span>
              <span className="spec-value">{selectedAircraft.max_passengers}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Max Fuel:</span>
              <span className="spec-value">{selectedAircraft.max_fuel_capacity} gal</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Max Baggage:</span>
              <span className="spec-value">{selectedAircraft.max_baggage_weight} lbs</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">CG Limits:</span>
              <span className="spec-value">{selectedAircraft.cg_forward_limit}" - {selectedAircraft.cg_aft_limit}"</span>
            </div>
          </div>
        )}
      </div>

      <div className="form-section">
        <h3 className="section-title">Flight Information</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="flightNumber">Flight Number *</label>
            <input
              type="text"
              id="flightNumber"
              name="flightNumber"
              value={formData.flightNumber}
              onChange={handleInputChange}
              className="form-control"
              placeholder="SA123"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="flightDate">Flight Date</label>
            <input
              type="date"
              id="flightDate"
              name="flightDate"
              value={formData.flightDate}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="departureTime">Departure Time (Outbound)</label>
            <input
              type="time"
              id="departureTime"
              name="departureTime"
              value={formData.departureTime}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label htmlFor="arrivalTime">Arrival Time (Inbound)</label>
            <input
              type="time"
              id="arrivalTime"
              name="arrivalTime"
              value={formData.arrivalTime}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Crew Information</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="pilotInCommand">Pilot in Command (PIC) *</label>
            <input
              type="text"
              id="pilotInCommand"
              name="pilotInCommand"
              value={formData.pilotInCommand}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Captain Name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="secondInCommand">Second in Command (SIC)</label>
            <input
              type="text"
              id="secondInCommand"
              name="secondInCommand"
              value={formData.secondInCommand}
              onChange={handleInputChange}
              className="form-control"
              placeholder="First Officer Name (if applicable)"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="pilotWeight">Total Pilot Weight (lbs) *</label>
            <input
              type="number"
              id="pilotWeight"
              name="pilotWeight"
              value={formData.pilotWeight}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Combined weight of all crew"
              min="0"
              step="0.1"
              required
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Fuel & Baggage</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fuelOnboard">Fuel Onboard (gallons) *</label>
            <input
              type="number"
              id="fuelOnboard"
              name="fuelOnboard"
              value={formData.fuelOnboard}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Fuel in gallons"
              min="0"
              step="0.1"
              max={selectedAircraft?.max_fuel_capacity}
              required
            />
            {selectedAircraft && (
              <small className="form-hint">
                Max: {selectedAircraft.max_fuel_capacity} gal ({(selectedAircraft.max_fuel_capacity * selectedAircraft.fuel_weight_per_gallon).toFixed(0)} lbs)
              </small>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="baggageWeight">Total Baggage Weight (lbs) *</label>
            <input
              type="number"
              id="baggageWeight"
              name="baggageWeight"
              value={formData.baggageWeight}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Total baggage weight"
              min="0"
              step="0.1"
              max={selectedAircraft?.max_baggage_weight}
              required
            />
            {selectedAircraft && (
              <small className="form-hint">Max: {selectedAircraft.max_baggage_weight} lbs</small>
            )}
          </div>
        </div>
      </div>

      <PassengerList
        passengers={passengers}
        setPassengers={setPassengers}
        maxPassengers={selectedAircraft?.max_passengers || 0}
        maxRows={selectedAircraft ? (selectedAircraft.passenger_row3_arm ? 3 : selectedAircraft.passenger_row2_arm ? 2 : 1) : 0}
      />

      {calculations && (
        <>
          <WeightBalanceDisplay
            calculations={calculations}
            aircraft={selectedAircraft}
          />
          <WarningPanel warnings={calculations.warnings} />
        </>
      )}

      <div className="form-actions">
        <button
          onClick={handleSaveManifest}
          disabled={saving || !selectedAircraft}
          className="btn-primary"
        >
          {saving ? 'Saving...' : 'Save Flight Manifest'}
        </button>
        {saveMessage && (
          <div className={`save-message ${saveMessage.includes('Error') ? 'error' : 'success'}`}>
            {saveMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default FlightManifestForm;
