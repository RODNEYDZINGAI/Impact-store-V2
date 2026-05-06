"use client";

import { useState } from "react";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);

  if (!images.length) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
        <div className="flex h-64 w-64 items-center justify-center text-slate-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor" className="h-32 w-32">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      {images.length > 1 && (
        <div className="flex max-h-[30rem] flex-col gap-2 overflow-y-auto">
          {images.map((url, i) => (
            <button
              key={url}
              onClick={() => setSelected(i)}
              className={`flex-shrink-0 overflow-hidden rounded-xl border bg-white transition ${
                i === selected ? "border-[#1f4f8f] shadow-lg shadow-blue-900/10" : "border-slate-200 hover:border-[#fbbf24]"
              }`}
            >
              <img
                src={url}
                alt={`${name} ${i + 1}`}
                className="h-16 w-16 object-cover sm:h-20 sm:w-20"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = "0.3";
                }}
              />
            </button>
          ))}
        </div>
      )}

      <div className="relative flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="aspect-square w-full">
          <img
            src={images[selected]}
            alt={name}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      </div>
    </div>
  );
}
