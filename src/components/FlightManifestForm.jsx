import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { calculateWeightAndBalance } from '../utils/weightBalance';
import SeatModal from './SeatModal';
import CargoModal from './CargoModal';
import WarningPanel from './WarningPanel';
import WeightBalanceDisplay from './WeightBalanceDisplay';
import SeatingChart from './SeatingChart';
import PassengerList from './PassengerList';
import './FlightManifestForm.css';

function FlightManifestForm({ aircraft, onSaveSuccess, onCancel }) {
  const [selectedAircraft, setSelectedAircraft] = useState(null);
  const [formData, setFormData] = useState({
    flightNumber: '',
    flightDate: new Date().toISOString().split('T')[0],
    pilotInCommand: '',
    secondInCommand: '',
    pilotWeight: '',
    departureTime: '',
    arrivalTime: '',
    fuelOnboard: ''
  });

  const [passengers, setPassengers] = useState([]);
  const [baggage, setBaggage] = useState({ forward: 0, aft: 0 });
  const [calculations, setCalculations] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [seatModalOpen, setSeatModalOpen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [cargoModalOpen, setCargoModalOpen] = useState(false);
  const [selectedCargoArea, setSelectedCargoArea] = useState(null);

  useEffect(() => {
    if (selectedAircraft && formData.pilotWeight && formData.fuelOnboard !== '') {
      const totalBaggage = baggage.forward + baggage.aft;
      const result = calculateWeightAndBalance(selectedAircraft, {
        pilotWeight: parseFloat(formData.pilotWeight) || 0,
        fuelOnboard: parseFloat(formData.fuelOnboard) || 0,
        baggageWeight: totalBaggage
      }, passengers);
      setCalculations(result);
    }
  }, [selectedAircraft, formData, passengers, baggage]);

  const handleAircraftChange = (e) => {
    const aircraftId = e.target.value;
    if (aircraftId) {
      const foundAircraft = aircraft.find(a => a.id === aircraftId);
      setSelectedAircraft(foundAircraft || null);
    } else {
      setSelectedAircraft(null);
    }
    setPassengers([]);
    setBaggage({ forward: 0, aft: 0 });
    setErrors({ ...errors, aircraft: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors({ ...errors, [name]: '' });
  };

  const handleSeatClick = (seatId, seatInfo) => {
    setSelectedSeat({ seatId, seatInfo });
    setSeatModalOpen(true);
  };

  const handleSaveSeat = (passengerData) => {
    setPassengers(prev => {
      const filtered = prev.filter(p =>
        !(p.rowNumber === passengerData.rowNumber && p.seatPosition === passengerData.seatPosition)
      );
      return [...filtered, passengerData];
    });
  };

  const handleRemoveSeat = (seatId) => {
    setPassengers(prev => prev.filter(p => {
      const currentSeatId = `${p.rowNumber}${p.seatPosition}`;
      return currentSeatId !== seatId;
    }));
  };

  const handleSwapSeats = (source, target) => {
    setPassengers(prev => {
      const updated = prev.map(p => {
        if (source.occupant && p.rowNumber === source.row && p.seatPosition === source.letter) {
          return {
            ...p,
            rowNumber: target.row,
            seatPosition: target.letter
          };
        }
        if (target.occupant && p.rowNumber === target.row && p.seatPosition === target.letter) {
          return {
            ...p,
            rowNumber: source.row,
            seatPosition: source.letter
          };
        }
        return p;
      });
      return updated;
    });
  };

  const handleCargoClick = (area) => {
    setSelectedCargoArea(area);
    setCargoModalOpen(true);
  };

  const handleSaveCargo = (area, weight) => {
    setBaggage(prev => ({
      ...prev,
      [area]: weight
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedAircraft) {
      newErrors.aircraft = 'Please select an aircraft';
    }
    if (!formData.flightNumber.trim()) {
      newErrors.flightNumber = 'Flight number is required';
    }
    if (!formData.pilotInCommand.trim()) {
      newErrors.pilotInCommand = 'Pilot in Command name is required';
    }
    if (!formData.pilotWeight || parseFloat(formData.pilotWeight) <= 0) {
      newErrors.pilotWeight = 'Valid pilot weight is required';
    }
    if (formData.fuelOnboard === '' || parseFloat(formData.fuelOnboard) < 0) {
      newErrors.fuelOnboard = 'Valid fuel amount is required';
    }
    if (selectedAircraft && parseFloat(formData.fuelOnboard) > selectedAircraft.max_fuel_capacity) {
      newErrors.fuelOnboard = `Fuel exceeds maximum capacity of ${selectedAircraft.max_fuel_capacity} gallons`;
    }
    if (!formData.departureTime) {
      newErrors.departureTime = 'Departure time is required';
    }
    if (!formData.arrivalTime) {
      newErrors.arrivalTime = 'Arrival time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveManifest = async () => {
    if (!validateForm()) {
      onSaveSuccess?.({ type: 'error', message: 'Please fix validation errors before saving' });
      return;
    }

    setSaving(true);

    try {
      const totalBaggage = baggage.forward + baggage.aft;
      const manifestData = {
        aircraft_id: selectedAircraft.id,
        flight_number: formData.flightNumber,
        flight_date: formData.flightDate,
        pilot_in_command: formData.pilotInCommand,
        second_in_command: formData.secondInCommand || null,
        pilot_weight: parseFloat(formData.pilotWeight) || 0,
        departure_time: new Date(formData.flightDate + 'T' + formData.departureTime).toISOString(),
        arrival_time: new Date(formData.flightDate + 'T' + formData.arrivalTime).toISOString(),
        fuel_onboard: parseFloat(formData.fuelOnboard) || 0,
        total_passenger_weight: calculations ? parseFloat(calculations.totalPassengerWeight) : 0,
        total_baggage_weight: totalBaggage,
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
          seat_position: `Seat ${p.seat}`,
          row_number: Math.ceil(p.seat / 4)
        }));

        const { error: passengersError } = await supabase
          .from('manifest_passengers')
          .insert(passengerData);

        if (passengersError) throw passengersError;
      }

      onSaveSuccess?.({ type: 'success', message: 'Flight manifest saved successfully!' });

    } catch (error) {
      console.error('Error saving manifest:', error);
      onSaveSuccess?.({ type: 'error', message: 'Error saving manifest: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="manifest-form-wrapper-new">
      <div className="form-header-new">
        <div>
          <h2>Create Flight Manifest</h2>
          <p className="form-subtitle">Select aircraft and click on seats or cargo areas to manage passengers and weight</p>
        </div>
        <div className="header-actions">
          <button
            onClick={handleSaveManifest}
            disabled={saving || !selectedAircraft}
            className="btn-save-header"
          >
            {saving ? 'SAVING...' : 'SAVE MANIFEST'}
          </button>
          {onCancel && (
            <button onClick={onCancel} className="btn-cancel-header">
              CANCEL
            </button>
          )}
        </div>
      </div>

      <div className="manifest-form-grid">
        <div className="form-sidebar">
          <div className="sidebar-section">
            <h3>Aircraft Selection</h3>
            <select
              value={selectedAircraft?.id || ''}
              onChange={handleAircraftChange}
              className={`form-control-new ${errors.aircraft ? 'error' : ''}`}
            >
              <option value="">Select Aircraft...</option>
              {aircraft.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} - {a.registration}
                </option>
              ))}
            </select>
            {errors.aircraft && <span className="error-message">{errors.aircraft}</span>}

            {selectedAircraft && (
              <div className="aircraft-specs-compact">
                <div className="spec-compact">
                  <span>Max Weight:</span>
                  <strong>{selectedAircraft.max_gross_weight} lb</strong>
                </div>
                <div className="spec-compact">
                  <span>Max Passengers:</span>
                  <strong>{selectedAircraft.max_passengers}</strong>
                </div>
                <div className="spec-compact">
                  <span>Max Fuel:</span>
                  <strong>{selectedAircraft.max_fuel_capacity} gal</strong>
                </div>
              </div>
            )}
          </div>

          <div className="sidebar-section">
            <h3>Flight Information</h3>
            <div className="form-field">
              <label>Flight Number *</label>
              <input
                type="text"
                name="flightNumber"
                value={formData.flightNumber}
                onChange={handleInputChange}
                className={`form-control-new ${errors.flightNumber ? 'error' : ''}`}
                placeholder="SA123"
              />
              {errors.flightNumber && <span className="error-message">{errors.flightNumber}</span>}
            </div>

            <div className="form-field">
              <label>Flight Date *</label>
              <input
                type="date"
                name="flightDate"
                value={formData.flightDate}
                onChange={handleInputChange}
                className="form-control-new"
              />
            </div>

            <div className="form-field">
              <label>Departure Time *</label>
              <input
                type="time"
                name="departureTime"
                value={formData.departureTime}
                onChange={handleInputChange}
                className={`form-control-new ${errors.departureTime ? 'error' : ''}`}
              />
              {errors.departureTime && <span className="error-message">{errors.departureTime}</span>}
            </div>

            <div className="form-field">
              <label>Arrival Time *</label>
              <input
                type="time"
                name="arrivalTime"
                value={formData.arrivalTime}
                onChange={handleInputChange}
                className={`form-control-new ${errors.arrivalTime ? 'error' : ''}`}
              />
              {errors.arrivalTime && <span className="error-message">{errors.arrivalTime}</span>}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Crew Information</h3>
            <div className="form-field">
              <label>Pilot in Command *</label>
              <input
                type="text"
                name="pilotInCommand"
                value={formData.pilotInCommand}
                onChange={handleInputChange}
                className={`form-control-new ${errors.pilotInCommand ? 'error' : ''}`}
                placeholder="Captain Name"
              />
              {errors.pilotInCommand && <span className="error-message">{errors.pilotInCommand}</span>}
            </div>

            <div className="form-field">
              <label>Second in Command</label>
              <input
                type="text"
                name="secondInCommand"
                value={formData.secondInCommand}
                onChange={handleInputChange}
                className="form-control-new"
                placeholder="First Officer (optional)"
              />
            </div>

            <div className="form-field">
              <label>Total Crew Weight (lb) *</label>
              <input
                type="number"
                name="pilotWeight"
                value={formData.pilotWeight}
                onChange={handleInputChange}
                className={`form-control-new ${errors.pilotWeight ? 'error' : ''}`}
                placeholder="0"
                min="0"
              />
              {errors.pilotWeight && <span className="error-message">{errors.pilotWeight}</span>}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Fuel</h3>
            <div className="form-field">
              <label>Fuel Onboard (gal) *</label>
              <input
                type="number"
                name="fuelOnboard"
                value={formData.fuelOnboard}
                onChange={handleInputChange}
                className={`form-control-new ${errors.fuelOnboard ? 'error' : ''}`}
                placeholder="0"
                min="0"
                max={selectedAircraft?.max_fuel_capacity}
              />
              {errors.fuelOnboard && <span className="error-message">{errors.fuelOnboard}</span>}
            </div>
          </div>
        </div>

        <div className="form-main">
          <div className="seating-section">
            <h3>Seating Configuration</h3>
            <p className="seating-hint">Click a seat to add or edit passengers. Drag and drop to move passengers between seats.</p>
            <SeatingChart
              aircraft={selectedAircraft}
              passengers={passengers}
              onSeatClick={handleSeatClick}
              onSwapSeats={handleSwapSeats}
            />
            <PassengerList
              passengers={passengers}
              onRemove={handleRemoveSeat}
            />

            <div className="cargo-controls">
              <h3>Cargo & Baggage</h3>
              <div className="cargo-buttons">
                <button
                  type="button"
                  onClick={() => handleCargoClick('forward')}
                  className="cargo-button"
                >
                  Forward Baggage: {baggage.forward} lbs
                </button>
                <button
                  type="button"
                  onClick={() => handleCargoClick('aft')}
                  className="cargo-button"
                >
                  Aft Baggage: {baggage.aft} lbs
                </button>
              </div>
            </div>
          </div>

          {calculations && (
            <div className="calculations-section">
              <WeightBalanceDisplay
                calculations={calculations}
                aircraft={selectedAircraft}
              />
              <WarningPanel warnings={calculations.warnings} />
            </div>
          )}
        </div>
      </div>

      <SeatModal
        isOpen={seatModalOpen}
        onClose={() => setSeatModalOpen(false)}
        seatNumber={selectedSeat?.seatId}
        seatInfo={selectedSeat?.seatInfo}
        onSave={handleSaveSeat}
        onRemove={handleRemoveSeat}
      />

      <CargoModal
        isOpen={cargoModalOpen}
        onClose={() => setCargoModalOpen(false)}
        area={selectedCargoArea}
        weight={baggage[selectedCargoArea]}
        onSave={handleSaveCargo}
      />
    </div>
  );
}

export default FlightManifestForm;
