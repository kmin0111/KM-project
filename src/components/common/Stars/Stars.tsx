interface StarsProps {
  rating: number;
  max?: number;
}

export function Stars({ rating, max = 5 }: StarsProps) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`별점 ${max}점 중 ${rating}점`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`text-base ${i < rating ? 'text-warning' : 'text-gray-300'}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}
