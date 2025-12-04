import { useState } from 'react';
import './PassengerList.css';

function PassengerList({ passengers, setPassengers, maxPassengers, maxRows }) {
  const [newPassenger, setNewPassenger] = useState({
    name: '',
    weight: '',
    seatPosition: '',
    rowNumber: 1
  });

  const handleAddPassenger = () => {
    if (!newPassenger.name || !newPassenger.weight || !newPassenger.seatPosition) {
      return;
    }

    if (passengers.length >= maxPassengers) {
      alert(`Maximum passenger capacity (${maxPassengers}) reached!`);
      return;
    }

    setPassengers([...passengers, { ...newPassenger, weight: parseFloat(newPassenger.weight) }]);
    setNewPassenger({
      name: '',
      weight: '',
      seatPosition: '',
      rowNumber: 1
    });
  };

  const handleRemovePassenger = (index) => {
    setPassengers(passengers.filter((_, i) => i !== index));
  };

  const totalWeight = passengers.reduce((sum, p) => sum + p.weight, 0);

  return (
    <div className="form-section passenger-section">
      <h3 className="section-title">Passenger List</h3>

      <div className="passenger-add-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="passengerName">Passenger Name</label>
            <input
              type="text"
              id="passengerName"
              value={newPassenger.name}
              onChange={(e) => setNewPassenger({ ...newPassenger, name: e.target.value })}
              className="form-control"
              placeholder="Full Name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="passengerWeight">Weight (lbs)</label>
            <input
              type="number"
              id="passengerWeight"
              value={newPassenger.weight}
              onChange={(e) => setNewPassenger({ ...newPassenger, weight: e.target.value })}
              className="form-control"
              placeholder="Weight"
              min="0"
              step="0.1"
            />
          </div>
          <div className="form-group">
            <label htmlFor="seatPosition">Seat</label>
            <input
              type="text"
              id="seatPosition"
              value={newPassenger.seatPosition}
              onChange={(e) => setNewPassenger({ ...newPassenger, seatPosition: e.target.value })}
              className="form-control"
              placeholder="1A, 2B, etc."
            />
          </div>
          <div className="form-group">
            <label htmlFor="rowNumber">Row</label>
            <select
              id="rowNumber"
              value={newPassenger.rowNumber}
              onChange={(e) => setNewPassenger({ ...newPassenger, rowNumber: parseInt(e.target.value) })}
              className="form-control"
            >
              {[...Array(maxRows)].map((_, i) => (
                <option key={i + 1} value={i + 1}>Row {i + 1}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>&nbsp;</label>
            <button
              type="button"
              onClick={handleAddPassenger}
              className="btn-add"
              disabled={!newPassenger.name || !newPassenger.weight || !newPassenger.seatPosition}
            >
              Add Passenger
            </button>
          </div>
        </div>
      </div>

      {passengers.length > 0 && (
        <div className="passenger-list">
          <div className="passenger-list-header">
            <span>Name</span>
            <span>Weight (lbs)</span>
            <span>Seat</span>
            <span>Row</span>
            <span>Action</span>
          </div>
          {passengers.map((passenger, index) => (
            <div key={index} className="passenger-list-item">
              <span>{passenger.name}</span>
              <span>{passenger.weight}</span>
              <span>{passenger.seatPosition}</span>
              <span>Row {passenger.rowNumber}</span>
              <button
                onClick={() => handleRemovePassenger(index)}
                className="btn-remove"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="passenger-list-footer">
            <span>Total: {passengers.length} passenger{passengers.length !== 1 ? 's' : ''}</span>
            <span>Total Weight: {totalWeight.toFixed(1)} lbs</span>
          </div>
        </div>
      )}

      {passengers.length === 0 && (
        <div className="empty-state">
          No passengers added yet. Use the form above to add passengers.
        </div>
      )}
    </div>
  );
}

export default PassengerList;
