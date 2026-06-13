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
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative overflow-hidden border border-tan bg-panel ${className}`}>
      {!failed && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={`block h-full w-full object-cover ${imgClassName}`}
          onError={() => setFailed(true)}
        />
      )}
      {failed && (
        <div className="absolute inset-0 grid place-items-center bg-panel p-4 text-center" role="img" aria-label={alt}>
          <div>
            <div className="font-serif text-lg text-teal">{label}</div>
            {note ? <div className="mt-1 text-xs font-bold text-[#8a7059]">{note}</div> : null}
          </div>
        </div>
      )}
    </div>
  );
}
