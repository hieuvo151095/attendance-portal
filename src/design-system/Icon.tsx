import React from 'react';
import { ICONS, ALIASES } from './icons-data';

export type IconName = string;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

function resolveIcon(name: string): [number, number, string] | null {
  if (ICONS[name]) return ICONS[name];
  const alias = ALIASES[name];
  if (alias && ICONS[alias]) return ICONS[alias];
  return null;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 16,
  color,
  title,
  className = '',
  style = {}
}) => {
  const iconData = resolveIcon(name);
  const iconStyle: React.CSSProperties = {
    width: size,
    height: size,
    color,
    display: 'inline-block',
    flex: 'none',
    verticalAlign: '-0.125em',
    ...style
  };

  if (!iconData) {
    return (
      <span
        className={`ecomd-icon ecomd-icon--missing ${className}`}
        style={iconStyle}
        title={title || name}
        aria-hidden="true"
      />
    );
  }

  const [w, h, path] = iconData;

  return (
    <svg
      className={`ecomd-icon ${className}`}
      style={iconStyle}
      viewBox={`0 0 ${w} ${h}`}
      fill="currentColor"
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      <path d={path} />
    </svg>
  );
};
