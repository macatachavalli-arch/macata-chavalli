/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Instagram, Lock } from 'lucide-react';
import { artistProfile } from '../data';

interface FooterProps {
  onOpenAdmin?: () => void;
}

export default function Footer({ onOpenAdmin }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1A1A1A] text-[#F7F7F5] py-8 px-6 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto">
        {/* Lower row */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-[11px] text-[#71716F] font-sans gap-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4 sm:mb-0 justify-center sm:justify-start">
            <span>© 2026 Macata Chavalli</span>
            {onOpenAdmin && (
              <>
                <span className="text-neutral-700 hidden sm:inline">|</span>
                <button
                  onClick={onOpenAdmin}
                  id="btn-footer-admin-access"
                  className="text-[#71716F] hover:text-white transition-colors flex items-center gap-1 uppercase font-mono text-[9px] tracking-wider focus:outline-none"
                >
                  <Lock size={10} /> ADMIN
                </button>
              </>
            )}
          </div>
          <div className="flex gap-3 items-center">
            <a
              href={artistProfile.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Seguir en Instagram"
              className="bg-transparent border border-neutral-800 hover:bg-white hover:text-black text-neutral-400 w-10 h-10 rounded-none transition-colors flex items-center justify-center focus:outline-none"
            >
              <Instagram size={15} />
            </a>
            <button
              id="footer-scroll-top"
              onClick={scrollToTop}
              className="bg-transparent border border-neutral-800 hover:bg-white hover:text-black text-neutral-400 px-5 h-10 rounded-none transition-colors flex items-center justify-center focus:outline-none"
            >
              <span className="font-mono text-[9px] uppercase tracking-[0.2em]">Subir</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
