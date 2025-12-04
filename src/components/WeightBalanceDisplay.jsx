import './WeightBalanceDisplay.css';

function WeightBalanceDisplay({ calculations, aircraft }) {
  if (!calculations || !aircraft) return null;

  const cgPercentage = ((parseFloat(calculations.calculatedCG) - aircraft.cg_forward_limit) /
    (aircraft.cg_aft_limit - aircraft.cg_forward_limit)) * 100;

  const isWithinCGLimits = cgPercentage >= 0 && cgPercentage <= 100;

  return (
    <div className="weight-balance-display">
      <h3 className="section-title">Weight & Balance Summary</h3>

      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-label">Total Weight</div>
          <div className={`summary-value ${parseFloat(calculations.totalWeight) > aircraft.max_gross_weight ? 'danger' : ''}`}>
            {calculations.totalWeight} lbs
          </div>
          <div className="summary-detail">
            Max: {aircraft.max_gross_weight} lbs
          </div>
          <div className={`summary-margin ${parseFloat(calculations.weightMargin) < 0 ? 'negative' : 'positive'}`}>
            Margin: {calculations.weightMargin} lbs
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Center of Gravity</div>
          <div className={`summary-value ${!isWithinCGLimits ? 'danger' : ''}`}>
            {calculations.calculatedCG}"
          </div>
          <div className="summary-detail">
            Limits: {aircraft.cg_forward_limit}" - {aircraft.cg_aft_limit}"
          </div>
          <div className="cg-indicator">
            <div className="cg-bar">
              <div className="cg-limits">
                <span className="cg-limit-marker forward">Forward</span>
                <span className="cg-limit-marker aft">Aft</span>
              </div>
              <div
                className={`cg-position ${!isWithinCGLimits ? 'out-of-limits' : ''}`}
                style={{ left: `${Math.max(0, Math.min(100, cgPercentage))}%` }}
              >
                <div className="cg-dot"></div>
                <div className="cg-label">Current CG</div>
              </div>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Fuel Weight</div>
          <div className="summary-value">{calculations.fuelWeight} lbs</div>
          <div className="summary-detail">
            {(parseFloat(calculations.fuelWeight) / aircraft.fuel_weight_per_gallon).toFixed(1)} gallons
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Passenger Weight</div>
          <div className="summary-value">{calculations.totalPassengerWeight} lbs</div>
        </div>
      </div>

      <div className={`airworthiness-status ${calculations.isWithinLimits ? 'safe' : 'unsafe'}`}>
        <div className="status-text">
          <strong>{calculations.isWithinLimits ? 'AIRCRAFT AIRWORTHY' : 'AIRCRAFT NOT AIRWORTHY'}</strong>
          <p>
            {calculations.isWithinLimits
              ? 'All weight and balance parameters are within limits.'
              : 'Aircraft exceeds weight and/or balance limits. Do not fly.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default WeightBalanceDisplay;
