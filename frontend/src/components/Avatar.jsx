// Avatar.jsx
import { useState, useMemo } from "react";

export default function Avatar({
  src,
  alt = "User avatar",
  name = "",
  size = 48, // px
  online,
  className = "",
}) {
  const [error, setError] = useState(false);

  const initials = useMemo(() => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [name]);

  const sizeClasses = {
    style: { width: size, height: size },
    dot: Math.max(6, Math.round(size * 0.22)), // scales dot with avatar
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      style={sizeClasses.style}
      aria-label={alt}
    >
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full rounded-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <div className="h-full w-full rounded-full bg-gray-200 text-gray-700 grid place-items-center font-semibold">
          <span className="select-none">{initials || "?"}</span>
        </div>
      )}

      {online == true && (
        <span
          className="absolute bottom-0 right-0 rounded-full bg-green-500 ring-2 ring-white"
          style={{ width: sizeClasses.dot, height: sizeClasses.dot }}
          aria-label="online"
        />
      )}
      {online == false && (
        <span
          className="absolute bottom-0 right-0 rounded-full bg-red-500 ring-2 ring-white"
          style={{ width: sizeClasses.dot, height: sizeClasses.dot }}
          aria-label="online"
        />
      )}
    </div>
  );
}
