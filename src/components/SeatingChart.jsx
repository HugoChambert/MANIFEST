import './SeatingChart.css';

function SeatingChart({ passengers, aircraft }) {
  if (!aircraft) return null;

  const maxRows = aircraft.passenger_row3_arm ? 3 : aircraft.passenger_row2_arm ? 2 : 1;
  const seatsPerRow = Math.ceil(aircraft.max_passengers / maxRows);

  const getSeatOccupant = (row, seatLetter) => {
    return passengers.find(p =>
      p.rowNumber === row &&
      p.seatPosition.toUpperCase().includes(seatLetter.toUpperCase())
    );
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
                    return (
                      <div
                        key={letter}
                        className={`seat ${occupant ? 'occupied' : 'empty'}`}
                        title={occupant ? `${occupant.name} (${occupant.weight} lbs)` : 'Empty'}
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
                    return (
                      <div
                        key={letter}
                        className={`seat ${occupant ? 'occupied' : 'empty'}`}
                        title={occupant ? `${occupant.name} (${occupant.weight} lbs)` : 'Empty'}
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
          <span>Occupied</span>
        </div>
        <div className="legend-item">
          <div className="legend-seat empty"></div>
          <span>Empty</span>
        </div>
      </div>
    </div>
  );
}

export default SeatingChart;
