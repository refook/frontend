import React from 'react';

interface RecipeTagsProps {
  tags: string[];
  title?: string;
}

const chipStyle: React.CSSProperties = {
  padding: '4px 8px',
  backgroundColor: 'var(--bg-secondary, #f7f7f7)',
  border: '1px solid var(--border-primary, #e5e7eb)',
  borderRadius: 8,
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--text-secondary, #6b7280)'
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8
};

const sectionStyle: React.CSSProperties = {
  marginBottom: 'var(--spacing-3xl, 24px)'
};

const titleStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-xl, 18px)',
  fontWeight: 600,
  color: 'var(--text-primary, #111827)',
  margin: '0 0 12px 0'
};

export const RecipeTags: React.FC<RecipeTagsProps> = ({ tags, title = 'Теги' }) => {
  const hasTags = Array.isArray(tags) && tags.length > 0;

  return (
    <div style={sectionStyle}>
      <h3 style={titleStyle}>{title}</h3>
      {hasTags ? (
        <div style={containerStyle}>
          {tags.map((tag, index) => (
            <span key={`${tag}-${index}`} style={chipStyle}>
              {tag}
            </span>
          ))}
        </div>
      ) : (
        <div style={{ color: 'var(--text-tertiary, #9ca3af)', fontStyle: 'italic', fontSize: 13 }}>
          Теги отсутствуют
        </div>
      )}
    </div>
  );
};

export default RecipeTags;


