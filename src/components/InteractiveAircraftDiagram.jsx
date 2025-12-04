import { useState } from 'react';
import './InteractiveAircraftDiagram.css';

function InteractiveAircraftDiagram({ aircraft, passengers, onSeatClick, onCargoClick, fuel, baggage }) {
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [hoveredArea, setHoveredArea] = useState(null);

  if (!aircraft) {
    return (
      <div className="diagram-placeholder">
        <p>Select an aircraft to view seating diagram</p>
      </div>
    );
  }

  const seatCount = aircraft.max_passengers;
  const isOccupied = (seatNumber) => {
    return passengers.some(p => p.seat === seatNumber);
  };

  const getPassengerAtSeat = (seatNumber) => {
    return passengers.find(p => p.seat === seatNumber);
  };

  const renderSeats = () => {
    const seats = [];
    const seatsPerRow = seatCount <= 9 ? 3 : 4;
    const rows = Math.ceil(seatCount / seatsPerRow);

    for (let row = 0; row < rows; row++) {
      const rowSeats = [];
      for (let col = 0; col < seatsPerRow; col++) {
        const seatNumber = row * seatsPerRow + col + 1;
        if (seatNumber > seatCount) break;

        const occupied = isOccupied(seatNumber);
        const passenger = getPassengerAtSeat(seatNumber);
        const isAisle = seatsPerRow === 4 && (col === 1 || col === 2);

        rowSeats.push(
          <div
            key={`seat-${seatNumber}`}
            className={`seat ${occupied ? 'occupied' : 'empty'} ${isAisle ? 'aisle-side' : ''}`}
            onClick={() => onSeatClick(seatNumber)}
            onMouseEnter={() => setHoveredSeat(seatNumber)}
            onMouseLeave={() => setHoveredSeat(null)}
            title={occupied ? `${passenger.name} (${passenger.weight} lb)` : `Seat ${seatNumber} - Click to add passenger`}
          >
            <div className="seat-number">{seatNumber}</div>
            {occupied && (
              <div className="seat-occupant">
                <div className="occupant-initial">{passenger.name.charAt(0)}</div>
              </div>
            )}
          </div>
        );

        if (isAisle && col === 1) {
          rowSeats.push(
            <div key={`aisle-${row}`} className="aisle"></div>
          );
        }
      }

      seats.push(
        <div key={`row-${row}`} className="seat-row">
          {rowSeats}
        </div>
      );
    }

    return seats;
  };

  return (
    <div className="interactive-diagram">
      <div className="diagram-header">
        <h3>{aircraft.name}</h3>
        <div className="diagram-legend">
          <div className="legend-item">
            <div className="legend-seat empty"></div>
            <span>Empty</span>
          </div>
          <div className="legend-item">
            <div className="legend-seat occupied"></div>
            <span>Occupied</span>
          </div>
        </div>
      </div>

      <div className="aircraft-diagram">
        <div className="aircraft-nose">
          <svg viewBox="0 0 100 60" className="nose-svg">
            <path d="M 50,5 L 80,60 L 20,60 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2"/>
          </svg>
          <div className="cockpit-label">Cockpit</div>
        </div>

        <div className="aircraft-body">
          <div className="body-left-wing"></div>
          <div className="body-center">
            <div className="cabin-section">
              <div className="cabin-label">Passenger Cabin</div>
              <div className="seats-container">
                {renderSeats()}
              </div>
            </div>
          </div>
          <div className="body-right-wing"></div>
        </div>

        <div className="aircraft-cargo">
          <div
            className={`cargo-area forward ${hoveredArea === 'forward' ? 'hovered' : ''}`}
            onClick={() => onCargoClick('forward')}
            onMouseEnter={() => setHoveredArea('forward')}
            onMouseLeave={() => setHoveredArea(null)}
          >
            <div className="cargo-icon">📦</div>
            <div className="cargo-label">Forward Baggage</div>
            <div className="cargo-weight">{baggage?.forward || 0} lb</div>
          </div>

          <div
            className={`cargo-area aft ${hoveredArea === 'aft' ? 'hovered' : ''}`}
            onClick={() => onCargoClick('aft')}
            onMouseEnter={() => setHoveredArea('aft')}
            onMouseLeave={() => setHoveredArea(null)}
          >
            <div className="cargo-icon">📦</div>
            <div className="cargo-label">Aft Baggage</div>
            <div className="cargo-weight">{baggage?.aft || 0} lb</div>
          </div>
        </div>

        <div className="aircraft-tail">
          <svg viewBox="0 0 100 80" className="tail-svg">
            <rect x="35" y="0" width="30" height="60" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2"/>
            <path d="M 50,10 L 70,0 L 50,50 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2"/>
          </svg>
        </div>

        <div className="fuel-indicator">
          <div className="fuel-icon">⛽</div>
          <div className="fuel-label">Fuel</div>
          <div className="fuel-weight">{fuel || 0} lb</div>
        </div>
      </div>

      <div className="diagram-stats">
        <div className="stat-item">
          <span className="stat-label">Passengers:</span>
          <span className="stat-value">{passengers.length} / {seatCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Passenger Weight:</span>
          <span className="stat-value">{passengers.reduce((sum, p) => sum + Number(p.weight), 0)} lb</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Baggage Weight:</span>
          <span className="stat-value">{(baggage?.forward || 0) + (baggage?.aft || 0)} lb</span>
        </div>
      </div>
    </div>
  );
}

export default InteractiveAircraftDiagram;
