import { useState, useEffect } from 'react';
import './SeatModal.css';

function SeatModal({ isOpen, onClose, seatNumber, seatInfo, onSave, onRemove }) {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [baggageWeight, setBaggageWeight] = useState('');

  useEffect(() => {
    if (seatInfo?.occupant) {
      setName(seatInfo.occupant.name || '');
      setWeight(seatInfo.occupant.weight || '');
      setBaggageWeight(seatInfo.occupant.baggage_weight || '');
    } else {
      setName('');
      setWeight('');
      setBaggageWeight('');
    }
  }, [seatInfo, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim() || !weight) {
      alert('Please enter passenger name and weight');
      return;
    }

    onSave({
      name: name.trim(),
      weight: Number(weight),
      baggage_weight: Number(baggageWeight) || 0,
      rowNumber: seatInfo.row,
      seatPosition: seatInfo.letter
    });

    onClose();
  };

  const handleRemove = () => {
    if (confirm('Remove this passenger?')) {
      onRemove(seatNumber);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Seat {seatNumber}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Passenger Name *</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Weight (lb) *</label>
            <input
              type="number"
              className="form-input"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Baggage Weight (lb)</label>
            <input
              type="number"
              className="form-input"
              value={baggageWeight}
              onChange={(e) => setBaggageWeight(e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        <div className="modal-footer">
          {seatInfo?.occupant && (
            <button className="btn-modal-remove" onClick={handleRemove}>
              Remove Passenger
            </button>
          )}
          <div className="modal-actions">
            <button className="btn-modal-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-modal-primary" onClick={handleSave}>
              {seatInfo?.occupant ? 'Update' : 'Add Passenger'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeatModal;
