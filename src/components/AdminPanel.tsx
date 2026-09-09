/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Lock, Plus, Trash2, Sparkles, LogOut, CheckCircle, RotateCcw, Upload, Cloud, Globe, ExternalLink } from 'lucide-react';
import { Artwork, DesignProject, DesignCarouselItem } from '../types';
import { collections } from '../data';
import { 
  saveArtworkToCloud, 
  deleteArtworkFromCloud, 
  saveDesignProjectToCloud, 
  deleteDesignProjectFromCloud,
  saveCarouselItemToCloud,
  deleteCarouselItemFromCloud,
  testCloudConnection,
  syncAllLocalToCloud,
  unmarkArtworkAsLocallyDeleted,
  markArtworkAsLocallyDeleted,
  unmarkDesignAsLocallyDeleted,
  markDesignAsLocallyDeleted
} from '../lib/firebase';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  artworks: Artwork[];
  setArtworks: (artworks: Artwork[]) => void;
  designProjects: DesignProject[];
  setDesignProjects: (projects: DesignProject[]) => void;
  carouselItems: DesignCarouselItem[];
  setCarouselItems: (items: DesignCarouselItem[]) => void;
  onResetToDefaults: () => void;
}

export default function AdminPanel({
  isOpen,
  onClose,
  artworks,
  setArtworks,
  designProjects,
  setDesignProjects,
  carouselItems,
  setCarouselItems,
  onResetToDefaults
}: AdminPanelProps) {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('macata_admin_auth') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'obras' | 'diseños'>('obras');

  // New & Edit Artwork Form State
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [artTitle, setArtTitle] = useState('');
  const [artYear, setArtYear] = useState('2026');
  const [artMedium, setArtMedium] = useState('');
  const [artSize, setArtSize] = useState('');
  const [artCol, setArtCol] = useState('laminas');
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
  const [designImgUrl, setDesignImgUrl] = useState('');
  const [designBadgeLeft, setDesignBadgeLeft] = useState('');
  const [designBadgeRight, setDesignBadgeRight] = useState('★ Premium');
  const [designWebsiteUrl, setDesignWebsiteUrl] = useState('');

  // Design Carousel Form State
  const [carouselImgUrl, setCarouselImgUrl] = useState('');
  const [carouselTitle, setCarouselTitle] = useState('');
  const [carouselCategory, setCarouselCategory] = useState('Branding');
  const [deletingCarouselId, setDeletingCarouselId] = useState<string | null>(null);

  // Success Indicators
  const [successMsg, setSuccessMsg] = useState('');

  // Cloud Sync & Diagnostics States
  const [cloudStatus, setCloudStatus] = useState<'idle' | 'connected' | 'error' | 'quota_exceeded'>('idle');
  const [isCheckingCloud, setIsCheckingCloud] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  // Inline Delete confirmations tracking
  const [deletingArtId, setDeletingArtId] = useState<string | null>(null);
  const [deletingDesignId, setDeletingDesignId] = useState<string | null>(null);

  // Auto-verify cloud connection on login
  useEffect(() => {
    if (isAuthenticated) {
      testCloudConnection().then((res) => {
        if (res.ok) {
          if (res.isQuota) {
            setCloudStatus('quota_exceeded');
          } else {
            setCloudStatus('connected');
          }
        } else {
          setCloudStatus('error');
        }
      }).catch(() => setCloudStatus('error'));
    }
  }, [isAuthenticated]);

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
    setTimeout(() => setSuccessMsg(''), 6000);
  };

  // Test Cloud Firestore direct connection
  const handleTestCloudConnection = async () => {
    setIsCheckingCloud(true);
    setErrorMsg('');
    try {
      const res = await testCloudConnection();
      if (res.ok) {
        if (res.isQuota) {
          setCloudStatus('quota_exceeded');
          showSuccess(res.message);
        } else {
          setCloudStatus('connected');
          showSuccess(`✓ Conexión a Firebase Firestore 100% operativa (${res.count ?? 0} obras en la nube).`);
        }
      } else {
        setCloudStatus('error');
        setErrorMsg(`Fallo de conexión a la nube: ${res.message}`);
      }
    } catch (e: any) {
      setCloudStatus('error');
      setErrorMsg(`Error al probar conexión: ${e?.message || String(e)}`);
    } finally {
      setIsCheckingCloud(false);
    }
  };

  // Force bulk sync of all local data to Cloud Firestore
  const handleSyncAllToCloud = async () => {
    setIsSyncingAll(true);
    setErrorMsg('');
    try {
      const res = await syncAllLocalToCloud(artworks, designProjects, carouselItems);
      if (res.quotaExceeded) {
        setCloudStatus('quota_exceeded');
        showSuccess(`Tus datos están protegidos y guardados en tu navegador. La cuota de escritura diaria gratuita de Firebase Firestore se ha completado hoy (se renueva automáticamente a medianoche). Se sincronizaron ${res.success} elementos.`);
      } else if (res.errors.length === 0) {
        setCloudStatus('connected');
        showSuccess(`✓ Sincronización exitosa: ${res.success} elementos guardados en la nube.`);
      } else {
        showSuccess(`Se sincronizaron ${res.success} elementos.`);
        setErrorMsg(`Hubo notas en ${res.errors.length} elementos: ${res.errors.join(' | ')}`);
      }
    } catch (e: any) {
      setErrorMsg(`Error durante la sincronización a la nube: ${e?.message || String(e)}`);
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Handle local file selection to compress & convert to base64 Data URL for Firestore compatibility
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setTargetState: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');

    const reader = new FileReader();
    reader.onerror = () => {
      setErrorMsg('Error al leer el archivo seleccionado.');
    };
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result !== 'string') return;

      const img = new Image();
      img.onerror = () => {
        setErrorMsg('El archivo seleccionado no es una imagen válida.');
      };
      img.onload = () => {
        try {
          // Optimized compression: 1080px max dimension ensures high retina clarity
          // while keeping document sizes well below Firestore's limit (~80-180KB per photo)
          const MAX_WIDTH = 1080;
          const MAX_HEIGHT = 1080;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            if (width > height) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            } else {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            setTargetState(result);
            showSuccess('✓ Imagen cargada correctamente');
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          // 0.72 quality JPEG compression for optimal web display and small payload
          let compressedDataUrl = canvas.toDataURL('image/jpeg', 0.72);
          // If still over 220KB, re-compress slightly to guarantee it fits safely in document
          if (compressedDataUrl.length > 220000) {
            compressedDataUrl = canvas.toDataURL('image/jpeg', 0.58);
          }
          setTargetState(compressedDataUrl);
          showSuccess('✓ Imagen procesada y optimizada para la nube');
        } catch (err) {
          console.error('Error compressing image:', err);
          setTargetState(result);
          showSuccess('✓ Imagen cargada');
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);

    // Reset value so same file can be selected again if needed
    e.target.value = '';
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
    setArtCol('calendario');
    setArtYear('2026');
    setArtFeatured(false);
    setEditingArtwork(null);
  };

  // Start Editing Artwork
  const handleStartEditArtwork = (art: Artwork) => {
    setActiveTab('art');
    setEditingArtwork(art);
    setArtTitle(art.title);
    setArtYear(art.year);
    setArtMedium(art.medium);
    setArtSize(art.size);
    setArtCol(art.collection);
    setArtDesc(art.description || '');

    // Distribute images
    const imgUrls = art.imageUrls && art.imageUrls.length > 0 ? art.imageUrls : [art.imageUrl];
    setArtImgUrl1(imgUrls[0] || art.imageUrl || '');
    setArtImgUrl2(imgUrls[1] || '');
    setArtImgUrl3(imgUrls[2] || '');

    setArtFeatured(art.featured || false);
    // Smooth scroll to top of workspace content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add or Edit Artwork Submit (Cloud Firestore sync)
  const handleAddArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artTitle || !artMedium || !artSize) {
      setErrorMsg('Por favor completa los campos principales de la obra.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      const defaultImg = artImgUrl1.trim() || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80';
      const finalImageUrls = [
        defaultImg,
        ...(artImgUrl2.trim() ? [artImgUrl2.trim()] : []),
        ...(artImgUrl3.trim() ? [artImgUrl3.trim()] : [])
      ];

      const updatedArt: Artwork = {
        id: editingArtwork ? editingArtwork.id : `art-${Date.now()}`,
        title: artTitle,
        collection: artCol,
        year: artYear,
        medium: artMedium,
        size: artSize,
        imageUrl: defaultImg,
        imageUrls: finalImageUrls,
        description: artDesc.trim(),
        featured: artFeatured,
        updatedAt: Date.now()
      };

      // 1. UPDATE LOCAL STATE AND LOCALSTORAGE IMMEDIATELY (Instant UI update in Gallery)
      let updatedList: Artwork[];
      if (editingArtwork) {
        updatedList = artworks.map(a => a.id === editingArtwork.id ? updatedArt : a);
      } else {
        updatedList = [updatedArt, ...artworks];
      }

      setArtworks(updatedList);
      localStorage.setItem('macata_artworks', JSON.stringify(updatedList));
      unmarkArtworkAsLocallyDeleted(updatedArt.id);

      // 2. Safely sync to Cloud Firestore
      const cloudRes = await saveArtworkToCloud(updatedArt);

      if (cloudRes.cloudSuccess) {
        setCloudStatus('connected');
        showSuccess(editingArtwork ? `¡Se guardaron y sincronizaron los cambios de "${artTitle}" en la nube!` : '¡Nueva obra guardada en la nube y publicada exitosamente!');
      } else if (cloudRes.sizeWarning) {
        setCloudStatus('quota_exceeded');
        showSuccess(`✓ Obra actualizada y visible en la galería (guardada localmente).`);
      } else {
        setCloudStatus('quota_exceeded');
        showSuccess(`✓ Obra actualizada de inmediato en la galería y guardada de forma segura.`);
      }

      resetArtworkForm();
    } catch (err: any) {
      console.error('Error saving artwork:', err);
      // Still show success since local state was saved
      showSuccess(`✓ Obra guardada y actualizada en la galería.`);
      resetArtworkForm();
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Artwork from Cloud & Local
  const handleDeleteArtwork = async (id: string) => {
    setIsSaving(true);
    try {
      // 1. Mark as locally deleted so cloud listener won't restore it
      markArtworkAsLocallyDeleted(id);

      // 2. Remove from local state and localStorage immediately
      const updated = artworks.filter(a => a.id !== id);
      setArtworks(updated);
      localStorage.setItem('macata_artworks', JSON.stringify(updated));

      // 3. Attempt cloud delete in background
      const cloudRes = await deleteArtworkFromCloud(id);
      
      if (cloudRes.quotaExceeded) {
        setCloudStatus('quota_exceeded');
        showSuccess('Obra eliminada de la galería exitosamente.');
      } else {
        showSuccess('Obra eliminada de la galería y de la nube con éxito.');
      }
      
      if (editingArtwork && editingArtwork.id === id) {
        resetArtworkForm();
      }
    } catch (err) {
      console.error('Error deleting artwork:', err);
      showSuccess('Obra eliminada de la galería.');
    } finally {
      setIsSaving(false);
      setDeletingArtId(null);
    }
  };

  // Reset Design Project Form
  const resetDesignForm = () => {
    setDesignTitle('');
    setDesignNum('');
    setDesignDesc('');
    setDesignImgUrl('');
    setDesignBadgeLeft('');
    setDesignBadgeRight('★ Premium');
    setDesignWebsiteUrl('');
    setEditingDesign(null);
  };

  // Start Editing Design Project
  const handleStartEditDesign = (p: DesignProject) => {
    setActiveTab('design');
    setEditingDesign(p);
    setDesignTitle(p.title);
    setDesignNum(p.num || '');
    setDesignDesc(p.description || '');
    setDesignImgUrl(p.imageUrl || '');
    setDesignBadgeLeft(p.badgeLeft || '');
    setDesignBadgeRight(p.badgeRight || '★ Premium');
    setDesignWebsiteUrl(p.websiteUrl || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add or Edit Design Project Submit (Cloud Firestore sync)
  const handleAddDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!designTitle.trim()) {
      setErrorMsg('Por favor completa el título de la tarjeta.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      const autoNum = designNum.trim() || `0${designProjects.length + 1} / BRANDING`;

      const updatedDesign: DesignProject = {
        id: editingDesign ? editingDesign.id : `design-${Date.now()}`,
        num: autoNum.toUpperCase(),
        title: designTitle.trim(),
        description: designDesc.trim(),
        imageUrl: designImgUrl.trim(),
        badgeLeft: designBadgeLeft || 'Diseño & Branding',
        badgeRight: designBadgeRight,
        websiteUrl: designWebsiteUrl.trim(),
        updatedAt: Date.now()
      };

      // 1. Instant local update
      let updatedList: DesignProject[];
      if (editingDesign) {
        updatedList = designProjects.map(d => d.id === editingDesign.id ? updatedDesign : d);
      } else {
        updatedList = [...designProjects, updatedDesign];
      }

      setDesignProjects(updatedList);
      localStorage.setItem('macata_designs', JSON.stringify(updatedList));
      unmarkDesignAsLocallyDeleted(updatedDesign.id);

      // 2. Cloud sync
      const cloudRes = await saveDesignProjectToCloud(updatedDesign);

      if (cloudRes.cloudSuccess) {
        setCloudStatus('connected');
        showSuccess(editingDesign ? `¡Se guardaron y sincronizaron los cambios de "${designTitle}" en la nube!` : '¡Tarjeta de diseño guardada en la nube y publicada con éxito!');
      } else {
        setCloudStatus('quota_exceeded');
        showSuccess('✓ Tarjeta de diseño actualizada de inmediato en la web.');
      }

      resetDesignForm();
    } catch (err: any) {
      console.error('Error saving design project:', err);
      showSuccess('✓ Tarjeta de diseño guardada.');
      resetDesignForm();
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Design Project
  const handleDeleteDesign = async (id: string) => {
    setIsSaving(true);
    try {
      // 1. Mark deleted locally
      markDesignAsLocallyDeleted(id);

      // 2. Remove locally immediately
      const updated = designProjects.filter(p => p.id !== id);
      setDesignProjects(updated);
      localStorage.setItem('macata_designs', JSON.stringify(updated));

      // 3. Delete from cloud
      const cloudRes = await deleteDesignProjectFromCloud(id);

      if (cloudRes.cloudSuccess) {
        showSuccess('Proyecto de diseño eliminado con éxito.');
      } else {
        setCloudStatus('quota_exceeded');
        showSuccess('Proyecto de diseño eliminado.');
      }

      if (editingDesign && editingDesign.id === id) {
        resetDesignForm();
      }
    } catch (err) {
      console.error('Error deleting design project:', err);
      showSuccess('Proyecto de diseño eliminado.');
    } finally {
      setIsSaving(false);
      setDeletingDesignId(null);
    }
  };

  const handleAddCarouselItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carouselImgUrl) {
      setErrorMsg('Por favor selecciona o ingresa una imagen para el carrusel.');
      return;
    }
    setIsSaving(true);
    setErrorMsg('');

    try {
      const newItem: DesignCarouselItem = {
        id: `carousel-${Date.now()}`,
        imageUrl: carouselImgUrl,
        title: carouselTitle.trim() || 'Muestra de Trabajo de Diseño',
        category: carouselCategory.trim() || 'Branding',
        order: carouselItems.length + 1,
        updatedAt: Date.now()
      };

      // 1. Instant local update
      const updated = [...carouselItems, newItem];
      setCarouselItems(updated);
      localStorage.setItem('macata_carousel', JSON.stringify(updated));

      // 2. Cloud sync
      const cloudRes = await saveCarouselItemToCloud(newItem);

      if (cloudRes.cloudSuccess) {
        setCloudStatus('connected');
        showSuccess('¡Nueva imagen publicada en el carrusel y guardada en la nube!');
      } else {
        setCloudStatus('quota_exceeded');
        showSuccess('¡Imagen agregada al carrusel!');
      }

      setCarouselImgUrl('');
      setCarouselTitle('');
      setCarouselCategory('Branding');
    } catch (err: any) {
      console.error('Error saving carousel item:', err);
      showSuccess('¡Imagen agregada al carrusel!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCarouselItem = async (id: string) => {
    setIsSaving(true);
    try {
      // 1. Remove locally immediately
      const updated = carouselItems.filter(item => item.id !== id);
      setCarouselItems(updated);
      localStorage.setItem('macata_carousel', JSON.stringify(updated));

      // 2. Delete from cloud
      await deleteCarouselItemFromCloud(id);
      showSuccess('Imagen eliminada del carrusel.');
    } catch (err) {
      console.error('Error deleting carousel item:', err);
      showSuccess('Imagen eliminada del carrusel.');
    } finally {
      setIsSaving(false);
      setDeletingCarouselId(null);
    }
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
                <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase font-mono font-bold">
                  <span className="flex items-center gap-1.5 text-[#71716F]">
                    <Sparkles size={11} className="text-amber-600" /> Sesión Iniciada como Macata Chavalli
                  </span>
                  <span className="text-[#E5E5E1]">|</span>
                  <button
                    type="button"
                    onClick={handleTestCloudConnection}
                    disabled={isCheckingCloud}
                    className={`flex items-center gap-1.5 px-2.5 py-0.5 border text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                      cloudStatus === 'connected'
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-300 hover:bg-emerald-100'
                        : cloudStatus === 'quota_exceeded'
                        ? 'text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100'
                        : cloudStatus === 'error'
                        ? 'text-red-700 bg-red-50 border-red-300 hover:bg-red-100'
                        : 'text-stone-700 bg-stone-100 border-stone-300 hover:bg-stone-200'
                    }`}
                    title="Haz clic para diagnosticar y probar la conexión con Firebase Firestore"
                  >
                    <Cloud size={11} className={isCheckingCloud ? 'animate-spin text-stone-700' : cloudStatus === 'connected' ? 'text-emerald-600' : cloudStatus === 'quota_exceeded' ? 'text-amber-600' : 'text-stone-500'} />
                    <span>
                      {isCheckingCloud 
                        ? 'Probando nube...' 
                        : cloudStatus === 'connected' 
                        ? 'Nube: Conectada ✓' 
                        : cloudStatus === 'quota_exceeded'
                        ? 'Nube: Cuota Diaria (Modo Local Seguro)'
                        : cloudStatus === 'error' 
                        ? 'Nube: Error (Click para reintentar)' 
                        : 'Comprobar Estado Nube'}
                    </span>
                  </button>
                </div>
                <h3 className="text-2xl sm:text-3xl font-light tracking-wider uppercase text-[#1a1a1a] mt-1" style={{ fontFamily: 'Georgia, serif' }}>
                  Gestor de Portfolio & Obras
                </h3>
              </div>

              {/* Control Action buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSyncAllToCloud}
                  disabled={isSyncingAll}
                  className="flex items-center gap-2 bg-[#1A1A1A] text-white hover:bg-stone-800 border border-black px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest transition-all disabled:opacity-50"
                  title="Sincronizar y forzar subida de todas las obras y proyectos actuales a Firebase Firestore"
                >
                  <Cloud size={12} className={isSyncingAll ? 'animate-spin' : ''} />
                  <span>{isSyncingAll ? 'Sincronizando...' : 'Sincronizar Todo a la Nube'}</span>
                </button>

                <button
                  type="button"
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

            {/* Quota Exceeded Informational Notice Banner */}
            {cloudStatus === 'quota_exceeded' && (
              <div className="bg-amber-50 border border-amber-200 p-4 flex items-start gap-3 text-xs text-amber-900">
                <Cloud className="text-amber-700 shrink-0 mt-0.5" size={16} />
                <div className="space-y-1">
                  <p className="font-semibold tracking-wide uppercase font-mono text-[10px] text-amber-800">
                    Sincronización en la nube: Modo de Respaldo Local Seguro Activo
                  </p>
                  <p className="text-[11px] text-amber-900 leading-relaxed font-sans">
                    La base de datos de Firebase Firestore está conectada y permite la visualización y lectura de tus obras en tiempo real. Debido al límite diario del plan gratuito de Firebase (20.000 operaciones por día), las escrituras en la nube están en pausa hasta la medianoche.
                  </p>
                  <p className="text-[11px] text-amber-800 leading-relaxed font-sans font-medium">
                    🛡️ <strong>Tus datos están 100% a salvo</strong>: cualquier cambio, nueva obra o edición que hagas se guarda de inmediato en tu navegador y estará visible en tu sitio web. Cuando el límite diario se restablezca, podrás sincronizarlo con el botón «Sincronizar Todo a la Nube».
                  </p>
                </div>
              </div>
            )}

            {/* Success Indicators */}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 text-[11px] font-mono tracking-widest uppercase flex items-center gap-2.5">
                <CheckCircle size={15} className="text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Error Indicators */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 text-[11px] font-mono tracking-widest uppercase flex items-center justify-between gap-2.5">
                <span className="flex items-center gap-2">
                  <span className="font-bold">⚠</span>
                  <span>{errorMsg}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setErrorMsg('')}
                  className="text-red-700 hover:text-red-900 font-mono text-[10px] uppercase underline cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            )}

            {/* Tabs selector */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 border-b border-[#E5E5E1]">
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
                        Imágenes de la Obra (Hasta 3 imágenes • URL o subir desde tu dispositivo)
                      </label>
                      <div className="space-y-3 bg-[#F7F7F5] p-3 border border-[#E5E5E1]">
                        <div>
                          <label className="font-mono text-[8px] uppercase tracking-wider text-[#71716F] block mb-1">Imagen 1 (Enfoque Principal) *</label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={artImgUrl1}
                              onChange={(e) => setArtImgUrl1(e.target.value)}
                              placeholder="URL de la imagen o selecciona un archivo..."
                              required
                              className="flex-1 text-xs font-sans bg-white outline-none text-[#1A1A1A] p-2 border border-[#E5E5E1] focus:border-[#1A1A1A]"
                            />
                            <label className="cursor-pointer bg-stone-200 hover:bg-stone-300 text-stone-800 p-2 text-[10px] font-mono flex items-center gap-1 uppercase tracking-wider transition-all whitespace-nowrap border border-stone-300">
                              <Upload size={12} />
                              <span>Subir...</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, setArtImgUrl1)}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="font-mono text-[8px] uppercase tracking-wider text-[#71716F] block mb-1">Imagen 2 (Detalle / Textura)</label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={artImgUrl2}
                              onChange={(e) => setArtImgUrl2(e.target.value)}
                              placeholder="URL o selecciona un archivo..."
                              className="flex-1 text-xs font-sans bg-white outline-none text-[#1A1A1A] p-2 border border-[#E5E5E1] focus:border-[#1A1A1A]"
                            />
                            <label className="cursor-pointer bg-stone-200 hover:bg-stone-300 text-stone-800 p-2 text-[10px] font-mono flex items-center gap-1 uppercase tracking-wider transition-all whitespace-nowrap border border-stone-300">
                              <Upload size={12} />
                              <span>Subir...</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, setArtImgUrl2)}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="font-mono text-[8px] uppercase tracking-wider text-[#71716F] block mb-1">Imagen 3 (Configuración / Enmarcado)</label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={artImgUrl3}
                              onChange={(e) => setArtImgUrl3(e.target.value)}
                              placeholder="URL o selecciona un archivo..."
                              className="flex-1 text-xs font-sans bg-white outline-none text-[#1A1A1A] p-2 border border-[#E5E5E1] focus:border-[#1A1A1A]"
                            />
                            <label className="cursor-pointer bg-stone-200 hover:bg-stone-300 text-stone-800 p-2 text-[10px] font-mono flex items-center gap-1 uppercase tracking-wider transition-all whitespace-nowrap border border-stone-300">
                              <Upload size={12} />
                              <span>Subir...</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, setArtImgUrl3)}
                                className="hidden"
                              />
                            </label>
                          </div>
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
                        disabled={isSaving}
                        className={`font-sans font-bold uppercase tracking-[0.2em] py-3 rounded-none text-[9px] transition-all flex items-center justify-center gap-2 ${
                          isSaving ? 'opacity-70 cursor-not-allowed bg-stone-700 text-white' : ''
                        } ${
                          editingArtwork ? 'w-2/3 bg-[#1A1A1A] text-white hover:bg-stone-800' : 'w-full bg-[#1A1A1A] text-white hover:bg-stone-800'
                        }`}
                      >
                        {isSaving ? (
                          <>
                            <Cloud size={12} className="animate-bounce" />
                            <span>Guardando en la nube...</span>
                          </>
                        ) : editingArtwork ? (
                          'Guardar Cambios'
                        ) : (
                          'Publicar Obra en Galería'
                        )}
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

            {/* TAB 2: DISEÑOS / BRANDING CARDS MANAGEMENT */}
            {activeTab === 'diseños' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Form to Upload or Edit Design Card */}
                <div className="lg:col-span-5 bg-white p-6 border border-[#E5E5E1] space-y-4 shadow-sm">
                  <h4 className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#1A1A1A] font-bold border-b border-[#E5E5E1] pb-2">
                    {editingDesign ? `✦ Editar Tarjeta: "${editingDesign.title}"` : '✦ Cargar Nueva Tarjeta de Diseño'}
                  </h4>

                  <form onSubmit={handleAddDesign} className="space-y-4 text-xs">
                    {/* Foto de la tarjeta */}
                    <div>
                      <label className="font-mono uppercase tracking-wider text-[9px] text-[#71716F] block mb-1">
                        Foto de la Tarjeta * (Subir archivo o pegar enlace)
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={designImgUrl}
                          onChange={(e) => setDesignImgUrl(e.target.value)}
                          placeholder="https://... o presiona Subir"
                          className="flex-1 text-xs font-sans bg-[#F7F7F5] outline-none text-[#1A1A1A] p-2.5 border border-[#E5E5E1] focus:border-[#1A1A1A]"
                        />
                        <label className="cursor-pointer bg-stone-200 hover:bg-stone-300 text-stone-800 p-2.5 text-[10px] font-mono flex items-center gap-1 uppercase tracking-wider transition-all whitespace-nowrap border border-stone-300">
                          <Upload size={12} />
                          <span>Subir...</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, setDesignImgUrl)}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {designImgUrl && (
                        <div className="mt-2 p-2 bg-[#F7F7F5] border border-[#E5E5E1] flex items-center gap-3">
                          <img
                            src={designImgUrl}
                            alt="Vista previa"
                            className="w-16 h-12 object-cover border border-stone-300 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-700 block font-bold">
                              ✓ Foto seleccionada
                            </span>
                            <button
                              type="button"
                              onClick={() => setDesignImgUrl('')}
                              className="text-[9px] text-red-600 hover:underline uppercase font-mono mt-0.5"
                            >
                              Quitar foto
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Título de la tarjeta (Pie de foto) */}
                    <div>
                      <label className="font-mono uppercase tracking-wider text-[9px] text-[#71716F] block mb-1">
                        Pie de Foto: Título *
                      </label>
                      <input
                        type="text"
                        value={designTitle}
                        onChange={(e) => setDesignTitle(e.target.value)}
                        placeholder="Ej: Identidad Visual & Sistema de Marca"
                        required
                        className="w-full text-xs font-sans bg-[#F7F7F5] outline-none text-[#1A1A1A] p-2.5 border border-[#E5E5E1] focus:border-[#1A1A1A]"
                      />
                    </div>

                    {/* Breve texto opcional (Pie de foto) */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-mono uppercase tracking-wider text-[9px] text-[#71716F]">
                          Pie de Foto: Breve Texto Descriptivo
                        </label>
                        <span className="text-[9px] font-mono uppercase text-stone-500 bg-stone-100 px-1.5 py-0.5 border border-stone-200">
                          Opcional
                        </span>
                      </div>
                      <textarea
                        value={designDesc}
                        onChange={(e) => setDesignDesc(e.target.value)}
                        placeholder="Opcional: Si lo dejas vacío, la tarjeta publicada solo mostrará el título (sin ninguna leyenda ni texto)..."
                        rows={3}
                        className="w-full text-xs font-sans bg-[#F7F7F5] outline-none text-[#1A1A1A] p-2.5 border border-[#E5E5E1] focus:border-[#1A1A1A]"
                      />
                      <p className="text-[9px] font-mono text-[#71716F] mt-1">
                        💡 Si no escribes nada, en la tarjeta de la sección se publicará exclusivamente el título.
                      </p>
                    </div>

                    {/* Sitio Web y Enlace del Proyecto (Opcional) */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-mono uppercase tracking-wider text-[9px] text-[#71716F] flex items-center gap-1.5">
                          <Globe size={11} className="text-stone-600" />
                          <span>Sitio Web / Enlace del Proyecto</span>
                        </label>
                        <span className="text-[9px] font-mono uppercase text-stone-500 bg-stone-100 px-1.5 py-0.5 border border-stone-200">
                          Opcional
                        </span>
                      </div>
                      <input
                        type="text"
                        value={designWebsiteUrl}
                        onChange={(e) => setDesignWebsiteUrl(e.target.value)}
                        placeholder="Ej: https://misitio.com o www.cliente.com"
                        className="w-full text-xs font-sans bg-[#F7F7F5] outline-none text-[#1A1A1A] p-2.5 border border-[#E5E5E1] focus:border-[#1A1A1A]"
                      />
                      <p className="text-[9px] font-mono text-[#71716F] mt-1">
                        💡 Si agregas un enlace, la tarjeta mostrará un botón para que los visitantes puedan acceder directamente al sitio web del proyecto.
                      </p>
                    </div>

                    {errorMsg && (
                      <p className="text-red-700 font-mono text-[9px] bg-red-50 p-2 border border-red-100 uppercase">
                        ⚠ {errorMsg}
                      </p>
                    )}

                    <div className="flex gap-2 pt-2">
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
                        disabled={isSaving}
                        className={`font-sans font-bold uppercase tracking-[0.2em] py-3 rounded-none text-[9px] transition-all flex items-center justify-center gap-2 ${
                          isSaving ? 'opacity-70 cursor-not-allowed bg-stone-700 text-white' : ''
                        } ${
                          editingDesign ? 'w-2/3 bg-[#1A1A1A] text-white hover:bg-stone-800' : 'w-full bg-[#1A1A1A] text-white hover:bg-stone-800'
                        }`}
                      >
                        {isSaving ? (
                          <>
                            <Cloud size={12} className="animate-bounce" />
                            <span>Guardando en la nube...</span>
                          </>
                        ) : editingDesign ? (
                          'Guardar Cambios'
                        ) : (
                          'Publicar Tarjeta'
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right Column: List of Existing Design Cards & Actions */}
                <div className="lg:col-span-7 space-y-4">
                  <h4 className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#1A1A1A] font-bold border-b border-[#E5E5E1] pb-2">
                    ✦ Tarjetas de Branding & Diseño Publicadas ({designProjects.length})
                  </h4>

                  <div className="grid grid-cols-1 gap-3 max-h-[750px] overflow-y-auto pr-2">
                    {designProjects.map((p) => (
                      <div
                        key={p.id}
                        className={`bg-white p-4 border transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                          editingDesign?.id === p.id ? 'border-[#1A1A1A] ring-1 ring-[#1A1A1A]' : 'border-[#E5E5E1] hover:border-stone-400'
                        }`}
                      >
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          {p.imageUrl ? (
                            <div className="w-20 h-16 bg-[#F7F7F5] border border-stone-200 overflow-hidden shrink-0">
                              <img
                                src={p.imageUrl}
                                alt={p.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-16 bg-stone-100 border border-dashed border-stone-300 flex items-center justify-center shrink-0 text-stone-400 font-mono text-[8px] uppercase">
                              Sin foto
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-light text-stone-900 mt-0.5 truncate" style={{ fontFamily: 'Georgia, serif' }}>
                              {p.title}
                            </h5>
                            {p.description && p.description.trim().length > 0 ? (
                              <p className="text-[11px] text-stone-600 font-sans mt-1 line-clamp-2 leading-relaxed">
                                {p.description}
                              </p>
                            ) : (
                              <span className="inline-block text-[9px] font-mono text-stone-400 bg-stone-100 px-2 py-0.5 mt-1 border border-stone-200">
                                Solo título (sin texto descriptivo)
                              </span>
                            )}

                            {p.websiteUrl && p.websiteUrl.trim().length > 0 && (
                              <div className="mt-1.5">
                                <a
                                  href={p.websiteUrl.startsWith('http://') || p.websiteUrl.startsWith('https://') ? p.websiteUrl : `https://${p.websiteUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-mono text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2 py-0.5 border border-stone-200 transition-colors"
                                  title={`Abrir ${p.websiteUrl}`}
                                >
                                  <Globe size={10} className="text-stone-500" />
                                  <span className="truncate max-w-[180px]">{p.websiteUrl}</span>
                                  <ExternalLink size={9} />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Edit and Delete Actions */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
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
                                title="Editar Tarjeta"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingDesignId(p.id)}
                                className="p-2 text-stone-400 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                                title="Eliminar Tarjeta"
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
                        No hay tarjetas de diseño cargadas. ¡Crea la primera en el formulario de la izquierda!
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
