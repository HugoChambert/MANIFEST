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
      fuselage: { fill: '#dde4ed', stroke: '#6b7a8f', strokeWidth: 2.5 },
      cockpit: { fill: '#4a6b8a', stroke: '#2d4a5f', strokeWidth: 2 },
      wing: { fill: '#b8c5d6', stroke: '#6b7a8f', strokeWidth: 2.5 },
      engine: { fill: '#8895a8', stroke: '#5a6b7d', strokeWidth: 2 },
      propeller: { fill: 'none', stroke: '#3d4a5a', strokeWidth: 2 },
      strut: { fill: '#9aa8ba', stroke: '#6b7a8f', strokeWidth: 1.5 },
      tail: { fill: '#b8c5d6', stroke: '#6b7a8f', strokeWidth: 2.5 },
    };

    switch(aircraftType) {
      case 'cessna208':
        return (
          <svg viewBox="0 0 700 500" className="aircraft-svg" style={{width: '100%', maxWidth: '700px'}}>
            <defs>
              <linearGradient id="fuselageGrad208" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e8edf4" />
                <stop offset="100%" stopColor="#c8d3e0" />
              </linearGradient>
            </defs>
            <g id="cessna208-top">
              <path d="M 250 240 Q 250 235 252 232 L 255 225 L 265 220 L 280 218 L 350 218 Q 355 218 355 223 L 355 277 Q 355 282 350 282 L 280 282 L 265 280 L 255 275 L 252 268 Q 250 265 250 260 Z" fill="url(#fuselageGrad208)" {...commonProps.fuselage}/>
              <path d="M 355 235 L 550 235 Q 555 235 555 240 L 555 260 Q 555 265 550 265 L 355 265 Z" fill="url(#fuselageGrad208)" {...commonProps.fuselage}/>
              <ellipse cx="560" cy="250" rx="8" ry="15" fill="#c8d3e0" stroke="#6b7a8f" strokeWidth="2"/>
              <path d="M 240 130 Q 245 125 250 125 L 450 125 Q 460 125 465 130 L 475 145 Q 478 150 478 155 L 478 345 Q 478 350 475 355 L 465 370 Q 460 375 450 375 L 250 375 Q 245 375 240 370 Z" {...commonProps.wing}/>
              <rect x="340" y="115" width="45" height="30" rx="4" {...commonProps.engine}/>
              <ellipse cx="362" cy="115" rx="18" ry="18" {...commonProps.propeller}/>
              <line x1="344" y1="115" x2="380" y2="115" stroke="#3d4a5a" strokeWidth="2.5"/>
              <line x1="362" y1="97" x2="362" y2="133" stroke="#3d4a5a" strokeWidth="2.5"/>
              <rect x="275" y="155" width="10" height="85" rx="2" {...commonProps.strut}/>
              <rect x="430" y="155" width="10" height="85" rx="2" {...commonProps.strut}/>
              <rect x="265" y="223" width="15" height="8" fill="#4a6b8a" stroke="#2d4a5f" strokeWidth="1"/>
              <rect x="265" cy="269" width="15" height="8" fill="#4a6b8a" stroke="#2d4a5f" strokeWidth="1"/>
              <path d="M 555 180 L 580 155 Q 582 153 584 153 L 592 153 Q 595 153 595 156 L 595 344 Q 595 347 592 347 L 584 347 Q 582 347 580 345 L 555 320 Z" {...commonProps.tail}/>
              <path d="M 585 235 L 615 235 L 618 240 L 618 260 L 615 265 L 585 265 Z" {...commonProps.tail}/>
            </g>
          </svg>
        );

      case 'kingair350':
        return (
          <svg viewBox="0 0 700 500" className="aircraft-svg" style={{width: '100%', maxWidth: '700px'}}>
            <defs>
              <linearGradient id="fuselageGradKA" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e8edf4" />
                <stop offset="100%" stopColor="#c8d3e0" />
              </linearGradient>
            </defs>
            <g id="kingair350-top">
              <ellipse cx="240" cy="250" rx="18" ry="25" fill="url(#fuselageGradKA)" {...commonProps.fuselage}/>
              <rect x="250" y="230" width="310" height="40" rx="5" fill="url(#fuselageGradKA)" {...commonProps.fuselage}/>
              <path d="M 560 235 Q 575 240 580 250 Q 575 260 560 265 Z" fill="url(#fuselageGradKA)" {...commonProps.fuselage}/>
              <rect x="255" y="233" width="20" height="10" {...commonProps.cockpit}/>
              <rect x="255" y="257" width="20" height="10" {...commonProps.cockpit}/>
              <path d="M 270 115 L 520 115 Q 528 115 532 120 L 540 135 Q 542 140 542 145 L 542 355 Q 542 360 540 365 L 532 380 Q 528 385 520 385 L 270 385 Q 262 385 258 380 Z" {...commonProps.wing}/>
              <rect x="300" y="105" width="55" height="35" rx="6" {...commonProps.engine}/>
              <rect x="450" y="105" width="55" height="35" rx="6" {...commonProps.engine}/>
              <ellipse cx="327" cy="105" rx="22" ry="22" {...commonProps.propeller}/>
              <line x1="305" y1="105" x2="349" y2="105" stroke="#3d4a5a" strokeWidth="3"/>
              <line x1="327" y1="83" x2="327" y2="127" stroke="#3d4a5a" strokeWidth="3"/>
              <ellipse cx="477" cy="105" rx="22" ry="22" {...commonProps.propeller}/>
              <line x1="455" y1="105" x2="499" y2="105" stroke="#3d4a5a" strokeWidth="3"/>
              <line x1="477" y1="83" x2="477" y2="127" stroke="#3d4a5a" strokeWidth="3"/>
              <path d="M 580 175 L 610 145 Q 612 143 615 143 L 625 143 Q 628 143 628 146 L 628 354 Q 628 357 625 357 L 615 357 Q 612 357 610 355 L 580 325 Z" {...commonProps.tail}/>
              <path d="M 612 235 L 645 235 L 648 240 L 648 260 L 645 265 L 612 265 Z" {...commonProps.tail}/>
            </g>
          </svg>
        );

      case 'cessna402':
        return (
          <svg viewBox="0 0 700 500" className="aircraft-svg" style={{width: '100%', maxWidth: '700px'}}>
            <defs>
              <linearGradient id="fuselageGrad402" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e8edf4" />
                <stop offset="100%" stopColor="#c8d3e0" />
              </linearGradient>
            </defs>
            <g id="cessna402-top">
              <ellipse cx="245" cy="250" rx="16" ry="22" fill="url(#fuselageGrad402)" {...commonProps.fuselage}/>
              <rect x="255" y="232" width="290" height="36" rx="4" fill="url(#fuselageGrad402)" {...commonProps.fuselage}/>
              <path d="M 545 237 Q 560 242 565 250 Q 560 258 545 263 Z" fill="url(#fuselageGrad402)" {...commonProps.fuselage}/>
              <rect x="260" y="235" width="18" height="8" {...commonProps.cockpit}/>
              <rect x="260" y="257" width="18" height="8" {...commonProps.cockpit}/>
              <path d="M 275 125 L 510 125 Q 518 125 522 130 L 530 142 Q 532 147 532 152 L 532 348 Q 532 353 530 358 L 522 370 Q 518 375 510 375 L 275 375 Q 268 375 264 370 Z" {...commonProps.wing}/>
              <rect x="305" y="115" width="50" height="32" rx="5" {...commonProps.engine}/>
              <rect x="445" y="115" width="50" height="32" rx="5" {...commonProps.engine}/>
              <ellipse cx="330" cy="115" rx="20" ry="20" {...commonProps.propeller}/>
              <line x1="310" y1="115" x2="350" y2="115" stroke="#3d4a5a" strokeWidth="2.5"/>
              <line x1="330" y1="95" x2="330" y2="135" stroke="#3d4a5a" strokeWidth="2.5"/>
              <ellipse cx="470" cy="115" rx="20" ry="20" {...commonProps.propeller}/>
              <line x1="450" y1="115" x2="490" y2="115" stroke="#3d4a5a" strokeWidth="2.5"/>
              <line x1="470" y1="95" x2="470" y2="135" stroke="#3d4a5a" strokeWidth="2.5"/>
              <path d="M 565 180 L 595 150 Q 597 148 600 148 L 610 148 Q 613 148 613 151 L 613 349 Q 613 352 610 352 L 600 352 Q 597 352 595 350 L 565 320 Z" {...commonProps.tail}/>
              <path d="M 597 237 L 628 237 L 631 242 L 631 258 L 628 263 L 597 263 Z" {...commonProps.tail}/>
            </g>
          </svg>
        );

      case 'chieftain':
        return (
          <svg viewBox="0 0 700 500" className="aircraft-svg" style={{width: '100%', maxWidth: '700px'}}>
            <defs>
              <linearGradient id="fuselageGradChief" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e8edf4" />
                <stop offset="100%" stopColor="#c8d3e0" />
              </linearGradient>
            </defs>
            <g id="chieftain-top">
              <ellipse cx="245" cy="250" rx="16" ry="23" fill="url(#fuselageGradChief)" {...commonProps.fuselage}/>
              <rect x="255" y="231" width="295" height="38" rx="4" fill="url(#fuselageGradChief)" {...commonProps.fuselage}/>
              <path d="M 550 236 Q 565 241 570 250 Q 565 259 550 264 Z" fill="url(#fuselageGradChief)" {...commonProps.fuselage}/>
              <rect x="260" y="234" width="18" height="9" {...commonProps.cockpit}/>
              <rect x="260" y="257" width="18" height="9" {...commonProps.cockpit}/>
              <path d="M 275 122 L 515 122 Q 523 122 527 127 L 535 140 Q 537 145 537 150 L 537 350 Q 537 355 535 360 L 527 373 Q 523 378 515 378 L 275 378 Q 268 378 264 373 Z" {...commonProps.wing}/>
              <rect x="305" y="112" width="52" height="33" rx="5" {...commonProps.engine}/>
              <rect x="448" y="112" width="52" height="33" rx="5" {...commonProps.engine}/>
              <ellipse cx="331" cy="112" rx="21" ry="21" {...commonProps.propeller}/>
              <line x1="310" y1="112" x2="352" y2="112" stroke="#3d4a5a" strokeWidth="2.5"/>
              <line x1="331" y1="91" x2="331" y2="133" stroke="#3d4a5a" strokeWidth="2.5"/>
              <ellipse cx="474" cy="112" rx="21" ry="21" {...commonProps.propeller}/>
              <line x1="453" y1="112" x2="495" y2="112" stroke="#3d4a5a" strokeWidth="2.5"/>
              <line x1="474" y1="91" x2="474" y2="133" stroke="#3d4a5a" strokeWidth="2.5"/>
              <path d="M 570 178 L 600 148 Q 602 146 605 146 L 615 146 Q 618 146 618 149 L 618 351 Q 618 354 615 354 L 605 354 Q 602 354 600 352 L 570 322 Z" {...commonProps.tail}/>
              <path d="M 602 236 L 633 236 L 636 241 L 636 259 L 633 264 L 602 264 Z" {...commonProps.tail}/>
            </g>
          </svg>
        );

      case 'pc12':
        return (
          <svg viewBox="0 0 700 500" className="aircraft-svg" style={{width: '100%', maxWidth: '700px'}}>
            <defs>
              <linearGradient id="fuselageGradPC12" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e8edf4" />
                <stop offset="100%" stopColor="#c8d3e0" />
              </linearGradient>
            </defs>
            <g id="pc12-top">
              <ellipse cx="240" cy="250" rx="18" ry="26" fill="url(#fuselageGradPC12)" {...commonProps.fuselage}/>
              <rect x="250" y="229" width="320" height="42" rx="5" fill="url(#fuselageGradPC12)" {...commonProps.fuselage}/>
              <path d="M 570 234 Q 585 239 590 250 Q 585 261 570 266 Z" fill="url(#fuselageGradPC12)" {...commonProps.fuselage}/>
              <rect x="255" y="232" width="20" height="10" {...commonProps.cockpit}/>
              <rect x="255" y="258" width="20" height="10" {...commonProps.cockpit}/>
              <path d="M 270 110 L 530 110 Q 538 110 542 115 L 550 130 Q 552 135 552 140 L 552 360 Q 552 365 550 370 L 542 385 Q 538 390 530 390 L 270 390 Q 262 390 258 385 Z" {...commonProps.wing}/>
              <rect x="380" y="100" width="58" height="36" rx="6" {...commonProps.engine}/>
              <ellipse cx="409" cy="100" rx="24" ry="24" {...commonProps.propeller}/>
              <line x1="385" y1="100" x2="433" y2="100" stroke="#3d4a5a" strokeWidth="3"/>
              <line x1="409" y1="76" x2="409" y2="124" stroke="#3d4a5a" strokeWidth="3"/>
              <path d="M 590 170 L 620 140 Q 622 138 625 138 L 635 138 Q 638 138 638 141 L 638 359 Q 638 362 635 362 L 625 362 Q 622 362 620 360 L 590 330 Z" {...commonProps.tail}/>
              <path d="M 622 234 L 655 234 L 658 239 L 658 261 L 655 266 L 622 266 Z" {...commonProps.tail}/>
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
