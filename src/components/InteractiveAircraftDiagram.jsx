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

  const getAircraftType = () => {
    const name = aircraft.name.toLowerCase();
    if (name.includes('208') || name.includes('caravan')) return 'cessna208';
    if (name.includes('king air')) return 'kingair350';
    if (name.includes('402')) return 'cessna402';
    if (name.includes('chieftain') || name.includes('pa-31')) return 'chieftain';
    if (name.includes('pc-12') || name.includes('pilatus')) return 'pc12';
    return 'generic';
  };

  const aircraftType = getAircraftType();

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

  const renderAircraftSVG = () => {
    const commonProps = {
      fuselage: { fill: '#e8edf2', stroke: '#8b95a3', strokeWidth: 2 },
      windows: { fill: '#5a95c7', stroke: '#3d5e7a', strokeWidth: 1 },
      wing: { fill: '#cbd5e1', stroke: '#8b95a3', strokeWidth: 2 },
      engine: { fill: '#94a3b8', stroke: '#64748b', strokeWidth: 2 },
      propeller: { fill: '#475569', stroke: '#334155', strokeWidth: 1 },
    };

    switch(aircraftType) {
      case 'cessna208':
        return (
          <svg viewBox="0 0 600 400" className="aircraft-svg" style={{width: '100%', maxWidth: '600px'}}>
            <g id="cessna208">
              <ellipse cx="90" cy="200" rx="35" ry="45" {...commonProps.fuselage}/>
              <rect x="115" y="155" width="360" height="90" rx="15" {...commonProps.fuselage}/>
              <path d="M 470 170 Q 500 180 510 200 Q 500 220 470 230 Z" {...commonProps.fuselage}/>
              <path d="M 300 155 L 300 80 L 450 95 L 455 155 Z" {...commonProps.wing}/>
              <rect x="370" y="75" width="45" height="40" rx="5" {...commonProps.engine}/>
              <circle cx="392" cy="70" r="25" fill="none" stroke="#334155" strokeWidth="2"/>
              <line x1="367" y1="70" x2="417" y2="70" stroke="#334155" strokeWidth="3"/>
              <line x1="392" y1="45" x2="392" y2="95" stroke="#334155" strokeWidth="3"/>
              <circle cx="150" cy="200" r="8" {...commonProps.windows}/>
              <circle cx="180" cy="200" r="8" {...commonProps.windows}/>
              <circle cx="220" cy="200" r="10" {...commonProps.windows}/>
              <circle cx="260" cy="200" r="10" {...commonProps.windows}/>
              <circle cx="300" cy="200" r="10" {...commonProps.windows}/>
              <circle cx="340" cy="200" r="10" {...commonProps.windows}/>
              <circle cx="380" cy="200" r="10" {...commonProps.windows}/>
              <circle cx="420" cy="200" r="10" {...commonProps.windows}/>
              <path d="M 510 160 L 535 120 L 540 200 L 535 280 L 510 240 Z" {...commonProps.fuselage}/>
              <path d="M 525 200 L 545 200 L 545 240 L 530 235 Z" {...commonProps.fuselage}/>
              <ellipse cx="160" cy="260" rx="12" ry="18" fill="#475569" stroke="#334155" strokeWidth="2"/>
              <ellipse cx="450" cy="260" rx="12" ry="18" fill="#475569" stroke="#334155" strokeWidth="2"/>
            </g>
          </svg>
        );

      case 'kingair350':
        return (
          <svg viewBox="0 0 600 400" className="aircraft-svg" style={{width: '100%', maxWidth: '600px'}}>
            <g id="kingair350">
              <ellipse cx="90" cy="200" rx="35" ry="45" {...commonProps.fuselage}/>
              <rect x="115" y="155" width="370" height="90" rx="15" {...commonProps.fuselage}/>
              <path d="M 480 170 Q 510 180 520 200 Q 510 220 480 230 Z" {...commonProps.fuselage}/>
              <path d="M 150 245 L 120 290 L 440 290 L 410 245 Z" {...commonProps.wing}/>
              <rect x="170" y="280" width="50" height="55" rx="8" {...commonProps.engine}/>
              <rect x="350" y="280" width="50" height="55" rx="8" {...commonProps.engine}/>
              <circle cx="195" cy="340" r="28" fill="none" stroke="#334155" strokeWidth="2"/>
              <line x1="167" y1="340" x2="223" y2="340" stroke="#334155" strokeWidth="3"/>
              <line x1="195" y1="312" x2="195" y2="368" stroke="#334155" strokeWidth="3"/>
              <circle cx="375" cy="340" r="28" fill="none" stroke="#334155" strokeWidth="2"/>
              <line x1="347" y1="340" x2="403" y2="340" stroke="#334155" strokeWidth="3"/>
              <line x1="375" y1="312" x2="375" y2="368" stroke="#334155" strokeWidth="3"/>
              <circle cx="145" cy="200" r="8" {...commonProps.windows}/>
              <circle cx="175" cy="200" r="8" {...commonProps.windows}/>
              <circle cx="215" cy="200" r="10" {...commonProps.windows}/>
              <circle cx="255" cy="200" r="10" {...commonProps.windows}/>
              <circle cx="295" cy="200" r="10" {...commonProps.windows}/>
              <circle cx="335" cy="200" r="10" {...commonProps.windows}/>
              <circle cx="375" cy="200" r="10" {...commonProps.windows}/>
              <circle cx="415" cy="200" r="10" {...commonProps.windows}/>
              <circle cx="445" cy="200" r="10" {...commonProps.windows}/>
              <path d="M 520 155 L 545 110 L 550 200 L 545 290 L 520 245 Z" {...commonProps.fuselage}/>
              <path d="M 535 200 L 555 200 L 555 240 L 540 235 Z" {...commonProps.fuselage}/>
              <ellipse cx="160" cy="255" rx="12" ry="18" fill="#475569" stroke="#334155" strokeWidth="2"/>
              <ellipse cx="300" cy="255" rx="12" ry="18" fill="#475569" stroke="#334155" strokeWidth="2"/>
              <ellipse cx="460" cy="255" rx="12" ry="18" fill="#475569" stroke="#334155" strokeWidth="2"/>
            </g>
          </svg>
        );

      case 'cessna402':
        return (
          <svg viewBox="0 0 600 400" className="aircraft-svg" style={{width: '100%', maxWidth: '600px'}}>
            <g id="cessna402">
              <ellipse cx="90" cy="200" rx="32" ry="42" {...commonProps.fuselage}/>
              <rect x="115" y="158" width="340" height="84" rx="12" {...commonProps.fuselage}/>
              <path d="M 450 170 Q 480 180 490 200 Q 480 220 450 230 Z" {...commonProps.fuselage}/>
              <path d="M 150 242 L 130 280 L 420 280 L 400 242 Z" {...commonProps.wing}/>
              <rect x="165" y="270" width="45" height="50" rx="7" {...commonProps.engine}/>
              <rect x="345" y="270" width="45" height="50" rx="7" {...commonProps.engine}/>
              <circle cx="187" cy="325" r="25" fill="none" stroke="#334155" strokeWidth="2"/>
              <line x1="162" y1="325" x2="212" y2="325" stroke="#334155" strokeWidth="3"/>
              <line x1="187" y1="300" x2="187" y2="350" stroke="#334155" strokeWidth="3"/>
              <circle cx="367" cy="325" r="25" fill="none" stroke="#334155" strokeWidth="2"/>
              <line x1="342" y1="325" x2="392" y2="325" stroke="#334155" strokeWidth="3"/>
              <line x1="367" y1="300" x2="367" y2="350" stroke="#334155" strokeWidth="3"/>
              <circle cx="145" cy="200" r="8" {...commonProps.windows}/>
              <circle cx="175" cy="200" r="8" {...commonProps.windows}/>
              <circle cx="215" cy="200" r="9" {...commonProps.windows}/>
              <circle cx="255" cy="200" r="9" {...commonProps.windows}/>
              <circle cx="295" cy="200" r="9" {...commonProps.windows}/>
              <circle cx="335" cy="200" r="9" {...commonProps.windows}/>
              <circle cx="375" cy="200" r="9" {...commonProps.windows}/>
              <circle cx="410" cy="200" r="9" {...commonProps.windows}/>
              <path d="M 490 160 L 515 120 L 520 200 L 515 280 L 490 240 Z" {...commonProps.fuselage}/>
              <path d="M 505 200 L 525 200 L 525 235 L 512 232 Z" {...commonProps.fuselage}/>
              <ellipse cx="155" cy="253" rx="11" ry="17" fill="#475569" stroke="#334155" strokeWidth="2"/>
              <ellipse cx="280" cy="253" rx="11" ry="17" fill="#475569" stroke="#334155" strokeWidth="2"/>
              <ellipse cx="440" cy="253" rx="11" ry="17" fill="#475569" stroke="#334155" strokeWidth="2"/>
            </g>
          </svg>
        );

      case 'chieftain':
        return (
          <svg viewBox="0 0 600 400" className="aircraft-svg" style={{width: '100%', maxWidth: '600px'}}>
            <g id="chieftain">
              <ellipse cx="90" cy="200" rx="33" ry="43" {...commonProps.fuselage}/>
              <rect x="115" y="157" width="345" height="86" rx="13" {...commonProps.fuselage}/>
              <path d="M 455 168 Q 485 178 495 200 Q 485 222 455 232 Z" {...commonProps.fuselage}/>
              <path d="M 150 243 L 125 285 L 425 285 L 405 243 Z" {...commonProps.wing}/>
              <rect x="160" y="272" width="47" height="52" rx="7" {...commonProps.engine}/>
              <rect x="350" y="272" width="47" height="52" rx="7" {...commonProps.engine}/>
              <circle cx="183" cy="328" r="26" fill="none" stroke="#334155" strokeWidth="2"/>
              <line x1="157" y1="328" x2="209" y2="328" stroke="#334155" strokeWidth="3"/>
              <line x1="183" y1="302" x2="183" y2="354" stroke="#334155" strokeWidth="3"/>
              <circle cx="373" cy="328" r="26" fill="none" stroke="#334155" strokeWidth="2"/>
              <line x1="347" y1="328" x2="399" y2="328" stroke="#334155" strokeWidth="3"/>
              <line x1="373" y1="302" x2="373" y2="354" stroke="#334155" strokeWidth="3"/>
              <circle cx="145" cy="200" r="8" {...commonProps.windows}/>
              <circle cx="175" cy="200" r="8" {...commonProps.windows}/>
              <circle cx="215" cy="200" r="9" {...commonProps.windows}/>
              <circle cx="255" cy="200" r="9" {...commonProps.windows}/>
              <circle cx="295" cy="200" r="9" {...commonProps.windows}/>
              <circle cx="335" cy="200" r="9" {...commonProps.windows}/>
              <circle cx="375" cy="200" r="9" {...commonProps.windows}/>
              <circle cx="415" cy="200" r="9" {...commonProps.windows}/>
              <path d="M 495 158 L 520 115 L 525 200 L 520 285 L 495 242 Z" {...commonProps.fuselage}/>
              <path d="M 510 200 L 530 200 L 530 237 L 515 234 Z" {...commonProps.fuselage}/>
              <ellipse cx="155" cy="254" rx="11" ry="17" fill="#475569" stroke="#334155" strokeWidth="2"/>
              <ellipse cx="280" cy="254" rx="11" ry="17" fill="#475569" stroke="#334155" strokeWidth="2"/>
              <ellipse cx="445" cy="254" rx="11" ry="17" fill="#475569" stroke="#334155" strokeWidth="2"/>
            </g>
          </svg>
        );

      case 'pc12':
        return (
          <svg viewBox="0 0 600 400" className="aircraft-svg" style={{width: '100%', maxWidth: '600px'}}>
            <g id="pc12">
              <ellipse cx="90" cy="200" rx="36" ry="46" {...commonProps.fuselage}/>
              <rect x="115" y="154" width="365" height="92" rx="16" {...commonProps.fuselage}/>
              <path d="M 475 168 Q 505 178 515 200 Q 505 222 475 232 Z" {...commonProps.fuselage}/>
              <path d="M 150 246 L 125 295 L 435 295 L 415 246 Z" {...commonProps.wing}/>
              <rect x="265" y="285" width="50" height="58" rx="8" {...commonProps.engine}/>
              <circle cx="290" cy="348" r="30" fill="none" stroke="#334155" strokeWidth="2"/>
              <line x1="260" y1="348" x2="320" y2="348" stroke="#334155" strokeWidth="3"/>
              <line x1="290" y1="318" x2="290" y2="378" stroke="#334155" strokeWidth="3"/>
              <circle cx="148" cy="200" r="9" {...commonProps.windows}/>
              <circle cx="178" cy="200" r="9" {...commonProps.windows}/>
              <circle cx="218" cy="200" r="10" {...commonProps.windows}/>
              <circle cx="258" cy="200" r="10" {...commonProps.windows}/>
              <circle cx="298" cy="200" r="10" {...commonProps.windows}/>
              <circle cx="338" cy="200" r="10" {...commonProps.windows}/>
              <circle cx="378" cy="200" r="10" {...commonProps.windows}/>
              <circle cx="418" cy="200" r="10" {...commonProps.windows}/>
              <circle cx="448" cy="200" r="10" {...commonProps.windows}/>
              <path d="M 515 153 L 540 105 L 545 200 L 540 295 L 515 247 Z" {...commonProps.fuselage}/>
              <path d="M 530 200 L 550 200 L 550 242 L 535 238 Z" {...commonProps.fuselage}/>
              <ellipse cx="160" cy="256" rx="12" ry="18" fill="#475569" stroke="#334155" strokeWidth="2"/>
              <ellipse cx="290" cy="256" rx="12" ry="18" fill="#475569" stroke="#334155" strokeWidth="2"/>
              <ellipse cx="455" cy="256" rx="12" ry="18" fill="#475569" stroke="#334155" strokeWidth="2"/>
            </g>
          </svg>
        );

      default:
        return null;
    }
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
        <div className="aircraft-visual">
          {renderAircraftSVG()}
        </div>

        <div className="aircraft-cabin-section">
          <div className="cabin-label">Passenger Cabin</div>
          <div className="seats-container">
            {renderSeats()}
          </div>
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
