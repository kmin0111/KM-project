import { useRef, useState } from 'react';

const STAR_VALUES = [1, 2, 3, 4, 5] as const;
const MIN_VALUE = STAR_VALUES[0];
const MAX_VALUE = STAR_VALUES[STAR_VALUES.length - 1];

interface StarRatingProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

/**
 * 별점 선택 컨트롤.
 *
 * - 마우스 hover 또는 키보드 포커스 시 미리보기 값을 표시한다.
 * - 좌/우 화살표 키로 값을 1~5 사이에서 조정할 수 있다.
 * - 접근성: role="slider", aria-valuenow/min/max로 슬라이더 의미 전달.
 */
export function StarRating({ label, value, onChange }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const groupRef = useRef<HTMLDivElement>(null);
  const display = hover || value;

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(Math.max(MIN_VALUE, (value || MIN_VALUE) - 1));
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(Math.min(MAX_VALUE, (value || 0) + 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChange(MIN_VALUE);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(MAX_VALUE);
    }
  }

  /**
   * 포커스가 그룹 내에서만 이동하는 경우 hover 미리보기를 유지하고,
   * 그룹 밖으로 빠져나갈 때만 미리보기를 해제한다.
   */
  function handleBlurCapture(e: React.FocusEvent<HTMLDivElement>) {
    const next = e.relatedTarget as Node | null;
    if (next && groupRef.current?.contains(next)) return;
    setHover(0);
    setIsFocused(false);
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium text-text-heading w-24 shrink-0">
        {label}
      </span>
      <div
        ref={groupRef}
        className="flex items-center gap-1 outline-none"
        role="slider"
        tabIndex={0}
        aria-label={`${label} 별점`}
        aria-valuemin={MIN_VALUE}
        aria-valuemax={MAX_VALUE}
        aria-valuenow={value || MIN_VALUE}
        aria-valuetext={value > 0 ? `${value}점` : '미선택'}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlurCapture={handleBlurCapture}
      >
        {STAR_VALUES.map((n) => {
          const active = n <= display;
          return (
            <button
              key={n}
              type="button"
              tabIndex={-1}
              aria-label={`${label} ${n}점`}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => !isFocused && setHover(0)}
              onClick={() => onChange(n)}
              className={`text-2xl leading-none transition-colors bg-transparent border-0 p-0 cursor-pointer ${
                active ? 'text-warning' : 'text-gray-300 hover:text-warning/60'
              }`}
            >
              ★
            </button>
          );
        })}
      </div>
      <span className="text-sm font-semibold text-text-body w-8 text-right">
        {value > 0 ? value.toFixed(1) : '-'}
      </span>
    </div>
  );
}
