import React from 'react';
import { IconButton } from './IconButton';

export interface PaginationProps {
  current: number;
  pageSize?: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Pagination: React.FC<PaginationProps> = ({
  current,
  pageSize = 10,
  total,
  onChange,
  showTotal,
  className = '',
  style
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safeCurrent = Math.min(Math.max(1, current), totalPages);

  const startRange = total === 0 ? 0 : (safeCurrent - 1) * pageSize + 1;
  const endRange = Math.min(safeCurrent * pageSize, total);

  const handlePageClick = (page: number) => {
    if (page < 1 || page > totalPages || page === safeCurrent) return;
    onChange(page, pageSize);
  };

  const renderPages = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (safeCurrent > 3) pages.push('ellipsis-start');
      const start = Math.max(2, safeCurrent - 1);
      const end = Math.min(totalPages - 1, safeCurrent + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (safeCurrent < totalPages - 2) pages.push('ellipsis-end');
      pages.push(totalPages);
    }

    return pages.map((p, idx) => {
      if (typeof p === 'string') {
        return (
          <span
            key={`ellipsis-${idx}`}
            className="body-xs"
            style={{ padding: '0 var(--space-4)', color: 'var(--text-subtle)' }}
            aria-hidden="true"
          >
            ...
          </span>
        );
      }

      const isActive = p === safeCurrent;
      return (
        <button
          key={p}
          type="button"
          className={`ecomd-pagination__page body-xs-medium ${isActive ? 'is-active' : ''}`}
          onClick={() => handlePageClick(p)}
          aria-current={isActive ? 'page' : undefined}
          aria-label={`Trang ${p}`}
        >
          {p}
        </button>
      );
    });
  };

  return (
    <div className={`ecomd-pagination body-xs ${className}`} style={style}>
      <div className="ecomd-pagination__info">
        {showTotal ? (
          showTotal(total, [startRange, endRange])
        ) : (
          <span>
            Hiển thị <b>{startRange} - {endRange}</b> trên <b>{total}</b> bản ghi
          </span>
        )}
      </div>

      {totalPages > 1 && (
        <div className="ecomd-pagination__right">
          <IconButton
            icon="chevron-left"
            label="Trang trước"
            size="sm"
            disabled={safeCurrent <= 1}
            onClick={() => handlePageClick(safeCurrent - 1)}
          />
          {renderPages()}
          <IconButton
            icon="chevron-right"
            label="Trang sau"
            size="sm"
            disabled={safeCurrent >= totalPages}
            onClick={() => handlePageClick(safeCurrent + 1)}
          />
        </div>
      )}
    </div>
  );
};
