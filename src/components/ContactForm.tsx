/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { Send, CheckCircle2, MessageSquare, Info, Star, Palette } from 'lucide-react';
import { artistProfile } from '../data';

interface ContactFormProps {
  inquiry: {
    artworkTitle: string;
    size: string;
    frame: string;
    type?: 'obra' | 'encargo' | 'branding';
  } | null;
}

export default function ContactForm({ inquiry }: ContactFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [inquiryType, setInquiryType] = useState<'obra' | 'encargo' | 'general' | 'branding'>('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [artworkInfo, setArtworkInfo] = useState('');

  // Sizing choices for custom commissions
  const [commissionSize, setCommissionSize] = useState('80x80');

  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedLetter, setSubmittedLetter] = useState<any>(null);

  // Autofill subject/message if user chose an artwork in the Gallery or requested Branding
  useEffect(() => {
    if (inquiry) {
      if (inquiry.type === 'branding') {
        setInquiryType('branding');
        setSubject('');
        setArtworkInfo('');
        setMessage('');
      } else {
        setInquiryType('obra');
        setSubject('');
        const hasFrame = inquiry.frame && inquiry.frame !== 'Sin enmarcar';
        setArtworkInfo(hasFrame ? `${inquiry.artworkTitle} (${inquiry.size}, ${inquiry.frame})` : `${inquiry.artworkTitle} (${inquiry.size})`);
        setMessage('');
      }
      
      // Auto-scrolling to Contact section
      const contactSection = document.getElementById('contacto');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [inquiry]);

  // Adjust prefilled values when inquiry type changes
  const handleInquiryTypeChange = (type: 'obra' | 'encargo' | 'general' | 'branding') => {
    setInquiryType(type);
    if (type === 'general') {
      setSubject('');
      setArtworkInfo('');
      setMessage('');
    } else if (type === 'encargo') {
      setSubject('');
      setArtworkInfo('');
      setMessage('');
    } else if (type === 'branding') {
      setSubject('');
      setArtworkInfo('');
      setMessage('');
    } else {
      setSubject('');
      setMessage('');
    }
  };

  // Update commission prefilled message automatically if commission size changes
  useEffect(() => {
    if (inquiryType === 'encargo') {
      setMessage('');
    }
  }, [commissionSize, inquiryType]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("https://formsubmit.co/ajax/macatachavalli@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          Nombre: name,
          Email: email,
          _subject: subject || `Contacto Web - ${inquiryType.toUpperCase()}`,
          Mensaje: message,
          _replyto: email,
          Tipo_de_Consulta: inquiryType === 'obra' ? 'Consulta Obras' : inquiryType === 'encargo' ? 'Encargo Custom' : inquiryType === 'branding' ? 'Proyecto Branding' : 'Mensaje General'
        })
      });

      setIsSubmitting(false);
      setSubmitSuccess(true);
      setSubmittedLetter({
        name,
        email,
        inquiryType: inquiryType === 'obra' ? 'Consulta Obras' : inquiryType === 'encargo' ? 'Encargo Custom' : inquiryType === 'branding' ? 'Proyecto Branding' : 'Mensaje General',
        subject,
        message,
        date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
        fallbackNeeded: !response.ok
      });
      // Clear form except name/email to remember user
      setMessage('');
      setSubject('');
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setSubmittedLetter({
        name,
        email,
        inquiryType: inquiryType === 'obra' ? 'Consulta Obras' : inquiryType === 'encargo' ? 'Encargo Custom' : inquiryType === 'branding' ? 'Proyecto Branding' : 'Mensaje General',
        subject,
        message,
        date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
        fallbackNeeded: true
      });
      setMessage('');
      setSubject('');
    }
  };

  return (
    <section id="contacto" className="py-24 px-6 max-w-4xl mx-auto border-t border-[#E5E5E1]">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-light tracking-[0.2em] uppercase text-[#1A1A1A]" style={{ fontFamily: 'Georgia, serif' }}>
          CONTACTO
        </h2>
        <p 
          className="text-xs text-[#71716F] italic mt-4 max-w-lg mx-auto leading-relaxed"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Si estás interesadx en una obra existente, necesitás un encargo personalizado o una propuesta de branding & diseño, escribime ♡
        </p>
        <div className="w-16 h-[1px] bg-[#1A1A1A] mx-auto mt-6"></div>
      </div>

      <div className="bg-white rounded-none border border-[#E5E5E1] overflow-hidden shadow-none">
        {!submitSuccess ? (
          <form onSubmit={handleSubmit} className="p-8 sm:p-12">
            
            {/* Quick selector of contact route */}
            <div className="mb-10">
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#71716F] font-bold block mb-4 text-center">
                Selecciona el Motivo de tu Mensaje:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  id="btn-inquiry-general"
                  onClick={() => handleInquiryTypeChange('general')}
                  className={`py-4 px-3 text-xs font-mono tracking-widest uppercase rounded-none border transition-all flex flex-col items-center justify-center ${
                    inquiryType === 'general'
                      ? 'bg-[#1A1A1A] text-white border-transparent'
                      : 'bg-transparent text-[#71716F] border-[#E5E5E1] hover:bg-[#F7F7F5]'
                  }`}
                >
                  <span className="text-center">General</span>
                </button>

                <button
                  type="button"
                  id="btn-inquiry-obra"
                  onClick={() => handleInquiryTypeChange('obra')}
                  className={`py-4 px-3 text-xs font-mono tracking-widest uppercase rounded-none border transition-all flex flex-col items-center justify-center ${
                    inquiryType === 'obra'
                      ? 'bg-[#1A1A1A] text-white border-transparent font-bold'
                      : 'bg-transparent text-[#71716F] border-[#E5E5E1] hover:bg-[#F7F7F5]'
                  }`}
                >
                  <span className="text-center">En Catálogo</span>
                </button>

                <button
                  type="button"
                  id="btn-inquiry-encargo"
                  onClick={() => handleInquiryTypeChange('encargo')}
                  className={`py-4 px-3 text-xs font-mono tracking-widest uppercase rounded-none border transition-all flex flex-col items-center justify-center ${
                    inquiryType === 'encargo'
                      ? 'bg-[#1A1A1A] text-white border-transparent'
                      : 'bg-transparent text-[#71716F] border-[#E5E5E1] hover:bg-[#F7F7F5]'
                  }`}
                >
                  <span className="text-center">Por Encargo</span>
                </button>

                <button
                  type="button"
                  id="btn-inquiry-branding"
                  onClick={() => handleInquiryTypeChange('branding')}
                  className={`py-4 px-3 text-xs font-mono tracking-widest uppercase rounded-none border transition-all flex flex-col items-center justify-center ${
                    inquiryType === 'branding'
                      ? 'bg-[#1A1A1A] text-white border-transparent'
                      : 'bg-transparent text-[#71716F] border-[#E5E5E1] hover:bg-[#F7F7F5]'
                  }`}
                >
                  <span className="text-center">Branding / Diseño</span>
                </button>
              </div>
            </div>

            {/* Notification if there is active prefilled gallery data */}
            {inquiryType === 'obra' && artworkInfo && (
              <div className="mb-8 p-4 bg-[#F7F7F5] border border-[#E5E5E1] rounded-none flex items-center justify-between text-xs text-[#1A1A1A] font-sans">
                <span>Estas consultando por el lienzo original: <strong>{artworkInfo}</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    setArtworkInfo('');
                    setSubject('Consulta por obra');
                  }}
                  className="underline hover:opacity-50 font-medium"
                >
                  Limpiar seleccion
                </button>
              </div>
            )}

            {/* Customizer if Commission/Encargos mode is active */}
            {inquiryType === 'encargo' && (
              <div className="mb-8 p-5 bg-[#F7F7F5] rounded-none border border-[#E5E5E1] animate-fade-in font-sans">
                <p className="text-[10px] uppercase font-bold text-[#1A1A1A] tracking-[0.15em] mb-3">
                  Configuración Inicial de Obra Personalizada:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#71716F] block mb-1">Medida aproximada deseada</label>
                    <select
                      value={commissionSize}
                      onChange={(e) => setCommissionSize(e.target.value)}
                      className="w-full text-xs bg-white text-[#1A1A1A] rounded-none border border-[#E5E5E1] p-2 outline-none focus:border-[#1A1A1A]"
                    >
                      <option value="60x60">Mediana Square - 60 x 60 cm</option>
                      <option value="80x80">Mediana Grande Square - 80 x 80 cm</option>
                      <option value="100x100">Gran Formato Square - 100 x 100 cm</option>
                      <option value="120x80">Modular Rectangular - 120 x 80 cm</option>
                      <option value="Medida libre">Otra medida libre (A conversar)</option>
                    </select>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-[11px] text-[#71716F] leading-normal italic">
                      * Las obras personalizadas se entregan firmadas, acompañadas por un certificado de autenticidad y coordinamos directamente la paleta de pigmentos.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Core Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name-input" className="text-[10px] font-mono tracking-widest text-[#71716F] block mb-2 font-bold uppercase">
                  Tu Nombre <span className="text-[#1A1A1A]">*</span>
                </label>
                <input
                  id="name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="María López"
                  className="w-full font-sans bg-[#F7F7F5] text-[#1A1A1A] border border-[#E5E5E1] focus:border-[#1A1A1A] rounded-none px-4 py-3 text-sm outline-none transition-all placeholder-[#A1A19F]"
                />
              </div>

              <div>
                <label htmlFor="email-input" className="text-[10px] font-mono tracking-widest text-[#71716F] block mb-2 font-bold uppercase">
                  Tu Correo Electrónico <span className="text-[#1A1A1A]">*</span>
                </label>
                <input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maria@ejemplo.com"
                  className="w-full font-sans bg-[#F7F7F5] text-[#1A1A1A] border border-[#E5E5E1] focus:border-[#1A1A1A] rounded-none px-4 py-3 text-sm outline-none transition-all placeholder-[#A1A19F]"
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="subject-input" className="text-[10px] font-mono tracking-widest text-[#71716F] block mb-2 font-bold uppercase">
                Asunto del Mensaje
              </label>
              <input
                id="subject-input"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Escribe el asunto..."
                className="w-full font-sans bg-[#F7F7F5] text-[#1A1A1A] border border-[#E5E5E1] focus:border-[#1A1A1A] rounded-none px-4 py-3 text-sm outline-none transition-all placeholder-stone-400 placeholder-[#71716F]/60"
              />
            </div>

            <div className="mb-8">
              <label htmlFor="message-input" className="text-[10px] font-mono tracking-widest text-[#71716F] block mb-2 font-bold uppercase">
                Mensaje <span className="text-[#1A1A1A]">*</span>
              </label>
              <textarea
                id="message-input"
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe el mensaje..."
                className="w-full font-sans bg-[#F7F7F5] text-[#1A1A1A] border border-[#E5E5E1] focus:border-[#1A1A1A] rounded-none px-4 py-3 text-sm outline-none transition-all placeholder-stone-400 placeholder-[#71716F]/60 resize-none"
              />
            </div>

            <button
              id="btn-submit-contact"
              disabled={isSubmitting}
              type="submit"
              className={`w-full py-4 rounded-none text-[10px] tracking-[0.2em] font-mono uppercase font-semibold text-white transition-all duration-300 flex items-center justify-center ${
                isSubmitting ? 'bg-neutral-400 cursor-not-allowed' : 'bg-[#1A1A1A] hover:bg-opacity-90 shadow-none'
              }`}
            >
              {isSubmitting ? 'ENVIANDO MENSAJE...' : 'ENVIAR MENSAJE'}
            </button>
          </form>
        ) : (
          /* Custom interactive receipt page letter visual */
          <div className="p-8 sm:p-12 text-center animate-fade-in font-sans">
            <div className="w-12 h-12 bg-neutral-100 text-[#1A1A1A] border border-neutral-200 rounded-none flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={24} />
            </div>
            
            <h3 className="text-2xl font-light tracking-wide text-[#1A1A1A] mb-10" style={{ fontFamily: 'Georgia, serif' }}>
              {submittedLetter?.fallbackNeeded ? '¡Mensaje Preparado!' : '¡Mensaje Enviado!'}
            </h3>

            {submittedLetter?.fallbackNeeded && (
              <div className="mb-10 text-center">
                <a
                  href={`mailto:macatachavalli@gmail.com?subject=${encodeURIComponent(submittedLetter?.subject || 'Consulta Artística')}&body=${encodeURIComponent(submittedLetter?.message || '')}`}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#1A1A1A] text-white text-[10px] tracking-[0.2em] uppercase hover:bg-neutral-800 transition-all font-mono"
                >
                  <Send size={12} />
                  Enviar por mi email local
                </a>
              </div>
            )}

            {/* Letter Visualization Mockup */}
            <div className="mx-auto max-w-lg bg-[#F7F7F5] p-6 sm:p-8 rounded-none border border-[#E5E5E1] text-left text-xs text-[#4A4A48] font-sans relative">
              <div className="absolute top-4 right-4 bg-[#1A1A1A] text-white px-3 py-1 text-[9px] font-mono tracking-widest uppercase font-semibold">
                {submittedLetter?.inquiryType}
              </div>
              
              <div className="mb-4">
                <span className="text-[10px] uppercase text-[#71716F] font-mono block tracking-wider">Remitente</span>
                <span className="text-[#1A1A1A] font-semibold block text-sm">{submittedLetter?.name}</span>
                <span className="text-[#71716F] italic block">{submittedLetter?.email}</span>
              </div>

              <div className="mb-4 border-t border-[#E5E5E1] pt-4">
                <span className="text-[10px] uppercase text-[#71716F] font-mono block tracking-wider">Asunto</span>
                <span className="text-[#1A1A1A] font-semibold block text-sm">{submittedLetter?.subject}</span>
              </div>

              <div className="mb-6 bg-white p-4 rounded-none border border-[#E5E5E1] leading-relaxed text-[#4A4A48]">
                {submittedLetter?.message.split('\n').map((line: string, i: number) => (
                  <span key={i} className="block min-h-[0.5rem]">{line}</span>
                ))}
              </div>

              <div className="flex justify-between items-center text-[10px] text-[#71716F] font-mono border-t border-[#E5E5E1] pt-4">
                <span>Destino: {artistProfile.email}</span>
                <span>{submittedLetter?.date}</span>
              </div>
            </div>

            <button
              id="btn-return-contact"
              onClick={() => setSubmitSuccess(false)}
              className="mt-10 px-8 py-3 rounded-none border border-[#E5E5E1] text-[10px] tracking-wider uppercase bg-white text-[#1A1A1A] hover:bg-neutral-100 transition-all"
            >
              Enviar otro mensaje
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
