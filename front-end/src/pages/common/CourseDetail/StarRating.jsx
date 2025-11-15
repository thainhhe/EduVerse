import { useState } from "react";
import { Star } from "lucide-react";

export function StarRating({ value = 0, onChange }) {
  const [hover, setHover] = useState(null);

  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={24}
          className={`cursor-pointer transition-colors duration-150 ${(hover ?? value) >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(null)}
          onClick={() => onChange(star)}
        />
      ))}
    </div>
  );
}
