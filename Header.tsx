/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Instagram, Mail } from 'lucide-react';
import { artistProfile } from '../data';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 120);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 flex justify-center pointer-events-none ${
        scrolled ? 'pt-3 pb-3' : 'pt-24 sm:pt-32'
      }`}
    >
      <div
        className={`flex items-center gap-6 sm:gap-10 px-8 py-3 rounded-none border transition-all duration-500 font-caslon text-[11px] sm:text-xs tracking-[0.25em] uppercase pointer-events-auto ${
          scrolled
            ? 'bg-[#F7F7F5]/95 backdrop-blur-md border-[#E5E5E1] text-[#1A1A1A] shadow-sm'
            : 'bg-white/85 backdrop-blur-sm border-[#E5E5E1]/40 text-[#1A1A1A] sm:scale-105'
        }`}
      >
        <a href="#galeria" className="hover:opacity-50 transition-opacity">arte</a>
        <span className="text-neutral-300 select-none">•</span>
        <a href="#branding" className="hover:opacity-50 transition-opacity">branding & diseño</a>
        <span className="text-neutral-300 select-none">•</span>
        <a href="#galeria" className="hover:opacity-50 transition-opacity">shop</a>
        <span className="text-neutral-300 select-none">•</span>
        <a href="#biografia" className="hover:opacity-50 transition-opacity">bío</a>
        <span className="text-neutral-300 select-none">•</span>
        <a
          href={artistProfile.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram de Macata Chavalli"
          className="hover:opacity-50 transition-opacity flex items-center justify-center p-0.5"
        >
          <Instagram size={14} />
        </a>
        <span className="text-neutral-300 select-none">•</span>
        <a
          href="#contacto"
          aria-label="Formulario de contacto"
          className="hover:opacity-50 transition-opacity flex items-center justify-center p-0.5"
        >
          <Mail size={14} />
        </a>
      </div>
    </header>
  );
}
