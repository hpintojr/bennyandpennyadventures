"use client";

import { useState } from "react";

type ImageSlotProps = {
  src: string;
  alt: string;
  label: string;
  note?: string;
  className?: string;
  imgClassName?: string;
};

export default function ImageSlot({ src, alt, label, note, className = "", imgClassName = "" }: ImageSlotProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative overflow-hidden border border-tan bg-panel ${className}`}>
      {!failed && (
        <img
          src={src}
          alt={alt}
          className={`h-full w-full object-cover transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"} ${imgClassName}`}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
      {(!loaded || failed) && (
        <div className="absolute inset-0 grid place-items-center bg-panel/90 p-4 text-center text-teal">
          <div>
            <p className="font-serif text-xl sm:text-2xl">{label}</p>
            {note && <p className="mt-2 text-xs font-semibold text-[#6b5d4f]">{note}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
