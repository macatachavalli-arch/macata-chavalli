/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DesignCarouselItem } from '../types';

interface DesignCarouselProps {
  items: DesignCarouselItem[];
}

export default function DesignCarousel({ items }: DesignCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const total = items.length;

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  if (!items || items.length === 0) {
    return null;
  }

  const currentItem = items[currentIndex];

  return (
    <div className="w-screen relative left-1/2 -translate-x-1/2 my-12 overflow-hidden bg-[#111110]">
      {/* Edge-to-edge Carousel Frame set to exact 1480:590 aspect ratio */}
      <div className="relative w-full aspect-[1480/590] bg-stone-950 overflow-hidden group">
        <div
          key={currentItem.id || currentIndex}
          className="w-full h-full relative cursor-pointer"
          onClick={() => setLightboxImage(currentItem.imageUrl)}
        >
          <img
            src={currentItem.imageUrl}
            alt="Muestra de trabajo"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover select-none"
          />
        </div>

        {/* Minimalist Side Navigation Arrows */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Anterior"
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/40 hover:bg-black/80 text-white backdrop-blur-sm border border-white/10 flex items-center justify-center cursor-pointer z-10"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Siguiente"
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/40 hover:bg-black/80 text-white backdrop-blur-sm border border-white/10 flex items-center justify-center cursor-pointer z-10"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Bottom Minimalist Indicators / Dots */}
        {total > 1 && (
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-10 bg-black/30 backdrop-blur-md px-4 py-2 border border-white/10">
            {items.map((item, idx) => (
              <button
                key={item.id || idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`transition-all ${
                  idx === currentIndex
                    ? 'w-8 h-1.5 bg-white'
                    : 'w-2 h-1.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Ir a la imagen ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal for pure image view */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute top-6 right-6 p-3 text-white bg-stone-900/80 hover:bg-stone-800 border border-stone-700 cursor-pointer z-10"
              aria-label="Cerrar modal"
            >
              <X size={24} />
            </button>

            <div 
              className="relative max-w-7xl max-h-[92vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightboxImage}
                alt="Diseño ampliado"
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[90vh] object-contain shadow-2xl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
