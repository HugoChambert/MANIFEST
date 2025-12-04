import { useState, useEffect } from 'react';
import './SeatModal.css';

function CargoModal({ isOpen, onClose, area, weight, onSave }) {
  const [cargoWeight, setCargoWeight] = useState('');

  useEffect(() => {
    setCargoWeight(weight || '');
  }, [weight, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(area, Number(cargoWeight) || 0);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{area === 'forward' ? 'Forward' : 'Aft'} Baggage</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Baggage Weight (lb)</label>
            <input
              type="number"
              className="form-input"
              value={cargoWeight}
              onChange={(e) => setCargoWeight(e.target.value)}
              placeholder="0"
              min="0"
              autoFocus
            />
          </div>

          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            Enter the total weight of baggage in the {area === 'forward' ? 'forward' : 'aft'} compartment.
          </p>
        </div>

        <div className="modal-footer">
          <div className="modal-actions" style={{ marginLeft: 'auto' }}>
            <button className="btn-modal-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-modal-primary" onClick={handleSave}>
              Save Weight
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CargoModal;
