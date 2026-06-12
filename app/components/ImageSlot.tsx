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

export default function ImageSlot({ src, alt, className = "", imgClassName = "" }: ImageSlotProps) {
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
      {failed && <div className="absolute inset-0 bg-panel" aria-hidden="true" />}
    </div>
  );
}
