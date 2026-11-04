import React from 'react';

export interface CardProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  flush?: boolean;
  children?: React.ReactNode;
  bodyStyle?: React.CSSProperties;
  className?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  actions,
  flush = false,
  children,
  bodyStyle = {},
  className = '',
  style = {}
}) => {
  const hasHead = title || actions;

  return (
    <section
      className={`ecomd-card ${flush ? 'is-flush' : ''} ${className}`}
      style={style}
    >
      {hasHead && (
        <div className="ecomd-card__head">
          <div>
            {title && <h2 className="ecomd-card__title title-md">{title}</h2>}
            {description && (
              <p className="ecomd-card__desc body-xs">{description}</p>
            )}
          </div>
          {actions && <div className="ecomd-card__actions">{actions}</div>}
        </div>
      )}
      <div className="ecomd-card__body" style={bodyStyle}>
        {children}
      </div>
    </section>
  );
};
