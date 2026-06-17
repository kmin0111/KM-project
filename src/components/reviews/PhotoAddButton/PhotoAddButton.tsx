import { useRef } from 'react';

interface PhotoAddButtonProps {
  label: string;
  accent?: boolean;
  onChange: (file: File | null) => void;
  accept?: string;
}

/**
 * 사진 추가용 빈 영역 버튼.
 * 클릭 시 숨겨진 파일 input을 트리거한다.
 *
 * 같은 파일을 연속해서 선택해도 onChange가 다시 발화하도록
 * onChange 후 input value를 비운다.
 */
export function PhotoAddButton({
  label,
  accent,
  onChange,
  accept = 'image/jpeg,image/png',
}: PhotoAddButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`w-full aspect-[4/3] flex flex-col items-center justify-center border border-dashed rounded-lg text-xs transition-colors cursor-pointer bg-bg-base ${
          accent
            ? 'border-primary/40 text-primary hover:border-primary'
            : 'border-border-base text-text-muted hover:border-primary hover:text-primary'
        }`}
      >
        <span className="text-2xl leading-none mb-1">+</span>
        <span>{label}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          onChange(file);
          // 같은 파일 재선택을 허용하기 위해 value를 리셋
          e.target.value = '';
        }}
        className="hidden"
        aria-label={label}
      />
    </>
  );
}
