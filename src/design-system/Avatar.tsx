import React, { useState } from 'react';

export interface AvatarProps {
  /** Ảnh vuông, ưu tiên khuôn mặt. Không có: hiện chữ cái đầu của họ tên. */
  src?: string;
  /** Họ tên; dùng làm alt và để lấy chữ cái đầu. */
  name?: string;
  /** Ghi đè chữ cái đầu. */
  initials?: string;
  /** md 40px (bảng, mặc định) · sm 32px (AppHeader). */
  size?: 'md' | 'sm';
  /** Vòng eco-yellow-strong — chỉ cho người đang đăng nhập. */
  ring?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = '',
  initials,
  size = 'md',
  ring = false,
  className = '',
  style
}) => {
  const [imgError, setImgError] = useState(false);

  // Compute initials if not explicitly provided
  const displayInitials =
    initials ||
    (name
      ? name
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .slice(-1)[0]?.[0]?.toUpperCase() || 'U'
      : 'U');

  const classes = [
    'ecomd-avatar',
    size === 'sm' ? 'ecomd-avatar--sm' : 'ecomd-avatar--md',
    ring ? 'is-ring' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={style} title={name}>
      {src && !imgError ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          onError={() => setImgError(true)}
        />
      ) : (
        <span
          className={`ecomd-avatar__initials ${
            size === 'sm' ? 'body-xs-bold' : 'body-sm-bold'
          }`}
        >
          {displayInitials}
        </span>
      )}
    </div>
  );
};
