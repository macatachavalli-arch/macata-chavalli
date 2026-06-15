/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import Header from './components/Header';
import Gallery from './components/Gallery';
import BioSection from './components/BioSection';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import { artworks as defaultArtworks, defaultDesignProjects } from './data';
import { Artwork, DesignProject } from './types';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [artworksList, setArtworksList] = useState<Artwork[]>(() => {
    const cached = localStorage.getItem('macata_artworks');
    return cached ? JSON.parse(cached) : defaultArtworks;
  });

  const [designProjectsList, setDesignProjectsList] = useState<DesignProject[]>(() => {
    const cached = localStorage.getItem('macata_designs');
    if (cached) {
      const parsed = JSON.parse(cached);
      const hasOldData = parsed.some((p: any) => 
        p.num === '01 / ID SÓLIDAS' || 
        p.num === '02 / ENVASES TÁCTILES' || 
        p.num === '03 / LIBROS & CATÁLOGOS' ||
        p.title === 'Sistemas de Identidad' ||
        p.title === 'Arte Gestual' ||
        (p.id === 'design-1' && p.description?.includes('selectos')) ||
        (p.id === 'design-2' && (p.description?.includes('Distribución equilibrada') || !p.description?.includes('acompañamiento'))) ||
        (p.id === 'design-3' && (p.description?.includes('Pintura abstracta') || p.description?.includes('logotipo gestual.')))
      );
      if (hasOldData) {
        localStorage.setItem('macata_designs', JSON.stringify(defaultDesignProjects));
        return defaultDesignProjects;
      }
      return parsed;
    }
    return defaultDesignProjects;
  });

  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const [activeInquiry, setActiveInquiry] = useState<{
    artworkTitle: string;
    size: string;
    frame: string;
    type?: 'obra' | 'encargo' | 'branding';
  } | null>(null);

  // Callback from gallery artwork lightbox to autofill contact form
  const handleInquire = (artwork: Artwork, config: { size: string; frame: string }) => {
    setActiveInquiry({
      artworkTitle: artwork.title,
      size: config.size,
      frame: config.frame
    });
  };

  // Get the featured artwork image (Vibrant Canvas) for the hero mockup
  const heroArtwork = artworksList[0] || defaultArtworks[0];

  if (isAdminOpen) {
    return (
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        artworks={artworksList}
        setArtworks={setArtworksList}
        designProjects={designProjectsList}
        setDesignProjects={setDesignProjectsList}
        onResetToDefaults={() => {
          localStorage.removeItem('macata_artworks');
          localStorage.removeItem('macata_designs');
          setArtworksList(defaultArtworks);
          setDesignProjectsList(defaultDesignProjects);
        }}
      />
    );
  }

  return (
    <div className="bg-[#F7F7F5] min-h-screen relative overflow-x-hidden pt-0 selections:bg-[#1A1A1A]/10 selections:text-[#1A1A1A]">
      
      {/* Crisp minimal architectural background lines */}
      <div className="absolute top-0 left-[20vw] w-[1px] h-full bg-[#E5E5E1]/40 -z-10 pointer-events-none"></div>
      <div className="absolute top-0 left-[80vw] w-[1px] h-full bg-[#E5E5E1]/40 -z-10 pointer-events-none"></div>

      {/* Artist Centered Header in Caslon Antique */}
      <div className="bg-[#F7F7F5] pt-14 pb-8 text-center px-4">
        <h1 className="font-caslon text-4xl sm:text-6xl md:text-7xl tracking-[0.25em] text-[#1A1A1A] uppercase select-none">
          Macata Chavalli
        </h1>
        <div className="w-12 h-[1px] bg-[#1A1A1A]/20 mx-auto mt-4 mb-2"></div>
        <p className="text-[12px] sm:text-[14px] text-[#71716F] select-none tracking-[0.1em]">
          *  ⋆  ★  ⋆  *  ✩  *  ⋆ ★  ⋆  *
        </p>
        <div className="w-12 h-[1px] bg-[#1A1A1A]/20 mx-auto mt-3"></div>
      </div>

      {/* Full-width widescreen visual banner of her atelier/texture */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[21/11] md:aspect-[21/9] lg:aspect-[21/8] xl:aspect-[21/7] overflow-hidden border-y border-[#E5E5E1]">
        <img
          src="https://i.imgur.com/nO6ldB1.jpeg"
          alt="Colección y Texturas Macata Chavalli"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover select-none pointer-events-none scale-[1.01]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-black/5 pointer-events-none" />
      </div>

      {/* Decorative stars and filete below the image */}
      <div className="text-center pt-8 pb-2">
        <p className="text-[12px] sm:text-[14px] text-[#71716F] select-none tracking-[0.1em]">
          *  ⋆  ★  ⋆  *  ✩  *  ⋆ ★  ⋆  *
        </p>
        <div className="w-12 h-[1px] bg-[#1A1A1A]/20 mx-auto mt-3"></div>
      </div>

      {/* Floating Header sits overlaying the banner image */}
      <Header />



      {/* Gallery Section */}
      <Gallery onInquire={handleInquire} artworksList={artworksList} />

      {/* Branding & Design Section */}
      <section id="branding" className="py-24 px-6 max-w-7xl mx-auto border-t border-[#E5E5E1]">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-light tracking-[0.2em] uppercase text-[#1A1A1A]" style={{ fontFamily: 'Georgia, serif' }}>
            Branding & Diseño
          </h2>
          <div className="w-16 h-[1px] bg-[#1A1A1A] mx-auto mt-6"></div>
        </div>

        {/* Branding Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {designProjectsList.map((project) => (
            <div key={project.id} className="bg-white p-8 border border-[#E5E5E1] flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#71716F] block mb-4">
                  {project.num}
                </span>
                <h3 className="text-xl font-light text-[#1A1A1A] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                  {project.title}
                </h3>
                <p className="text-xs text-[#71716F] leading-relaxed mb-6 font-sans">
                  {project.description}
                </p>
              </div>

            </div>
          ))}
          {designProjectsList.length === 0 && (
            <div className="col-span-1 md:col-span-3 py-12 text-center text-stone-400 font-mono text-[10px] uppercase tracking-widest border border-dashed border-[#E5E5E1]">
              No hay proyectos de diseño publicados por el momento.
            </div>
          )}
        </div>


      </section>

      {/* Biography Section */}
      <BioSection />

      {/* Contact Form Section */}
      <ContactForm inquiry={activeInquiry} />

      {/* Universal Footer */}
      <Footer onOpenAdmin={() => setIsAdminOpen(true)} />

    </div>
  );
}

