import React from 'react';

interface RatingControlProps {
  value: number;
  max?: number;
  loading?: boolean;
  disabled?: boolean;
  onChange: (value: number) => void;
  countLabel?: string; // например: "5 оценок"
}

const RatingControl: React.FC<RatingControlProps> = ({ value, max = 5, loading, disabled, onChange, countLabel }) => {
  const isDisabled = !!loading || !!disabled;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1)}
          disabled={isDisabled}
          aria-label={`Поставить ${i + 1}`}
          className="ui-btn ui-btn--flat"
          style={{ padding: '0 8px', height: 36 }}
        >
          {i < value ? '★' : '☆'}
        </button>
      ))}
      {countLabel && (
        <span style={{ color: 'var(--token-muted)', marginLeft: 4 }}>{countLabel}</span>
      )}
    </div>
  );
};

export default RatingControl;


