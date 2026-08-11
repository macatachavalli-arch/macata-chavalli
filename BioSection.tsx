/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { artistProfile } from '../data';

export default function BioSection() {
  return (
    <section id="biografia" className="bg-[#F7F7F5] py-24 px-6 border-y border-[#E5E5E1]">
      <div className="max-w-4xl mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-light tracking-[0.2em] uppercase text-[#1A1A1A]" style={{ fontFamily: 'Georgia, serif' }}>
            BÍO
          </h2>
          <div className="w-16 h-[1px] bg-[#1A1A1A] mx-auto mt-6"></div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div 
            className="space-y-6 text-[#4A4A48] leading-relaxed text-left"
            style={{ fontFamily: 'Georgia, serif', fontSize: '15px' }}
          >
            {artistProfile.bioParagraphs.map((paragraph, idx) => (
              <p key={idx} className="italic">{paragraph}</p>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
