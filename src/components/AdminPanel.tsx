/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Lock, Plus, Trash2, Sparkles, LogOut, CheckCircle, RotateCcw } from 'lucide-react';
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

  // New & Edit Artwork Form State
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [artTitle, setArtTitle] = useState('');
  const [artYear, setArtYear] = useState('2026');
  const [artMedium, setArtMedium] = useState('');
  const [artSize, setArtSize] = useState('');
  const [artCol, setArtCol] = useState('originales');
  const [artDesc, setArtDesc] = useState('');
  const [artImgUrl1, setArtImgUrl1] = useState('');
  const [artImgUrl2, setArtImgUrl2] = useState('');
  const [artImgUrl3, setArtImgUrl3] = useState('');
  const [artFeatured, setArtFeatured] = useState(false);

  // New & Edit Design Project Form State
  const [editingDesign, setEditingDesign] = useState<DesignProject | null>(null);
  const [designTitle, setDesignTitle] = useState('');
  const [designNum, setDesignNum] = useState('');
  const [designDesc, setDesignDesc] = useState('');
  const [designBadgeLeft, setDesignBadgeLeft] = useState('');
  const [designBadgeRight, setDesignBadgeRight] = useState('★ Premium');

  // Success Indicators
  const [successMsg, setSuccessMsg] = useState('');

  // Inline Delete confirmations tracking
  const [deletingArtId, setDeletingArtId] = useState<string | null>(null);
  const [deletingDesignId, setDeletingDesignId] = useState<string | null>(null);

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
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Reset Artwork Form
  const resetArtworkForm = () => {
    setArtTitle('');
    setArtMedium('');
    setArtSize('');
    setArtDesc('');
    setArtImgUrl1('');
    setArtImgUrl2('');
    setArtImgUrl3('');
    setArtCol('originales');
    setArtYear('2026');
    setArtFeatured(false);
    setEditingArtwork(null);
  };

  // Start Editing Artwork
  const handleStartEditArtwork = (art: Artwork) => {
    setEditingArtwork(art);
    setArtTitle(art.title);
    setArtYear(art.year);
    setArtMedium(art.medium);
    setArtSize(art.size);
    setArtCol(art.collection);
    setArtDesc(art.description);

    // Distribute images
    const imgUrls = art.imageUrls && art.imageUrls.length > 0 ? art.imageUrls : [art.imageUrl];
    setArtImgUrl1(imgUrls[0] || art.imageUrl || '');
    setArtImgUrl2(imgUrls[1] || '');
    setArtImgUrl3(imgUrls[2] || '');

    setArtFeatured(art.featured || false);
    // Smooth scroll to top of workspace content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add or Edit Artwork Submit
  const handleAddArtwork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artTitle || !artMedium || !artSize) {
      setErrorMsg('Por favor completa los campos principales de la obra.');
      return;
    }

    const defaultImg = artImgUrl1.trim() || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80';
    const finalImageUrls = [
      defaultImg,
      ...(artImgUrl2.trim() ? [artImgUrl2.trim()] : []),
      ...(artImgUrl3.trim() ? [artImgUrl3.trim()] : [])
    ];

    const updatedArt: Artwork = {
      id: editingArtwork ? editingArtwork.id : `custom-art-${Date.now()}`,
      title: artTitle,
      collection: artCol,
      year: artYear,
      medium: artMedium,
      size: artSize,
      imageUrl: defaultImg,
      imageUrls: finalImageUrls,
      description: artDesc || 'Obra contemporánea texturada con una fina composición libre.',
      featured: artFeatured
    };

    let updatedList: Artwork[];
    if (editingArtwork) {
      updatedList = artworks.map(a => a.id === editingArtwork.id ? updatedArt : a);
      showSuccess(`¡Se guardaron los cambios de la obra "${artTitle}" con éxito!`);
    } else {
      updatedList = [updatedArt, ...artworks];
      showSuccess('¡Nueva obra agregada con éxito al catálogo!');
    }

    setArtworks(updatedList);
    localStorage.setItem('macata_artworks', JSON.stringify(updatedList));
    resetArtworkForm();
    setErrorMsg('');
  };

  // Delete Artwork
  const handleDeleteArtwork = (id: string) => {
    const updated = artworks.filter(a => a.id !== id);
    setArtworks(updated);
    localStorage.setItem('macata_artworks', JSON.stringify(updated));
    showSuccess('Obra eliminada del catálogo con éxito.');
    
    // If we were editing this deleted artwork, reset the form
    if (editingArtwork && editingArtwork.id === id) {
      resetArtworkForm();
    }
    setDeletingArtId(null);
  };

  // Reset Design Project Form
  const resetDesignForm = () => {
    setDesignTitle('');
    setDesignNum('');
    setDesignDesc('');
    setDesignBadgeLeft('');
    setDesignBadgeRight('★ Premium');
    setEditingDesign(null);
  };

  // Start Editing Design Project
  const handleStartEditDesign = (p: DesignProject) => {
    setEditingDesign(p);
    setDesignTitle(p.title);
    setDesignNum(p.num);
    setDesignDesc(p.description);
    setDesignBadgeLeft(p.badgeLeft);
    setDesignBadgeRight(p.badgeRight);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add or Edit Design Project Submit
  const handleAddDesign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!designTitle || !designDesc) {
      setErrorMsg('Por favor completa el título y la descripción del proyecto de diseño.');
      return;
    }

    const autoNum = designNum.trim() || `0${designProjects.length + 1} / PROYECTO`;

    const updatedDesign: DesignProject = {
      id: editingDesign ? editingDesign.id : `custom-design-${Date.now()}`,
      num: autoNum.toUpperCase(),
      title: designTitle,
      description: designDesc,
      badgeLeft: designBadgeLeft || 'Dirección Creativa',
      badgeRight: designBadgeRight
    };

    let updatedList: DesignProject[];
    if (editingDesign) {
      updatedList = designProjects.map(d => d.id === editingDesign.id ? updatedDesign : d);
      showSuccess(`¡Se guardaron los cambios del proyecto "${designTitle}" con éxito!`);
    } else {
      updatedList = [...designProjects, updatedDesign];
      showSuccess('¡Proyecto de Diseño y Branding agregado con éxito!');
    }

    setDesignProjects(updatedList);
    localStorage.setItem('macata_designs', JSON.stringify(updatedList));
    resetDesignForm();
    setErrorMsg('');
  };

  // Delete Design Project
  const handleDeleteDesign = (id: string) => {
    const updated = designProjects.filter(p => p.id !== id);
    setDesignProjects(updated);
    localStorage.setItem('macata_designs', JSON.stringify(updated));
    showSuccess('Proyecto de diseño eliminado con éxito.');

    if (editingDesign && editingDesign.id === id) {
      resetDesignForm();
    }
    setDeletingDesignId(null);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-stone-900 relative selections:bg-[#1A1A1A]/10 selections:text-[#1A1A1A] pb-24">
      {/* Crisp minimal architectural background lines to match main page theme */}
      <div className="absolute top-0 left-[20vw] w-[1px] h-full bg-[#E5E5E1]/40 -z-10 pointer-events-none"></div>
      <div className="absolute top-0 left-[80vw] w-[1px] h-full bg-[#E5E5E1]/40 -z-10 pointer-events-none"></div>

      {/* Styled Admin Header Bar (Sticky) */}
      <div className="bg-[#1A1A1A] text-[#F7F7F5] px-6 py-4 flex justify-between items-center sticky top-0 z-50 border-b border-[#2A2A2A] shadow-md">
        <div className="flex items-center gap-3">
          <Lock size={15} className="text-[#71716F]" />
          <span className="font-mono text-[9px] tracking-[0.25em] text-[#E5E5E1] uppercase font-bold">
            Atelier Privado • Espacio de Administración
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-2 bg-transparent text-stone-300 hover:text-white border border-stone-800 hover:bg-stone-800 font-mono text-[9px] tracking-widest font-bold uppercase transition-all px-4 py-2.5"
          title="Volver a la Galería"
        >
          <X size={12} />
          <span>Volver a la Galería</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {!isAuthenticated ? (
          /* LOGIN CONTAINER */
          <div className="max-w-md mx-auto py-20 text-center bg-white p-8 border border-[#E5E5E1] shadow-sm">
            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={18} className="text-stone-600" />
            </div>
            <h3 className="text-2xl font-light tracking-widest uppercase mb-8" style={{ fontFamily: 'Georgia, serif' }}>
              ♡
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
                  placeholder="Usuario coordinador"
                  required
                  className="w-full text-xs font-mono bg-[#F7F7F5] text-[#1A1A1A] border border-[#E5E5E1] px-4 py-3 rounded-none outline-none focus:border-[#1A1A1A]"
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
                  placeholder="••••••••"
                  required
                  className="w-full text-xs font-mono bg-[#F7F7F5] text-[#1A1A1A] border border-[#E5E5E1] px-4 py-3 rounded-none outline-none focus:border-[#1A1A1A]"
                />
              </div>

              {errorMsg && (
                <p className="text-red-700 text-[10px] font-mono tracking-wide bg-red-50 p-2.5 border border-red-100 uppercase">
                  ⚠ {errorMsg}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-[#1A1A1A] text-white hover:bg-stone-800 py-3.5 px-6 rounded-none text-[10px] tracking-[0.25em] font-sans uppercase font-bold transition-all mt-4"
              >
                ACCEDER
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
                  <Sparkles size={11} className="text-amber-600" /> Sesión Iniciada como Macata Chavalli
                </div>
                <h3 className="text-2xl sm:text-3xl font-light tracking-wider uppercase text-[#1a1a1a] mt-1" style={{ fontFamily: 'Georgia, serif' }}>
                  Gestor de Portfolio & Obras
                </h3>
              </div>

              {/* Control Action buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    if (confirm('¿Deseas restaurar todo al catálogo por defecto? Tus cambios creados se perderán.')) {
                      onResetToDefaults();
                      resetArtworkForm();
                      resetDesignForm();
                      showSuccess('Se restauraron todos los datos por defecto de fábrica.');
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

            {/* Success Indicators */}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 text-[11px] font-mono tracking-widest uppercase flex items-center gap-2.5">
                <CheckCircle size={15} className="text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Tabs selector */}
            <div className="flex gap-6 border-b border-[#E5E5E1]">
              <button
                onClick={() => {
                  setActiveTab('obras');
                  setErrorMsg('');
                }}
                className={`pb-3 text-xs tracking-[0.2em] uppercase font-bold transition-all ${
                  activeTab === 'obras'
                    ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]'
                    : 'text-[#71716F] hover:text-[#1A1A1A]'
                }`}
              >
                Obras de Arte ({artworks.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('diseños');
                  setErrorMsg('');
                }}
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
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Form to Upload/Edit Artwork */}
                <div className="lg:col-span-5 bg-white p-6 border border-[#E5E5E1] space-y-4 shadow-sm">
                  <h4 className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#1A1A1A] font-bold border-b border-[#E5E5E1] pb-2">
                    {editingArtwork ? `✦ Editar Obra: "${editingArtwork.title}"` : '✦ Cargar Nueva Obra'}
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
                          Año de Creación *
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

                    {/* Multi-Image upload sector */}
                    <div>
                      <label className="font-mono uppercase tracking-wider text-[9px] text-[#222] font-bold block mb-1.5">
                        Imágenes de la Obra (Hasta 3 imágenes cargables)
                      </label>
                      <div className="space-y-2 bg-[#F7F7F5] p-3 border border-[#E5E5E1]">
                        <div>
                          <label className="font-mono text-[8px] uppercase tracking-wider text-[#71716F] block mb-1">Imagen 1 (Enfoque Principal) *</label>
                          <input
                            type="text"
                            value={artImgUrl1}
                            onChange={(e) => setArtImgUrl1(e.target.value)}
                            placeholder="/src/assets/images/... o https://... (Principal)"
                            required
                            className="w-full text-xs font-sans bg-white outline-none text-[#1A1A1A] p-2 border border-[#E5E5E1] focus:border-[#1A1A1A]"
                          />
                        </div>
                        <div>
                          <label className="font-mono text-[8px] uppercase tracking-wider text-[#71716F] block mb-1">Imagen 2 (Detalle / Textura)</label>
                          <input
                            type="text"
                            value={artImgUrl2}
                            onChange={(e) => setArtImgUrl2(e.target.value)}
                            placeholder="/src/assets/images/... o https://... (Ángulo o detalle)"
                            className="w-full text-xs font-sans bg-white outline-none text-[#1A1A1A] p-2 border border-[#E5E5E1] focus:border-[#1A1A1A]"
                          />
                        </div>
                        <div>
                          <label className="font-mono text-[8px] uppercase tracking-wider text-[#71716F] block mb-1">Imagen 3 (Configuración / Enmarcado)</label>
                          <input
                            type="text"
                            value={artImgUrl3}
                            onChange={(e) => setArtImgUrl3(e.target.value)}
                            placeholder="/src/assets/images/... o https://... (Ambientada o enmarcada)"
                            className="w-full text-xs font-sans bg-white outline-none text-[#1A1A1A] p-2 border border-[#E5E5E1] focus:border-[#1A1A1A]"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="font-mono uppercase tracking-wider text-[9px] text-[#71716F] block mb-1">
                        Descripción o Detalle Poético
                      </label>
                      <textarea
                        value={artDesc}
                        onChange={(e) => setArtDesc(e.target.value)}
                        placeholder="Describe la sensación, relieve u origen conceptual de la obra..."
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

                    {errorMsg && (
                      <p className="text-red-700 font-mono text-[9px] bg-red-50 p-2 border border-red-100 uppercase">
                        ⚠ {errorMsg}
                      </p>
                    )}

                    <div className="flex gap-2">
                      {editingArtwork && (
                        <button
                          type="button"
                          onClick={resetArtworkForm}
                          className="w-1/3 bg-stone-200 text-stone-800 hover:bg-stone-300 py-3 rounded-none text-[9px] font-sans font-bold uppercase tracking-[0.2em] transition-all text-center"
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        type="submit"
                        className={`font-sans font-bold uppercase tracking-[0.2em] py-3 rounded-none text-[9px] transition-all ${
                          editingArtwork ? 'w-2/3 bg-[#1A1A1A] text-white hover:bg-stone-800' : 'w-full bg-[#1A1A1A] text-white hover:bg-stone-800'
                        }`}
                      >
                        {editingArtwork ? 'Guardar Cambios' : 'Publicar Obra en Galería'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right Column: List of Existing Artworks & Actions */}
                <div className="lg:col-span-7 space-y-4">
                  <h4 className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#1A1A1A] font-bold border-b border-[#E5E5E1] pb-2">
                    ✦ Obras cargadas ({artworks.length})
                  </h4>

                  <div className="grid grid-cols-1 gap-3 max-h-[750px] overflow-y-auto pr-2">
                    {artworks.map((art) => (
                      <div key={art.id} className="bg-white p-4 border border-[#E5E5E1] flex justify-between items-center gap-4 hover:border-stone-400 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-[#EAEAE8] border border-stone-200 overflow-hidden shrink-0">
                            <img src={art.imageUrl} alt={art.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[9px] font-mono tracking-wider text-[#71716F] bg-stone-100 px-1.5 py-0.5 uppercase">
                                {art.collection.toUpperCase()}
                              </span>
                              {art.featured && (
                                <span className="text-[8px] font-mono tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 uppercase">
                                  ★ Portada
                                </span>
                              )}
                              {art.imageUrls && art.imageUrls.length > 1 && (
                                <span className="text-[8px] font-mono tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.2 uppercase">
                                  {art.imageUrls.length} Perspectivas
                                </span>
                              )}
                            </div>
                            <h5 className="text-sm font-light text-stone-900 mt-1" style={{ fontFamily: 'Georgia, serif' }}>
                              {art.title}
                            </h5>
                            <p className="text-[10px] font-mono text-stone-500">
                              {art.size} • {art.year} • {art.medium}
                            </p>
                          </div>
                        </div>

                        {/* Edit and Delete Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          {deletingArtId === art.id ? (
                            <div className="flex items-center gap-1.5 bg-red-50 p-1.5 border border-red-200">
                              <span className="text-[9px] font-mono font-medium text-red-700 uppercase px-1">¿Eliminar?</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteArtwork(art.id)}
                                className="bg-red-700 hover:bg-red-800 text-white font-mono text-[9px] px-2.5 py-1 uppercase tracking-wider transition-all font-bold"
                              >
                                Sí
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingArtId(null)}
                                className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-mono text-[9px] px-2.5 py-1 uppercase tracking-wider transition-all font-bold"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartEditArtwork(art)}
                                className="bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider transition-all"
                                title="Editar Obra"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingArtId(art.id)}
                                className="p-2 text-stone-400 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all font-bold"
                                title="Eliminar Obra"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {artworks.length === 0 && (
                      <div className="py-20 text-center text-[#71716F] font-mono text-[10px] uppercase tracking-widest border border-dashed border-[#E5E5E1] bg-white">
                        No hay obras en el catálogo de arte. ¡Carga una arriba!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DISEÑOS / BRANDING WORK MANAGEMENT */}
            {activeTab === 'diseños' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Form to Upload Design Work */}
                <div className="lg:col-span-5 bg-white p-6 border border-[#E5E5E1] space-y-4 shadow-sm">
                  <h4 className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#1A1A1A] font-bold border-b border-[#E5E5E1] pb-2">
                    {editingDesign ? `✦ Editar Proyecto: "${editingDesign.title}"` : '✦ Cargar Trabajo de Diseño'}
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
                        Etiqueta Numérica o Código
                      </label>
                      <input
                        type="text"
                        value={designNum}
                        onChange={(e) => setDesignNum(e.target.value)}
                        placeholder="Ej: 04 / ID ORGÁNICA"
                        className="w-full text-xs font-sans bg-[#F7F7F5] outline-none text-[#1A1A1A] p-2.5 border border-[#E5E5E1] focus:border-[#1A1A1A]"
                      />
                      <span className="text-[9px] text-[#71716F] block mt-1">
                        Se autocompletará en base a la grilla si no se especifica.
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

                    {errorMsg && (
                      <p className="text-red-700 font-mono text-[9px] bg-red-50 p-2 border border-red-100 uppercase">
                        ⚠ {errorMsg}
                      </p>
                    )}

                    <div className="flex gap-2">
                      {editingDesign && (
                        <button
                          type="button"
                          onClick={resetDesignForm}
                          className="w-1/3 bg-stone-200 text-stone-800 hover:bg-stone-300 py-3 rounded-none text-[9px] font-sans font-bold uppercase tracking-[0.2em] transition-all text-center"
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        type="submit"
                        className={`font-sans font-bold uppercase tracking-[0.2em] py-3 rounded-none text-[9px] transition-all ${
                          editingDesign ? 'w-2/3 bg-[#1A1A1A] text-white hover:bg-stone-800' : 'w-full bg-[#1A1A1A] text-white hover:bg-stone-800'
                        }`}
                      >
                        {editingDesign ? 'Guardar Cambios' : 'Publicar Proyecto de Diseño'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right Column: List of Existing Design Projects & Delete Action */}
                <div className="lg:col-span-7 space-y-4">
                  <h4 className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#1A1A1A] font-bold border-b border-[#E5E5E1] pb-2">
                    ✦ Proyectos de diseño ({designProjects.length})
                  </h4>

                  <div className="grid grid-cols-1 gap-3 max-h-[750px] overflow-y-auto pr-2">
                    {designProjects.map((p) => (
                      <div key={p.id} className="bg-white p-4 border border-[#E5E5E1] flex justify-between items-center gap-4 hover:border-stone-400 transition-colors">
                        <div className="flex-1">
                          <span className="text-[9px] font-mono tracking-widest text-[#71716F] block">
                            {p.num}
                          </span>
                          <h5 className="text-sm font-light text-stone-900 mt-1" style={{ fontFamily: 'Georgia, serif' }}>
                            {p.title}
                          </h5>
                          <p className="text-[11px] text-stone-650 font-sans mt-1 line-clamp-2 leading-relaxed">
                            {p.description}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-2 text-[8px] font-mono uppercase tracking-wider text-[#1a1a1a]">
                            <span className="bg-stone-100 border border-stone-200 px-1.5 py-0.5 font-medium">{p.badgeLeft}</span>
                            <span className="bg-stone-50 border border-amber-200 px-1.5 py-0.5 text-amber-700 font-bold">{p.badgeRight}</span>
                          </div>
                        </div>

                        {/* Edit and Delete Actions */}
                        <div className="flex items-center gap-1 shrink-0 ml-4">
                          {deletingDesignId === p.id ? (
                            <div className="flex items-center gap-1.5 bg-red-50 p-1.5 border border-red-200">
                              <span className="text-[9px] font-mono font-medium text-red-700 uppercase px-1">¿Eliminar?</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteDesign(p.id)}
                                className="bg-red-700 hover:bg-red-800 text-white font-mono text-[9px] px-2.5 py-1 uppercase tracking-wider transition-all font-bold"
                              >
                                Sí
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingDesignId(null)}
                                className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-mono text-[9px] px-2.5 py-1 uppercase tracking-wider transition-all font-bold"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartEditDesign(p)}
                                className="bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider transition-all"
                                title="Editar Proyecto"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingDesignId(p.id)}
                                className="p-2 text-stone-400 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all font-bold"
                                title="Eliminar Proyecto"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {designProjects.length === 0 && (
                      <div className="py-20 text-center text-[#71716F] font-mono text-[10px] uppercase tracking-widest border border-dashed border-[#E5E5E1] bg-white">
                        No hay proyectos de diseño subidos. ¡Carga uno arriba!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
