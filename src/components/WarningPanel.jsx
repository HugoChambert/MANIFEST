import { getWarningColor } from '../utils/weightBalance';
import './WarningPanel.css';

function WarningPanel({ warnings }) {
  if (!warnings || warnings.length === 0) {
    return (
      <div className="warning-panel success">
        <div className="success-icon">✓</div>
        <div className="success-content">
          <h3>Aircraft Within Limits</h3>
          <p>All weight and balance parameters are within acceptable limits. Safe for flight.</p>
        </div>
      </div>
    );
  }

  const criticalWarnings = warnings.filter(w => w.type === 'critical');
  const otherWarnings = warnings.filter(w => w.type !== 'critical');

  return (
    <div className="warning-panel-container">
      {criticalWarnings.length > 0 && (
        <div className="warning-section critical">
          <h3 className="warning-section-title">
            <span className="warning-icon">⚠</span>
            Critical Warnings - Aircraft Not Airworthy
          </h3>
          {criticalWarnings.map((warning, index) => (
            <div key={index} className="warning-item" style={{ borderLeftColor: getWarningColor(warning.type) }}>
              <div className="warning-header">{warning.title}</div>
              <div className="warning-message">{warning.message}</div>
              <div className="warning-recommendation">
                <strong>Recommendation:</strong> {warning.recommendation}
              </div>
            </div>
          ))}
        </div>
      )}

      {otherWarnings.length > 0 && (
        <div className="warning-section">
          <h3 className="warning-section-title">
            <span className="warning-icon">ℹ</span>
            Warnings & Recommendations
          </h3>
          {otherWarnings.map((warning, index) => (
            <div key={index} className="warning-item" style={{ borderLeftColor: getWarningColor(warning.type) }}>
              <div className="warning-header">{warning.title}</div>
              <div className="warning-message">{warning.message}</div>
              <div className="warning-recommendation">
                <strong>Recommendation:</strong> {warning.recommendation}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WarningPanel;
