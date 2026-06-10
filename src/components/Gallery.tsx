/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, X, Sparkles, Send, Check } from 'lucide-react';
import { artworks as defaultArtworks, collections } from '../data';
import { Artwork } from '../types';

interface GalleryProps {
  onInquire: (artwork: Artwork, config: { size: string; frame: string }) => void;
  artworksList?: Artwork[];
}

export default function Gallery({ onInquire, artworksList }: GalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [activeArtwork, setActiveArtwork] = useState<Artwork | null>(null);
  
  // Customizer state inside modal
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedFrame, setSelectedFrame] = useState<'none' | 'wood' | 'black' | 'gold'>('none');

  const currentArtworks = artworksList || defaultArtworks;

  const filteredArtworks = selectedCategory === 'todos'
    ? currentArtworks
    : currentArtworks.filter(art => art.collection === selectedCategory);

  const openLightbox = (art: Artwork) => {
    setActiveArtwork(art);
    setSelectedSize(art.size);
    setSelectedFrame('none');
  };

  const closeLightbox = () => {
    setActiveArtwork(null);
  };

  const handleInquirySubmit = () => {
    if (activeArtwork) {
      let frameLabel = 'Sin enmarcar';
      if (selectedFrame === 'wood') frameLabel = 'Marco de Madera Natural';
      if (selectedFrame === 'black') frameLabel = 'Marco de Madera Negra';
      if (selectedFrame === 'gold') frameLabel = 'Marco Dorado de Galería';

      onInquire(activeArtwork, {
        size: selectedSize,
        frame: frameLabel
      });
      closeLightbox();
    }
  };

  // Get frame styling for the interactive mockup
  const getFrameStyle = () => {
    switch (selectedFrame) {
      case 'wood':
        return 'border-[16px] border-[#8F6A3C] shadow-[0_10px_20px_rgba(0,0,0,0.1)]';
      case 'black':
        return 'border-[16px] border-[#1A1A1A] shadow-[0_10px_20px_rgba(0,0,0,0.15)]';
      case 'gold':
        return 'border-[16px] border-[#C5A059] shadow-[0_10px_20px_rgba(0,0,0,0.15)]';
      default:
        return 'border-0 border-transparent';
    }
  };

  return (
    <section id="galeria" className="py-24 px-6 max-w-7xl mx-auto border-t border-[#E5E5E1]">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-light tracking-[0.2em] uppercase text-[#1A1A1A]" style={{ fontFamily: 'Georgia, serif' }}>
          ARTE
        </h2>
        <div className="w-16 h-[1px] bg-[#1A1A1A] mx-auto mt-6"></div>
      </div>

      {/* Filter Categories */}
      <div className="flex flex-wrap justify-center gap-6 mb-8 border-b border-[#E5E5E1] pb-4">
        {collections.map((col) => (
          <button
            key={col.id}
            id={`btn-filter-${col.id}`}
            onClick={() => setSelectedCategory(col.id)}
            className={`pb-2.5 text-xs transition-all duration-300 font-sans uppercase tracking-[0.15em] font-medium ${
              selectedCategory === col.id
                ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A] font-bold'
                : 'text-[#71716F] hover:text-[#1A1A1A]'
            }`}
          >
            {col.name}
          </button>
        ))}
      </div>

      {/* Category description */}
      <div className="text-center max-w-xl mx-auto mb-16 px-4">
        <p className="text-xs font-sans tracking-wide text-[#71716F]">
          {collections.find(col => col.id === selectedCategory)?.description}
        </p>
      </div>

      {/* Artworks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
        {filteredArtworks.map((art) => (
          <motion.div
            key={art.id}
            layoutId={`card-${art.id}`}
            className="group block relative overflow-hidden bg-white p-6 rounded-none border border-[#E5E5E1] transition-all hover:translate-y-[-2px] cursor-pointer"
            onClick={() => openLightbox(art)}
          >
            {/* Image Wrapper */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-none bg-[#EAEAE8] mb-5">
              <img
                src={art.imageUrl}
                alt={art.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="bg-white p-3 rounded-none text-[#1A1A1A] border border-[#E5E5E1] shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <Maximize2 size={16} />
                </div>
              </div>
            </div>

            {/* Content info */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#71716F] mb-1.5">
                  {art.year} • {art.medium.split(' sobre ')[0]}
                </p>
                <h3 className="text-lg font-light text-[#1A1A1A] tracking-wide transition-colors" style={{ fontFamily: 'Georgia, serif' }}>
                  {art.title}
                </h3>
                <p className="text-xs text-[#71716F] mt-1 font-sans">
                  Dimensión: {art.size}
                </p>
              </div>
              <span className="text-[10px] uppercase tracking-widest font-mono text-[#1A1A1A] border border-[#1A1A1A] px-2.5 py-1 rounded-none font-bold bg-transparent">
                Disponible
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Art Details Lightbox Overlay */}
      <AnimatePresence>
        {activeArtwork && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-[#F7F7F5] text-[#1A1A1A] rounded-none overflow-hidden max-w-4xl w-full relative border border-[#E5E5E1]"
            >
              <button
                id="close-lightbox"
                className="absolute top-5 right-5 z-10 p-2.5 rounded-none bg-white text-[#1A1A1A] hover:bg-neutral-100 transition-colors border border-[#E5E5E1]"
                onClick={closeLightbox}
              >
                <X size={16} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12">
                {/* Visualizer Frame simulation preview */}
                <div className="md:col-span-6 bg-[#EAEAE8] p-8 flex flex-col items-center justify-center min-h-[350px] md:min-h-[500px] border-r border-[#E5E5E1]">
                  <div className="text-center text-[10px] uppercase tracking-[0.2em] text-[#71716F] mb-4 flex items-center gap-1.5 font-sans font-semibold">
                    <Sparkles size={11} className="text-[#1A1A1A]" /> Visualizador de Enmarcado
                  </div>
                  
                  {/* Artwork canvas container */}
                  <div className="w-full max-w-[280px] sm:max-w-[320px] transition-all duration-300">
                    <div className={`transition-all duration-300 relative bg-white ${getFrameStyle()}`}>
                      <img
                        src={activeArtwork.imageUrl}
                        alt="Preview de enmarcado"
                        referrerPolicy="no-referrer"
                        className="w-full object-cover aspect-[4/3] block"
                      />
                    </div>
                  </div>

                  {/* Configurator buttons */}
                  <div className="mt-8 w-full max-w-[320px]">
                    <p className="text-[10px] uppercase tracking-widest text-[#71716F] text-center mb-3">
                      Estilos de Enmarcado:
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={() => setSelectedFrame('none')}
                        className={`py-2 text-[9px] uppercase tracking-widest font-sans rounded-none border transition-all ${
                          selectedFrame === 'none'
                            ? 'bg-[#1A1A1A] text-white border-transparent'
                            : 'bg-white text-[#71716F] border-[#E5E5E1] hover:bg-[#F7F7F5]'
                        }`}
                      >
                        Naked
                      </button>
                      <button
                        onClick={() => setSelectedFrame('wood')}
                        className={`py-2 text-[9px] uppercase tracking-widest font-sans rounded-none border transition-all ${
                          selectedFrame === 'wood'
                            ? 'bg-[#8F6A3C] text-white border-transparent'
                            : 'bg-white text-[#71716F] border-[#E5E5E1] hover:bg-[#F7F7F5]'
                        }`}
                      >
                        Roble
                      </button>
                      <button
                        onClick={() => setSelectedFrame('black')}
                        className={`py-2 text-[9px] uppercase tracking-widest font-sans rounded-none border transition-all ${
                          selectedFrame === 'black'
                            ? 'bg-neutral-900 text-white border-transparent'
                            : 'bg-white text-[#71716F] border-[#E5E5E1] hover:bg-[#F7F7F5]'
                        }`}
                      >
                        Negro
                      </button>
                      <button
                        onClick={() => setSelectedFrame('gold')}
                        className={`py-2 text-[9px] uppercase tracking-widest font-sans rounded-none border transition-all ${
                          selectedFrame === 'gold'
                            ? 'bg-[#C5A059] text-white border-transparent'
                            : 'bg-white text-[#71716F] border-[#E5E5E1] hover:bg-[#F7F7F5]'
                        }`}
                      >
                        Dorado
                      </button>
                    </div>
                  </div>
                </div>

                {/* Description details and CTA */}
                <div className="md:col-span-6 p-8 sm:p-10 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#71716F] font-bold italic block mb-1">
                      Colección {collections.find(col => col.id === activeArtwork.collection)?.name || activeArtwork.collection}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-light tracking-wide text-[#1A1A1A] mt-1 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                      {activeArtwork.title}
                    </h3>

                    {/* Metadata items */}
                    <div className="grid grid-cols-2 gap-4 border-y border-[#E5E5E1] py-4 mb-6 text-xs font-sans text-[#71716F]">
                      <div>
                        <span className="text-[9px] tracking-widest text-[#A1A19F] block uppercase">Técnica</span>
                        <span className="text-[#1A1A1A] font-medium leading-normal">{activeArtwork.medium}</span>
                      </div>
                      <div>
                        <span className="text-[9px] tracking-widest text-[#A1A19F] block uppercase">Dimensiones</span>
                        <span className="text-[#1A1A1A] font-medium">{activeArtwork.size}</span>
                      </div>
                      <div>
                        <span className="text-[9px] tracking-widest text-[#A1A19F] block uppercase">Año de Creación</span>
                        <span className="text-[#1A1A1A] font-medium">{activeArtwork.year}</span>
                      </div>
                      <div>
                        <span className="text-[9px] tracking-widest text-[#A1A19F] block uppercase">Condición</span>
                        <span className="text-[#1A1A1A] font-medium">Original Único</span>
                      </div>
                    </div>

                    <p className="text-sm font-sans font-light text-[#4A4A48] leading-relaxed mb-6">
                      {activeArtwork.description}
                    </p>

                    {/* Choose optional dimensions/custom preferences */}
                    <div className="mb-6">
                      <label className="text-[9px] uppercase tracking-widest text-[#71716F] font-bold block mb-2">
                        ¿Interesado en otra medida? (Encargos):
                      </label>
                      <select
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="w-full text-xs bg-white text-[#1A1A1A] rounded-none border border-[#E5E5E1] p-2.5 outline-none focus:border-[#1A1A1A]"
                      >
                        <option value={activeArtwork.size}>Original de {activeArtwork.size}</option>
                        <option value="50 x 50 cm">Medida estándar: 50 x 50 cm</option>
                        <option value="80 x 80 cm">Medida estándar: 80 x 80 cm</option>
                        <option value="120 x 120 cm">Medida mural: 120 x 120 cm</option>
                        <option value="Medida Personalizada">Medida Personalizada (A convenir)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <button
                      id="submit-inquiry-prefill"
                      onClick={handleInquirySubmit}
                      className="w-full bg-[#1A1A1A] text-white hover:bg-opacity-90 py-3.5 rounded-none text-[10px] tracking-[0.2em] uppercase font-bold flex items-center justify-center"
                    >
                      Consultar por esta Obra
                    </button>
                    <p className="text-[10px] uppercase tracking-widest text-center text-[#A1A19F] mt-3">
                      * El formulario copiará estos datos automáticamente.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
