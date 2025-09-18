import React from 'react';
import { HeartIcon as HeartOutline, BookmarkIcon as BookmarkOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';

type ActionType = 'like' | 'favorite';

interface ActionToggleProps {
  type: ActionType;
  active: boolean;
  loading?: boolean;
  disabled?: boolean;
  count?: number;
  onToggle: () => void;
}

const ActionToggle: React.FC<ActionToggleProps> = ({ type, active, loading, disabled, count, onToggle }) => {
  const isDisabled = !!loading || !!disabled;
  const Icon = type === 'like' ? (active ? HeartSolid : HeartOutline) : (active ? BookmarkSolid : BookmarkOutline);
  const label = type === 'like' ? (active ? 'Убрать лайк' : 'Лайк') : (active ? 'Убрать' : 'В избранное');

  return (
    <button
      type="button"
      className="ui-btn ui-btn--flat"
      onClick={onToggle}
      disabled={isDisabled}
      aria-pressed={active}
      aria-label={label}
      style={{ padding: '0 12px', height: 36 }}
    >
      <Icon style={{ width: 18, height: 18, color: 'var(--token-text)' }} />
      <span>{label}{typeof count === 'number' ? ` (${count})` : ''}</span>
    </button>
  );
};

export default ActionToggle;


