import { useState } from 'react';
import './SeatingChart.css';

function SeatingChart({ passengers, aircraft, onSeatClick, onSwapSeats }) {
  const [draggedSeat, setDraggedSeat] = useState(null);
  const [dragOverSeat, setDragOverSeat] = useState(null);

  if (!aircraft) return null;

  const maxRows = aircraft.passenger_row3_arm ? 3 : aircraft.passenger_row2_arm ? 2 : 1;
  const seatsPerRow = Math.ceil(aircraft.max_passengers / maxRows);

  const getSeatOccupant = (row, seatLetter) => {
    return passengers.find(p =>
      p.rowNumber === row &&
      p.seatPosition.toUpperCase().includes(seatLetter.toUpperCase())
    );
  };

  const getSeatId = (row, letter) => `${row}${letter}`;

  const handleDragStart = (e, row, letter, occupant) => {
    if (!occupant) return;
    const seatId = getSeatId(row, letter);
    setDraggedSeat(seatId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', seatId);
  };

  const handleDragOver = (e, row, letter) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const seatId = getSeatId(row, letter);
    setDragOverSeat(seatId);
  };

  const handleDragLeave = () => {
    setDragOverSeat(null);
  };

  const handleDrop = (e, targetRow, targetLetter) => {
    e.preventDefault();
    const sourceSeatId = e.dataTransfer.getData('text/plain');
    const targetSeatId = getSeatId(targetRow, targetLetter);

    if (sourceSeatId === targetSeatId) {
      setDraggedSeat(null);
      setDragOverSeat(null);
      return;
    }

    const sourceMatch = sourceSeatId.match(/^(\d+)([A-D])$/);
    if (!sourceMatch) return;

    const sourceRow = parseInt(sourceMatch[1]);
    const sourceLetter = sourceMatch[2];

    const sourceOccupant = getSeatOccupant(sourceRow, sourceLetter);
    const targetOccupant = getSeatOccupant(targetRow, targetLetter);

    if (onSwapSeats) {
      onSwapSeats(
        { row: sourceRow, letter: sourceLetter, occupant: sourceOccupant },
        { row: targetRow, letter: targetLetter, occupant: targetOccupant }
      );
    }

    setDraggedSeat(null);
    setDragOverSeat(null);
  };

  const handleDragEnd = () => {
    setDraggedSeat(null);
    setDragOverSeat(null);
  };

  const handleSeatClick = (row, letter, occupant) => {
    if (onSeatClick) {
      const seatId = getSeatId(row, letter);
      onSeatClick(seatId, { row, letter, occupant });
    }
  };

  const seatLetters = ['A', 'B', 'C', 'D'];
  const rows = Array.from({ length: maxRows }, (_, i) => i + 1);

  return (
    <div className="seating-chart-container">
      <h4 className="seating-chart-title">Seating Chart</h4>
      <div className="seating-chart">
        <div className="cockpit">
          <div className="cockpit-label">COCKPIT</div>
        </div>

        <div className="cabin">
          {rows.map(row => (
            <div key={row} className="seat-row">
              <div className="row-label">Row {row}</div>
              <div className="seats">
                <div className="seat-group left">
                  {seatLetters.slice(0, 2).map(letter => {
                    const occupant = getSeatOccupant(row, letter);
                    const seatId = getSeatId(row, letter);
                    const isDragging = draggedSeat === seatId;
                    const isDragOver = dragOverSeat === seatId;

                    return (
                      <div
                        key={letter}
                        className={`seat ${occupant ? 'occupied' : 'empty'} ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
                        title={occupant ? `${occupant.name} (${occupant.weight} lbs) - Drag to move` : 'Empty - Click to add passenger'}
                        draggable={!!occupant}
                        onClick={() => handleSeatClick(row, letter, occupant)}
                        onDragStart={(e) => handleDragStart(e, row, letter, occupant)}
                        onDragOver={(e) => handleDragOver(e, row, letter)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, row, letter)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="seat-label">{row}{letter}</div>
                        {occupant && (
                          <div className="seat-occupant">
                            <div className="occupant-initial">{occupant.name.charAt(0)}</div>
                            <div className="occupant-weight">{occupant.weight}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="aisle"></div>
                <div className="seat-group right">
                  {seatLetters.slice(2, 4).map(letter => {
                    const occupant = getSeatOccupant(row, letter);
                    const seatId = getSeatId(row, letter);
                    const isDragging = draggedSeat === seatId;
                    const isDragOver = dragOverSeat === seatId;

                    return (
                      <div
                        key={letter}
                        className={`seat ${occupant ? 'occupied' : 'empty'} ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
                        title={occupant ? `${occupant.name} (${occupant.weight} lbs) - Drag to move` : 'Empty - Click to add passenger'}
                        draggable={!!occupant}
                        onClick={() => handleSeatClick(row, letter, occupant)}
                        onDragStart={(e) => handleDragStart(e, row, letter, occupant)}
                        onDragOver={(e) => handleDragOver(e, row, letter)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, row, letter)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="seat-label">{row}{letter}</div>
                        {occupant && (
                          <div className="seat-occupant">
                            <div className="occupant-initial">{occupant.name.charAt(0)}</div>
                            <div className="occupant-weight">{occupant.weight}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="cargo">
          <div className="cargo-label">BAGGAGE</div>
        </div>
      </div>

      <div className="seating-legend">
        <div className="legend-item">
          <div className="legend-seat occupied"><div className="occupant-initial">A</div></div>
          <span>Occupied (Drag to move)</span>
        </div>
        <div className="legend-item">
          <div className="legend-seat empty"></div>
          <span>Empty (Click to add)</span>
        </div>
      </div>
    </div>
  );
}

export default SeatingChart;
