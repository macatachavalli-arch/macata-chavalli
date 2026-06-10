/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Lock, Plus, Trash2, Eye, Sparkles, Image, LogOut, CheckCircle, RotateCcw } from 'lucide-react';
import { Artwork, DesignProject } from '../types';
import { collections } from '../data';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  artworks: Artwork[];
  setArtworks: (artworks: Artwork[]) => void;
  designProjects: DesignProject[];
  setDesignProjects: (projects: DesignProject[]) => void;
  onResetToDefaults: () => void;
}

export default function AdminPanel({
  isOpen,
  onClose,
  artworks,
  setArtworks,
  designProjects,
  setDesignProjects,
  onResetToDefaults
}: AdminPanelProps) {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('macata_admin_auth') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'obras' | 'diseños'>('obras');

  // New Artwork Form State
  const [artTitle, setArtTitle] = useState('');
  const [artYear, setArtYear] = useState('2026');
  const [artMedium, setArtMedium] = useState('');
  const [artSize, setArtSize] = useState('');
  const [artCol, setArtCol] = useState('prisma');
  const [artDesc, setArtDesc] = useState('');
  const [artImgUrl, setArtImgUrl] = useState('');
  const [artFeatured, setArtFeatured] = useState(false);

  // Suggested Artwork URLs for convenience
  const artPresetUrls = [
    { name: 'Abstracción de Arcilla', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80' },
    { name: 'Oceano Profundo', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80' },
    { name: 'Botánico Orgánico', url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80' },
    { name: 'Minimalismo Pálido', url: 'https://images.unsplash.com/photo-1533158326339-7f3cf2404354?auto=format&fit=crop&w=800&q=80' },
  ];

  // New Design Project Form State
  const [designTitle, setDesignTitle] = useState('');
  const [designNum, setDesignNum] = useState('');
  const [designDesc, setDesignDesc] = useState('');
  const [designBadgeLeft, setDesignBadgeLeft] = useState('');
  const [designBadgeRight, setDesignBadgeRight] = useState('★ Premium');

  // Success Indicators
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'macata' && password === 'macata0378') {
      setIsAuthenticated(true);
      setErrorMsg('');
      localStorage.setItem('macata_admin_auth', 'true');
    } else {
      setErrorMsg('Usuario o contraseña incorrectos.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('macata_admin_auth');
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Add Artwork Submit
  const handleAddArtwork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artTitle || !artMedium || !artSize) {
      setErrorMsg('Por favor completa los campos principales de la obra.');
      return;
    }

    const defaultImg = artImgUrl.trim() || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80';

    const newArt: Artwork = {
      id: `custom-art-${Date.now()}`,
      title: artTitle,
      collection: artCol,
      year: artYear,
      medium: artMedium,
      size: artSize,
      imageUrl: defaultImg,
      description: artDesc || 'Obra contemporánea texturada con una fina composición libre.',
      featured: artFeatured
    };

    const updated = [newArt, ...artworks];
    setArtworks(updated);
    localStorage.setItem('macata_artworks', JSON.stringify(updated));

    // Clear Form
    setArtTitle('');
    setArtMedium('');
    setArtSize('');
    setArtDesc('');
    setArtImgUrl('');
    setErrorMsg('');
    setArtFeatured(false);
    showSuccess('¡Obra agregada con éxito al catálogo!');
  };

  // Add Design Project Submit
  const handleAddDesign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!designTitle || !designDesc) {
      setErrorMsg('Por favor completa el título y la descripción del proyecto de diseño.');
      return;
    }

    // Auto-compute unique number label if blank
    const autoNum = designNum.trim() || `0${designProjects.length + 1} / PROYECTO`;

    const newDesign: DesignProject = {
      id: `custom-design-${Date.now()}`,
      num: autoNum.toUpperCase(),
      title: designTitle,
      description: designDesc,
      badgeLeft: designBadgeLeft || 'Dirección Creativa',
      badgeRight: designBadgeRight
    };

    const updated = [...designProjects, newDesign];
    setDesignProjects(updated);
    localStorage.setItem('macata_designs', JSON.stringify(updated));

    // Clear Form
    setDesignTitle('');
    setDesignNum('');
    setDesignDesc('');
    setDesignBadgeLeft('');
    setDesignBadgeRight('★ Premium');
    setErrorMsg('');
    showSuccess('¡Proyecto de Diseño y Branding agregado con éxito!');
  };

  // Delete Artwork
  const handleDeleteArtwork = (id: string) => {
    if (confirm('¿Estás segura de eliminar esta obra?')) {
      const updated = artworks.filter(a => a.id !== id);
      setArtworks(updated);
      localStorage.setItem('macata_artworks', JSON.stringify(updated));
      showSuccess('Obra eliminada.');
    }
  };

  // Delete Design Project
  const handleDeleteDesign = (id: string) => {
    if (confirm('¿Estás segura de eliminar este proyecto de diseño?')) {
      const updated = designProjects.filter(p => p.id !== id);
      setDesignProjects(updated);
      localStorage.setItem('macata_designs', JSON.stringify(updated));
      showSuccess('Proyecto de diseño eliminado.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F7F7F5] border border-[#E5E5E1] w-full max-w-4xl max-h-[90vh] flex flex-col rounded-none shadow-2xl overflow-hidden relative">
        
        {/* Header bar of admin panel */}
        <div className="bg-[#1A1A1A] text-[#F7F7F5] px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Lock size={15} className="text-stone-400" />
            <h2 className="font-caslon text-lg uppercase tracking-widest text-[#F7F7F5]">
              Atelier Privado • {isAuthenticated ? 'Administración' : 'Acceso Autorizado'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
            title="Cerrar Panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal content viewport */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          
          {!isAuthenticated ? (
            /* LOGIN CONTAINER */
            <div className="max-w-md mx-auto py-12 text-center">
              <span className="text-[10px] tracking-[0.2em] font-bold text-[#71716F] uppercase italic block mb-3">
                Solo para uso de Macata Chavalli
              </span>
              <h3 className="text-2xl font-light tracking-widest uppercase mb-8" style={{ fontFamily: 'Georgia, serif' }}>
                Ingresar Credenciales
              </h3>

              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#71716F] font-bold block mb-1.5">
                    Usuario
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder=""
                    required
                    className="w-full text-xs font-mono bg-white text-[#1A1A1A] border border-[#E5E5E1] px-4 py-3 rounded-none outline-none focus:border-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#71716F] font-bold block mb-1.5">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=""
                    required
                    className="w-full text-xs font-mono bg-white text-[#1A1A1A] border border-[#E5E5E1] px-4 py-3 rounded-none outline-none focus:border-[#1A1A1A]"
                  />
                </div>

                {errorMsg && (
                  <p className="text-red-700 text-[11px] font-mono tracking-wide bg-red-50 p-2.5 border border-red-100 uppercase">
                    ⚠ {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#1A1A1A] text-white hover:bg-stone-800 py-3.5 px-6 rounded-none text-[10px] tracking-[0.25em] font-sans uppercase font-bold transition-all mt-4"
                >
                  Acceder al Atelier
                </button>
              </form>
            </div>
          ) : (
            /* LOGGED-IN DASHBOARD CONTAINER */
            <div className="space-y-8">
              
              {/* Dashboard Sub-Header bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E5E1] pb-6">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono text-[#71716F] font-bold">
                    <Sparkles size={11} className="text-amber-600 animate-spin-slow" /> Sesión Iniciada como Macata Chavalli
                  </div>
                  <h3 className="text-2xl font-light tracking-wider uppercase text-[#1a1a1a] mt-1" style={{ fontFamily: 'Georgia, serif' }}>
                    Gestor de Portfolio & Obras
                  </h3>
                </div>
                
                {/* Control Action buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      if (confirm('¿Deseas restaurar todo al catálogo por defecto? Tus cambios creados se perderán.')) {
                        onResetToDefaults();
                        showSuccess('Se restauraron los datos por defecto.');
                      }
                    }}
                    className="flex items-center gap-2 bg-transparent text-stone-600 hover:text-black hover:bg-stone-100 border border-stone-300 px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest transition-all"
                    title="Restablecer catálogo a su estado inicial de fábrica"
                  >
                    <RotateCcw size={12} />
                    <span>Restablecer</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-stone-200 hover:bg-stone-300 text-stone-800 px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest transition-all"
                  >
                    <LogOut size={12} />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>

              {/* Status messages / Toast style inside popup */}
              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 text-[11px] font-mono tracking-widest uppercase flex items-center gap-2.5">
                  <CheckCircle size={15} className="text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Tabs selector */}
              <div className="flex gap-4 border-b border-[#E5E5E1]">
                <button
                  onClick={() => setActiveTab('obras')}
                  className={`pb-3 text-xs tracking-[0.2em] uppercase font-bold transition-all ${
                    activeTab === 'obras'
                      ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]'
                      : 'text-[#71716F] hover:text-[#1A1A1A]'
                  }`}
                >
                  Obras de Arte ({artworks.length})
                </button>
                <button
                  onClick={() => setActiveTab('diseños')}
                  className={`pb-3 text-xs tracking-[0.2em] uppercase font-bold transition-all ${
                    activeTab === 'diseños'
                      ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]'
                      : 'text-[#71716F] hover:text-[#1A1A1A]'
                  }`}
                >
                  Diseño & Branding ({designProjects.length})
                </button>
              </div>

              {/* TAB 1: OBRAS / ARTWORKS MANAGEMENT */}
              {activeTab === 'obras' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left Column: Form to Upload Artwork */}
                  <div className="lg:col-span-5 bg-white p-6 border border-[#E5E5E1] space-y-4">
                    <h4 className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#1A1A1A] font-bold border-b border-[#E5E5E1] pb-2">
                      ✦ Cargar Nueva Obra
                    </h4>

                    <form onSubmit={handleAddArtwork} className="space-y-4 text-xs">
                      <div>
                        <label className="font-mono uppercase tracking-wider text-[9px] text-[#71716F] block mb-1">
                          Título de la Obra *
                        </label>
                        <input
                          type="text"
                          value={artTitle}
                          onChange={(e) => setArtTitle(e.target.value)}
                          placeholder="Ej: Siluetas de la Patagonia"
                          required
                          className="w-full text-xs font-sans bg-[#F7F7F5] outline-none text-[#1A1A1A] p-2.5 border border-[#E5E5E1] focus:border-[#1A1A1A]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-mono uppercase tracking-wider text-[9px] text-[#71716F] block mb-1">
                            Año *
                          </label>
                          <input
                            type="text"
                            value={artYear}
                            onChange={(e) => setArtYear(e.target.value)}
                            required
                            className="w-full text-xs font-sans bg-[#F7F7F5] outline-none text-[#1A1A1A] p-2.5 border border-[#E5E5E1] focus:border-[#1A1A1A]"
                          />
                        </div>
                        <div>
                          <label className="font-mono uppercase tracking-wider text-[9px] text-[#71716F] block mb-1">
                            Dimensiones *
                          </label>
                          <input
                            type="text"
                            value={artSize}
                            onChange={(e) => setArtSize(e.target.value)}
                            placeholder="Ej: 90 x 90 cm"
                            required
                            className="w-full text-xs font-sans bg-[#F7F7F5] outline-none text-[#1A1A1A] p-2.5 border border-[#E5E5E1] focus:border-[#1A1A1A]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-mono uppercase tracking-wider text-[9px] text-[#71716F] block mb-1">
                          Colección / Serie *
                        </label>
                        <select
                          value={artCol}
                          onChange={(e) => setArtCol(e.target.value)}
                          className="w-full text-xs font-sans bg-[#F7F7F5] outline-none text-[#1A1A1A] p-2.5 border border-[#E5E5E1] focus:border-[#1A1A1A]"
                        >
                          {collections.filter(c => c.id !== 'todos').map(col => (
                            <option key={col.id} value={col.id}>{col.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="font-mono uppercase tracking-wider text-[9px] text-[#71716F] block mb-1">
                          Técnica & Materiales *
                        </label>
                        <input
                          type="text"
                          value={artMedium}
                          onChange={(e) => setArtMedium(e.target.value)}
                          placeholder="Ej: Acrílico texturado sobre lienzo"
                          required
                          className="w-full text-xs font-sans bg-[#F7F7F5] outline-none text-[#1A1A1A] p-2.5 border border-[#E5E5E1] focus:border-[#1A1A1A]"
                        />
                      </div>

                      <div>
                        <label className="font-mono uppercase tracking-wider text-[9px] text-[#71716F] block mb-1">
                          Enlace de la Imagen (URL)
                        </label>
                        <input
                          type="url"
                          value={artImgUrl}
                          onChange={(e) => setArtImgUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full text-xs font-sans bg-[#F7F7F5] outline-none text-[#1A1A1A] p-2.5 border border-[#E5E5E1] focus:border-[#1A1A1A] mb-1"
                        />
                        <span className="text-[9px] text-[#71716F]">
                          Dejar vacío para usar una pintura representativa por defecto.
                        </span>
                      </div>

                      {/* Presets visual help */}
                      <div className="bg-[#F7F7F5] p-2.5 border border-[#E5E5E1]">
                        <span className="text-[8px] font-mono uppercase tracking-widest text-stone-500 block mb-1">Preseteados de Arte:</span>
                        <div className="flex flex-wrap gap-1">
                          {artPresetUrls.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setArtImgUrl(preset.url)}
                              className="text-[8px] font-sans px-2 py-1 bg-white border border-stone-300 hover:bg-stone-950 hover:text-white transition-colors"
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="font-mono uppercase tracking-wider text-[9px] text-[#71716F] block mb-1">
                          Descripción o Detalle Poético
                        </label>
                        <textarea
                          value={artDesc}
                          onChange={(e) => setArtDesc(e.target.value)}
                          placeholder="Describe brevemente la sensación, relieve u origen de la obra..."
                          rows={3}
                          className="w-full text-xs font-sans bg-[#F7F7F5] outline-none text-[#1A1A1A] p-2.5 border border-[#E5E5E1] focus:border-[#1A1A1A]"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="art-featured"
                          checked={artFeatured}
                          onChange={(e) => setArtFeatured(e.target.checked)}
                          className="rounded-none border-stone-300 text-stone-900 focus:ring-stone-900"
                        />
                        <label htmlFor="art-featured" className="font-mono uppercase tracking-wider text-[9px] text-[#1a1a1a] select-none">
                          Destacar en Portada principal
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#1A1A1A] text-white hover:bg-stone-800 py-3 rounded-none text-[9px] font-sans font-bold uppercase tracking-[0.2em] transition-all"
                      >
                        Publicar Obra en Galería
                      </button>
                    </form>
                  </div>

                  {/* Right Column: List of Existing Artworks & Delete Action */}
                  <div className="lg:col-span-7 space-y-3">
                    <h4 className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#1A1A1A] font-bold border-b border-[#E5E5E1] pb-2">
                      ✦ Obras cargadas ({artworks.length})
                    </h4>
                    
                    <div className="space-y-3 max-h-[550px] overflow-y-auto pr-2">
                      {artworks.map((art) => (
                        <div key={art.id} className="bg-white p-4 border border-[#E5E5E1] flex justify-between items-center gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-[#EAEAE8] border border-stone-200 overflow-hidden shrink-0">
                              <img src={art.imageUrl} alt={art.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div>
                              <span className="text-[9px] font-mono tracking-wider text-[#A1A19F] bg-stone-100 px-1.5 py-0.5 uppercase">
                                {art.collection.toUpperCase()}
                              </span>
                              <h5 className="text-sm font-light text-stone-900 mt-1" style={{ fontFamily: 'Georgia, serif' }}>
                                {art.title}
                              </h5>
                              <p className="text-[10px] font-mono text-stone-500">
                                {art.size} • {art.year} • {art.medium}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteArtwork(art.id)}
                            className="p-2.5 text-stone-400 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                            title="Eliminar Obra"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: DISEÑOS / BRANDING WORK MANAGEMENT */}
              {activeTab === 'diseños' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left Column: Form to Upload Design Work */}
                  <div className="lg:col-span-5 bg-white p-6 border border-[#E5E5E1] space-y-4">
                    <h4 className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#1A1A1A] font-bold border-b border-[#E5E5E1] pb-2">
                      ✦ Cargar Trabajo de Diseño
                    </h4>

                    <form onSubmit={handleAddDesign} className="space-y-4 text-xs">
                      <div>
                        <label className="font-mono uppercase tracking-wider text-[9px] text-[#71716F] block mb-1">
                          Título del Proyecto *
                        </label>
                        <input
                          type="text"
                          value={designTitle}
                          onChange={(e) => setDesignTitle(e.target.value)}
                          placeholder="Ej: Identidad para Galería Nómade"
                          required
                          className="w-full text-xs font-sans bg-[#F7F7F5] outline-none text-[#1A1A1A] p-2.5 border border-[#E5E5E1] focus:border-[#1A1A1A]"
                        />
                      </div>

                      <div>
                        <label className="font-mono uppercase tracking-wider text-[9px] text-[#71716F] block mb-1">
                          Etiqueta Numérica (Opcional)
                        </label>
                        <input
                          type="text"
                          value={designNum}
                          onChange={(e) => setDesignNum(e.target.value)}
                          placeholder="Ej: 04 / ID ORGÁNICA"
                          className="w-full text-xs font-sans bg-[#F7F7F5] outline-none text-[#1A1A1A] p-2.5 border border-[#E5E5E1] focus:border-[#1A1A1A]"
                        />
                        <span className="text-[9px] text-[#71716F] block mt-1">
                          Se auto-completará en base a la grilla si se deja en blanco.
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-mono uppercase tracking-wider text-[9px] text-[#71716F] block mb-1">
                            Detalle Estilo (Izquierda)
                          </label>
                          <input
                            type="text"
                            value={designBadgeLeft}
                            onChange={(e) => setDesignBadgeLeft(e.target.value)}
                            placeholder="Ej: Diseño de Empaque"
                            className="w-full text-xs font-sans bg-[#F7F7F5] outline-none text-[#1A1A1A] p-2.5 border border-[#E5E5E1] focus:border-[#1A1A1A]"
                          />
                        </div>
                        <div>
                          <label className="font-mono uppercase tracking-wider text-[9px] text-[#71716F] block mb-1">
                            Sello Estilo (Derecha)
                          </label>
                          <input
                            type="text"
                            value={designBadgeRight}
                            onChange={(e) => setDesignBadgeRight(e.target.value)}
                            className="w-full text-xs font-sans bg-[#F7F7F5] outline-none text-[#1A1A1A] p-2.5 border border-[#E5E5E1] focus:border-[#1A1A1A]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-mono uppercase tracking-wider text-[9px] text-[#71716F] block mb-1">
                          Descripción del Proyecto *
                        </label>
                        <textarea
                          value={designDesc}
                          onChange={(e) => setDesignDesc(e.target.value)}
                          required
                          placeholder="Diseño de marca integral y material botánico..."
                          rows={4}
                          className="w-full text-xs font-sans bg-[#F7F7F5] outline-none text-[#1A1A1A] p-2.5 border border-[#E5E5E1] focus:border-[#1A1A1A]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#1A1A1A] text-white hover:bg-stone-800 py-3 rounded-none text-[9px] font-sans font-bold uppercase tracking-[0.2em] transition-all justify-center items-center"
                      >
                        Publicar Proyecto de Diseño
                      </button>
                    </form>
                  </div>

                  {/* Right Column: List of Existing Design Projects & Delete Action */}
                  <div className="lg:col-span-7 space-y-3">
                    <h4 className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#1A1A1A] font-bold border-b border-[#E5E5E1] pb-2">
                      ✦ Proyectos de diseño ({designProjects.length})
                    </h4>

                    <div className="space-y-3 max-h-[550px] overflow-y-auto pr-2">
                      {designProjects.map((p) => (
                        <div key={p.id} className="bg-white p-4 border border-[#E5E5E1] flex justify-between items-center gap-4">
                          <div>
                            <span className="text-[9px] font-mono tracking-widest text-[#71716F] block">
                              {p.num}
                            </span>
                            <h5 className="text-sm font-light text-stone-900 mt-1" style={{ fontFamily: 'Georgia, serif' }}>
                              {p.title}
                            </h5>
                            <p className="text-[10px] text-stone-500 font-sans mt-1 line-clamp-2 max-w-lg leading-relaxed">
                              {p.description}
                            </p>
                            <div className="flex gap-2 mt-2 text-[8px] font-mono uppercase tracking-wider text-[#1a1a1a]">
                              <span className="bg-stone-100 px-1.5 py-0.5">{p.badgeLeft}</span>
                              <span className="bg-stone-100 px-1.5 py-0.5 text-amber-700">{p.badgeRight}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteDesign(p.id)}
                            className="p-2.5 text-stone-400 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                            title="Eliminar Proyecto"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
