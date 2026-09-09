/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowDown, ArrowUpRight, X, Globe } from 'lucide-react';
import Header from './components/Header';
import Gallery from './components/Gallery';
import BioSection from './components/BioSection';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import { artworks as defaultArtworks, defaultDesignProjects, defaultDesignCarouselItems } from './data';
import { Artwork, DesignProject, DesignCarouselItem } from './types';
import AdminPanel from './components/AdminPanel';
import { 
  subscribeArtworks, 
  subscribeDesignProjects, 
  subscribeDesignCarousel,
  seedDefaultsIfEmpty, 
  saveArtworkToCloud, 
  saveDesignProjectToCloud,
  saveCarouselItemToCloud,
  resetCloudToDefaults 
} from './lib/firebase';

export default function App() {
  const [artworksList, setArtworksList] = useState<Artwork[]>(() => {
    const cached = localStorage.getItem('macata_artworks');
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as Artwork[];
        return parsed.map((art) => {
          if (art.description === 'Obra contemporánea texturada con una fina composición libre.') {
            return { ...art, description: '' };
          }
          return art;
        });
      } catch (e) {
        return defaultArtworks;
      }
    }
    return defaultArtworks;
  });

  const [designProjectsList, setDesignProjectsList] = useState<DesignProject[]>(() => {
    const cached = localStorage.getItem('macata_designs');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // Fallback to default
      }
    }
    return defaultDesignProjects;
  });

  const [activeDesignModal, setActiveDesignModal] = useState<DesignProject | null>(null);

  const [carouselList, setCarouselList] = useState<DesignCarouselItem[]>(() => {
    const cached = localStorage.getItem('macata_carousel');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fall back
      }
    }
    return defaultDesignCarouselItems;
  });

  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Initialize Cloud Database & Subscribe to real-time changes
  useEffect(() => {
    let unsubArt: (() => void) | null = null;
    let unsubDesign: (() => void) | null = null;
    let unsubCarousel: (() => void) | null = null;

    async function initCloudSync() {
      // 1. Seed defaults only if cloud Firestore is completely empty
      await seedDefaultsIfEmpty(defaultArtworks, defaultDesignProjects, defaultDesignCarouselItems);

      // 2. Subscribe to real-time cloud changes for artworks
      unsubArt = subscribeArtworks((cloudArtworks) => {
        if (cloudArtworks && cloudArtworks.length > 0) {
          setArtworksList(cloudArtworks);
          localStorage.setItem('macata_artworks', JSON.stringify(cloudArtworks));
        }
      });

      // 3. Subscribe to real-time cloud changes for design projects (read-only in listener, no recursive writes)
      unsubDesign = subscribeDesignProjects((cloudDesigns) => {
        if (cloudDesigns && cloudDesigns.length > 0) {
          setDesignProjectsList(cloudDesigns);
          localStorage.setItem('macata_designs', JSON.stringify(cloudDesigns));
        }
      });

      // 4. Subscribe to real-time cloud changes for design carousel
      unsubCarousel = subscribeDesignCarousel((cloudCarousel) => {
        if (cloudCarousel && cloudCarousel.length > 0) {
          setCarouselList(cloudCarousel);
          localStorage.setItem('macata_carousel', JSON.stringify(cloudCarousel));
        }
      });
    }

    initCloudSync();

    return () => {
      if (unsubArt) unsubArt();
      if (unsubDesign) unsubDesign();
      if (unsubCarousel) unsubCarousel();
    };
  }, []);

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
        carouselItems={carouselList}
        setCarouselItems={setCarouselList}
        onResetToDefaults={async () => {
          localStorage.removeItem('macata_artworks');
          localStorage.removeItem('macata_designs');
          localStorage.removeItem('macata_carousel');
          await resetCloudToDefaults(defaultArtworks, defaultDesignProjects, defaultDesignCarouselItems);
          setArtworksList(defaultArtworks);
          setDesignProjectsList(defaultDesignProjects);
          setCarouselList(defaultDesignCarouselItems);
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

        {/* Branding Projects Grid: Tarjetas con foto y pie de foto */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {designProjectsList.map((project) => (
            <div 
              key={project.id} 
              className="bg-white border border-[#E5E5E1] flex flex-col justify-between group hover:border-stone-400 transition-all duration-300 shadow-sm overflow-hidden"
            >
              {/* Foto de la tarjeta */}
              {project.imageUrl && (
                <div 
                  className="w-full aspect-[16/11] bg-[#F7F7F5] overflow-hidden cursor-pointer relative border-b border-[#E5E5E1]"
                  onClick={() => setActiveDesignModal(project)}
                  title="Ampliar imagen"
                >
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                </div>
              )}

              {/* Pie de foto con título y breve texto (opcional) */}
              <div className="p-6 sm:p-7 flex flex-col justify-between flex-1">
                <div>
                  <h3 
                    className={`text-lg sm:text-xl font-light text-[#1A1A1A] leading-snug ${
                      project.description && project.description.trim().length > 0 ? 'mb-3' : 'mb-0'
                    }`} 
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    {project.title}
                  </h3>
                  {project.description && project.description.trim().length > 0 ? (
                    <p className="text-xs text-[#71716F] leading-relaxed font-sans">
                      {project.description}
                    </p>
                  ) : null}
                </div>

                {/* Enlace al sitio web del proyecto si fue configurado */}
                {project.websiteUrl && project.websiteUrl.trim().length > 0 && (
                  <div className="mt-5 pt-4 border-t border-[#E5E5E1] flex items-center justify-between">
                    <a
                      href={project.websiteUrl.startsWith('http://') || project.websiteUrl.startsWith('https://') 
                        ? project.websiteUrl 
                        : `https://${project.websiteUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#1A1A1A] hover:text-[#71716F] transition-colors group/link"
                      title={`Visitar sitio web: ${project.websiteUrl}`}
                    >
                      <Globe size={13} className="text-stone-600" />
                      <span className="underline underline-offset-4">Ver sitio web</span>
                      <ArrowUpRight size={13} className="transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}

          {designProjectsList.length === 0 && (
            <div className="col-span-full py-16 text-center text-[#71716F] font-mono text-[10px] uppercase tracking-widest border border-dashed border-[#E5E5E1] bg-white">
              No hay tarjetas de diseño publicadas por el momento.
            </div>
          )}
        </div>
      </section>

      {/* Design Project Photo Lightbox Modal */}
      {activeDesignModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveDesignModal(null)}
        >
          <div 
            className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col border border-[#E5E5E1] shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveDesignModal(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white text-[#1A1A1A] transition-all border border-[#E5E5E1]"
              title="Cerrar vista previa"
            >
              <X size={18} />
            </button>

            {activeDesignModal.imageUrl && (
              <div className="w-full max-h-[60vh] bg-stone-100 flex items-center justify-center overflow-hidden border-b border-[#E5E5E1]">
                <img
                  src={activeDesignModal.imageUrl}
                  alt={activeDesignModal.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
              </div>
            )}

            <div className="p-6 sm:p-8">
              <h3 
                className={`text-2xl font-light text-[#1A1A1A] ${
                  activeDesignModal.description && activeDesignModal.description.trim().length > 0 ? 'mb-3' : 'mb-0'
                }`} 
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {activeDesignModal.title}
              </h3>
              {activeDesignModal.description && activeDesignModal.description.trim().length > 0 ? (
                <p className="text-sm text-[#71716F] leading-relaxed font-sans">
                  {activeDesignModal.description}
                </p>
              ) : null}

              {activeDesignModal.websiteUrl && activeDesignModal.websiteUrl.trim().length > 0 && (
                <div className="mt-6 pt-4 border-t border-[#E5E5E1] flex items-center">
                  <a
                    href={activeDesignModal.websiteUrl.startsWith('http://') || activeDesignModal.websiteUrl.startsWith('https://') 
                      ? activeDesignModal.websiteUrl 
                      : `https://${activeDesignModal.websiteUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#1A1A1A] hover:text-stone-600 transition-colors underline underline-offset-4 group/modalLink"
                  >
                    <Globe size={14} />
                    <span>Visitar sitio web del proyecto</span>
                    <ArrowUpRight size={14} className="transition-transform group-hover/modalLink:translate-x-0.5 group-hover/modalLink:-translate-y-0.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Biography Section */}
      <BioSection />

      {/* Contact Form Section */}
      <ContactForm inquiry={activeInquiry} />

      {/* Universal Footer */}
      <Footer onOpenAdmin={() => setIsAdminOpen(true)} />

    </div>
  );
}

