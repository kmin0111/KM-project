interface PhotoPreviewProps {
  url: string;
  onClear: () => void;
  alt?: string;
}

/**
 * 업로드한 사진의 미리보기.
 * 우측 상단의 닫기 버튼으로 제거할 수 있다.
 */
export function PhotoPreview({ url, onClear, alt = '미리보기' }: PhotoPreviewProps) {
  return (
    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-bg-muted">
      <img src={url} alt={alt} className="w-full h-full object-cover" />
      <button
        type="button"
        onClick={onClear}
        aria-label="사진 제거"
        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-bg-base/90 text-text-heading hover:bg-bg-base shadow-sm border-0 cursor-pointer text-base leading-none"
      >
        ×
      </button>
    </div>
  );
}
