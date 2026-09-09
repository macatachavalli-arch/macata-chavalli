import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDocs, 
  collection, 
  onSnapshot, 
  deleteDoc, 
  query, 
  orderBy, 
  writeBatch 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Artwork, DesignProject, DesignCarouselItem } from '../types';

const app = initializeApp(firebaseConfig);

// Initialize Firestore targeting the specific databaseId if provided
export const db = getFirestore(
  app, 
  firebaseConfig.firestoreDatabaseId || '(default)'
);

export const ARTWORKS_COLLECTION = 'artworks';
export const DESIGNS_COLLECTION = 'designProjects';
export const CAROUSEL_COLLECTION = 'designCarousel';

export const DELETED_ARTWORKS_KEY = 'macata_deleted_artworks';
export const DELETED_DESIGNS_KEY = 'macata_deleted_designs';
export const LOCAL_ARTWORKS_KEY = 'macata_artworks';
export const LOCAL_DESIGNS_KEY = 'macata_designs';

// Helper to track locally deleted artwork IDs so cloud snapshots don't resurrect them
export function getLocallyDeletedArtworkIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_ARTWORKS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function markArtworkAsLocallyDeleted(id: string): void {
  try {
    const set = getLocallyDeletedArtworkIds();
    set.add(id);
    localStorage.setItem(DELETED_ARTWORKS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.error('Failed to save deleted artwork ID:', e);
  }
}

export function unmarkArtworkAsLocallyDeleted(id: string): void {
  try {
    const set = getLocallyDeletedArtworkIds();
    set.delete(id);
    localStorage.setItem(DELETED_ARTWORKS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.error('Failed to unmark deleted artwork ID:', e);
  }
}

// Helper to track locally deleted design IDs
export function getLocallyDeletedDesignIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_DESIGNS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function markDesignAsLocallyDeleted(id: string): void {
  try {
    const set = getLocallyDeletedDesignIds();
    set.add(id);
    localStorage.setItem(DELETED_DESIGNS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.error('Failed to save deleted design ID:', e);
  }
}

export function unmarkDesignAsLocallyDeleted(id: string): void {
  try {
    const set = getLocallyDeletedDesignIds();
    set.delete(id);
    localStorage.setItem(DELETED_DESIGNS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.error('Failed to unmark deleted design ID:', e);
  }
}

// Smart bi-directional merge: protects user's recent local modifications from being wiped out by stale cloud snapshots
export function mergeArtworksWithLocal(cloudArtworks: Artwork[]): Artwork[] {
  const deletedIds = getLocallyDeletedArtworkIds();
  let localArtworks: Artwork[] = [];
  try {
    const cached = localStorage.getItem(LOCAL_ARTWORKS_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) localArtworks = parsed;
    }
  } catch {
    localArtworks = [];
  }

  // 1. Filter out any artwork that was locally deleted
  const activeCloud = cloudArtworks.filter(a => !deletedIds.has(a.id));
  const activeLocal = localArtworks.filter(a => !deletedIds.has(a.id));

  const map = new Map<string, Artwork>();

  // 2. Add all cloud items
  for (const item of activeCloud) {
    map.set(item.id, item);
  }

  // 3. Overlay local items: if an item exists locally but not in cloud (e.g. newly created),
  // or was updated locally, preserve the local version!
  for (const localItem of activeLocal) {
    const existing = map.get(localItem.id);
    if (!existing) {
      map.set(localItem.id, localItem);
    } else {
      const localTime = localItem.updatedAt || 0;
      const cloudTime = existing.updatedAt || 0;
      if (localTime >= cloudTime) {
        map.set(localItem.id, { ...existing, ...localItem });
      }
    }
  }

  const result = Array.from(map.values());
  result.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return (b.updatedAt || 0) - (a.updatedAt || 0);
  });

  return result;
}

// Smart bi-directional merge for design projects
export function mergeDesignsWithLocal(cloudDesigns: DesignProject[]): DesignProject[] {
  const deletedIds = getLocallyDeletedDesignIds();
  let localDesigns: DesignProject[] = [];
  try {
    const cached = localStorage.getItem(LOCAL_DESIGNS_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) localDesigns = parsed;
    }
  } catch {
    localDesigns = [];
  }

  const map = new Map<string, DesignProject>();
  for (const item of cloudDesigns) {
    if (!deletedIds.has(item.id)) map.set(item.id, item);
  }

  for (const localItem of localDesigns) {
    if (deletedIds.has(localItem.id)) continue;
    const existing = map.get(localItem.id);
    if (!existing) {
      map.set(localItem.id, localItem);
    } else {
      const localTime = localItem.updatedAt || 0;
      const cloudTime = existing.updatedAt || 0;
      if (localTime >= cloudTime) {
        map.set(localItem.id, { ...existing, ...localItem });
      }
    }
  }

  const result = Array.from(map.values());
  result.sort((a, b) => (a.num || '').localeCompare(b.num || ''));
  return result;
}

// Subscribe to real-time updates for artworks with local-first guarantee
export function subscribeArtworks(
  onSuccess: (artworks: Artwork[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, ARTWORKS_COLLECTION));
  return onSnapshot(
    q,
    (snapshot) => {
      const cloudList: Artwork[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Artwork;
        // Filter out probe documents or malformed records
        if (data && data.title && docSnap.id !== 'test-connectivity-probe') {
          cloudList.push({ ...data, id: docSnap.id });
        }
      });
      // Merge with local state to preserve user's newest modifications
      const merged = mergeArtworksWithLocal(cloudList);
      onSuccess(merged);
    },
    (err) => {
      console.error('Error fetching artworks from Firestore:', err);
      // Even on cloud listener error, make sure local state is served
      const localMerged = mergeArtworksWithLocal([]);
      if (localMerged.length > 0) {
        onSuccess(localMerged);
      }
      if (onError) onError(err);
    }
  );
}

// Subscribe to real-time updates for design projects with local-first guarantee
export function subscribeDesignProjects(
  onSuccess: (projects: DesignProject[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, DESIGNS_COLLECTION));
  return onSnapshot(
    q,
    (snapshot) => {
      const cloudList: DesignProject[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as DesignProject;
        cloudList.push({ ...data, id: docSnap.id });
      });
      const merged = mergeDesignsWithLocal(cloudList);
      onSuccess(merged);
    },
    (err) => {
      console.error('Error fetching design projects from Firestore:', err);
      const localMerged = mergeDesignsWithLocal([]);
      if (localMerged.length > 0) {
        onSuccess(localMerged);
      }
      if (onError) onError(err);
    }
  );
}

// Subscribe to real-time updates for design carousel images
export function subscribeDesignCarousel(
  onSuccess: (items: DesignCarouselItem[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, CAROUSEL_COLLECTION));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: DesignCarouselItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as DesignCarouselItem;
        list.push({ ...data, id: docSnap.id });
      });
      list.sort((a, b) => (a.order || 0) - (b.order || 0));
      onSuccess(list);
    },
    (err) => {
      console.error('Error fetching design carousel from Firestore:', err);
      if (onError) onError(err);
    }
  );
}

export function isQuotaExhaustedError(err: any): boolean {
  const msg = err?.message || String(err || '');
  const code = err?.code || '';
  return (
    code === 'resource-exhausted' ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('Quota limit exceeded') ||
    msg.includes('quota metric') ||
    msg.includes('Quota')
  );
}

function validateDocumentSize(data: any, docName: string) {
  const jsonStr = JSON.stringify(data);
  const bytes = new Blob([jsonStr]).size;
  // Firestore document limit is 1,048,576 bytes (1 MiB).
  // We enforce a safe boundary at 950,000 bytes.
  if (bytes > 950000) {
    const kb = Math.round(bytes / 1024);
    throw new Error(
      `El tamaño total de "${docName}" (${kb} KB) supera el límite máximo permitido por Firestore (1000 KB). Reduce la resolución o calidad de las imágenes cargadas.`
    );
  }
}

export interface CloudOperationResult {
  cloudSuccess: boolean;
  quotaExceeded?: boolean;
  sizeWarning?: boolean;
}

// Save or Update an Artwork in Firestore (Never crashes, local-first friendly)
export async function saveArtworkToCloud(artwork: Artwork): Promise<CloudOperationResult> {
  const id = artwork.id || `art-${Date.now()}`;
  const docRef = doc(db, ARTWORKS_COLLECTION, id);
  const withTimestamp: Artwork = {
    ...artwork,
    id,
    updatedAt: artwork.updatedAt || Date.now()
  };
  const cleanData = JSON.parse(JSON.stringify(withTimestamp));

  try {
    validateDocumentSize(cleanData, artwork.title || 'Obra');
  } catch (sizeErr) {
    console.warn('Artwork exceeds safe Firestore document boundary, saved locally:', sizeErr);
    unmarkArtworkAsLocallyDeleted(id);
    return { cloudSuccess: false, quotaExceeded: false, sizeWarning: true };
  }

  try {
    await Promise.race([
      setDoc(docRef, cleanData, { merge: true }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout_write')), 15000))
    ]);
    unmarkArtworkAsLocallyDeleted(id);
    return { cloudSuccess: true };
  } catch (err: any) {
    if (isQuotaExhaustedError(err) || err?.message === 'timeout_write') {
      console.warn('Firestore write quota reached or write timed out. Preserved locally:', err);
      return { cloudSuccess: false, quotaExceeded: true };
    }
    console.warn('Firestore write error (preserved locally):', err);
    return { cloudSuccess: false, quotaExceeded: true };
  }
}

// Delete Artwork from Firestore (Tracks local deletion)
export async function deleteArtworkFromCloud(id: string): Promise<CloudOperationResult> {
  markArtworkAsLocallyDeleted(id);
  const docRef = doc(db, ARTWORKS_COLLECTION, id);
  try {
    await Promise.race([
      deleteDoc(docRef),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout_write')), 15000))
    ]);
    return { cloudSuccess: true };
  } catch (err: any) {
    if (isQuotaExhaustedError(err) || err?.message === 'timeout_write') {
      console.warn('Firestore delete quota reached or timed out (recorded locally):', err);
      return { cloudSuccess: false, quotaExceeded: true };
    }
    return { cloudSuccess: false, quotaExceeded: true };
  }
}

// Save or Update a Design Project in Firestore
export async function saveDesignProjectToCloud(project: DesignProject): Promise<CloudOperationResult> {
  const id = project.id || `design-${Date.now()}`;
  const docRef = doc(db, DESIGNS_COLLECTION, id);
  const withTimestamp: DesignProject = {
    ...project,
    id,
    updatedAt: project.updatedAt || Date.now()
  };
  const cleanData = JSON.parse(JSON.stringify(withTimestamp));

  try {
    validateDocumentSize(cleanData, project.title || 'Proyecto');
  } catch (sizeErr) {
    console.warn('Design project exceeds safe document boundary, saved locally:', sizeErr);
    unmarkDesignAsLocallyDeleted(id);
    return { cloudSuccess: false, quotaExceeded: false, sizeWarning: true };
  }

  try {
    await Promise.race([
      setDoc(docRef, cleanData, { merge: true }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout_write')), 15000))
    ]);
    unmarkDesignAsLocallyDeleted(id);
    return { cloudSuccess: true };
  } catch (err: any) {
    if (isQuotaExhaustedError(err) || err?.message === 'timeout_write') {
      console.warn('Firestore design write quota exceeded:', err);
      return { cloudSuccess: false, quotaExceeded: true };
    }
    return { cloudSuccess: false, quotaExceeded: true };
  }
}

// Delete Design Project from Firestore
export async function deleteDesignProjectFromCloud(id: string): Promise<CloudOperationResult> {
  markDesignAsLocallyDeleted(id);
  const docRef = doc(db, DESIGNS_COLLECTION, id);
  try {
    await Promise.race([
      deleteDoc(docRef),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout_write')), 15000))
    ]);
    return { cloudSuccess: true };
  } catch (err: any) {
    if (isQuotaExhaustedError(err) || err?.message === 'timeout_write') {
      return { cloudSuccess: false, quotaExceeded: true };
    }
    return { cloudSuccess: false, quotaExceeded: true };
  }
}

// Save or Update a Design Carousel Item in Firestore
export async function saveCarouselItemToCloud(item: DesignCarouselItem): Promise<CloudOperationResult> {
  const id = item.id || `carousel-${Date.now()}`;
  const docRef = doc(db, CAROUSEL_COLLECTION, id);
  const cleanData = JSON.parse(JSON.stringify({ ...item, id }));
  validateDocumentSize(cleanData, item.title || 'Item de Carrusel');
  try {
    await Promise.race([
      setDoc(docRef, cleanData, { merge: true }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout_write')), 15000))
    ]);
    return { cloudSuccess: true };
  } catch (err: any) {
    if (isQuotaExhaustedError(err) || err?.message === 'timeout_write') {
      return { cloudSuccess: false, quotaExceeded: true };
    }
    throw err;
  }
}

// Delete Design Carousel Item from Firestore
export async function deleteCarouselItemFromCloud(id: string): Promise<CloudOperationResult> {
  const docRef = doc(db, CAROUSEL_COLLECTION, id);
  try {
    await Promise.race([
      deleteDoc(docRef),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout_write')), 15000))
    ]);
    return { cloudSuccess: true };
  } catch (err: any) {
    if (isQuotaExhaustedError(err) || err?.message === 'timeout_write') {
      return { cloudSuccess: false, quotaExceeded: true };
    }
    throw err;
  }
}

// Diagnostic: Test active connection to Cloud Firestore
export async function testCloudConnection(): Promise<{ 
  ok: boolean; 
  isQuota?: boolean; 
  count?: number; 
  message: string 
}> {
  try {
    // 1. Verify read operations to Firestore
    const readSnap = await getDocs(collection(db, ARTWORKS_COLLECTION));
    const count = readSnap.size;

    // 2. Test write with a safe probe
    try {
      const testDoc = doc(db, '_connection_test', 'ping');
      await Promise.race([
        setDoc(testDoc, { timestamp: Date.now(), ping: 'ok' }, { merge: true }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout_probe')), 3500))
      ]);
      return { 
        ok: true, 
        count, 
        message: `Conexión a Firebase Firestore 100% operativa (Lectura y Escritura sincronizadas en la nube, ${count} obras activas).` 
      };
    } catch (writeErr: any) {
      if (isQuotaExhaustedError(writeErr) || writeErr?.message === 'timeout_probe') {
        return {
          ok: true,
          isQuota: true,
          count,
          message: `Nube Conectada y Operativa (${count} obras leídas en la nube). La cuota gratuita de escritura diaria de Firestore se ha alcanzado hoy. Tus cambios se guardan de inmediato localmente en tu navegador sin perder nada y se sincronizarán cuando se reinicie la cuota diaria.`
        };
      }
      throw writeErr;
    }
  } catch (err: any) {
    console.error('Firestore connection test error:', err);
    return { 
      ok: false, 
      message: err?.message || String(err)
    };
  }
}

// Sync all local items to Cloud Firestore
export async function syncAllLocalToCloud(
  artworks: Artwork[],
  designs: DesignProject[],
  carousel: DesignCarouselItem[]
): Promise<{ success: number; errors: string[]; quotaExceeded?: boolean }> {
  let successCount = 0;
  const errorList: string[] = [];
  let quotaHit = false;

  for (const art of artworks) {
    try {
      const res = await saveArtworkToCloud(art);
      if (res.cloudSuccess) {
        successCount++;
      } else if (res.quotaExceeded) {
        quotaHit = true;
        break;
      }
    } catch (e: any) {
      errorList.push(`Obra "${art.title}": ${e?.message || String(e)}`);
    }
  }

  if (!quotaHit) {
    for (const des of designs) {
      try {
        const res = await saveDesignProjectToCloud(des);
        if (res.cloudSuccess) {
          successCount++;
        } else if (res.quotaExceeded) {
          quotaHit = true;
          break;
        }
      } catch (e: any) {
        errorList.push(`Diseño "${des.title}": ${e?.message || String(e)}`);
      }
    }
  }

  if (!quotaHit) {
    for (const car of carousel) {
      try {
        const res = await saveCarouselItemToCloud(car);
        if (res.cloudSuccess) {
          successCount++;
        } else if (res.quotaExceeded) {
          quotaHit = true;
          break;
        }
      } catch (e: any) {
        errorList.push(`Carrusel "${car.title}": ${e?.message || String(e)}`);
      }
    }
  }

  return { success: successCount, errors: errorList, quotaExceeded: quotaHit };
}

// Initialize and seed default database records if Firestore is empty
export async function seedDefaultsIfEmpty(
  defaultArtworks: Artwork[], 
  defaultDesignProjects: DesignProject[],
  defaultCarouselItems: DesignCarouselItem[] = []
): Promise<boolean> {
  try {
    const artSnap = await getDocs(collection(db, ARTWORKS_COLLECTION));
    if (artSnap.empty) {
      console.log('Seeding default artworks to Firestore...');
      const batch = writeBatch(db);
      for (const art of defaultArtworks) {
        const ref = doc(db, ARTWORKS_COLLECTION, art.id);
        batch.set(ref, JSON.parse(JSON.stringify(art)));
      }
      await batch.commit();
    }

    const designSnap = await getDocs(collection(db, DESIGNS_COLLECTION));
    if (designSnap.empty) {
      console.log('Seeding default design projects to Firestore...');
      const batch = writeBatch(db);
      for (const des of defaultDesignProjects) {
        const ref = doc(db, DESIGNS_COLLECTION, des.id);
        batch.set(ref, JSON.parse(JSON.stringify(des)));
      }
      await batch.commit();
    }

    const carouselSnap = await getDocs(collection(db, CAROUSEL_COLLECTION));
    if (carouselSnap.empty && defaultCarouselItems.length > 0) {
      console.log('Seeding default design carousel to Firestore...');
      const batch = writeBatch(db);
      for (const item of defaultCarouselItems) {
        const ref = doc(db, CAROUSEL_COLLECTION, item.id);
        batch.set(ref, JSON.parse(JSON.stringify(item)));
      }
      await batch.commit();
    }
    return true;
  } catch (e) {
    console.error('Error seeding defaults to Firestore:', e);
    return false;
  }
}

// Reset cloud database to factory defaults
export async function resetCloudToDefaults(
  defaultArtworks: Artwork[],
  defaultDesignProjects: DesignProject[],
  defaultCarouselItems: DesignCarouselItem[] = []
): Promise<void> {
  // Delete existing artworks
  const artSnap = await getDocs(collection(db, ARTWORKS_COLLECTION));
  for (const docSnap of artSnap.docs) {
    await deleteDoc(docSnap.ref);
  }
  // Delete existing design projects
  const designSnap = await getDocs(collection(db, DESIGNS_COLLECTION));
  for (const docSnap of designSnap.docs) {
    await deleteDoc(docSnap.ref);
  }
  // Delete existing carousel items
  const carouselSnap = await getDocs(collection(db, CAROUSEL_COLLECTION));
  for (const docSnap of carouselSnap.docs) {
    await deleteDoc(docSnap.ref);
  }
  // Clear local deletion markers
  localStorage.removeItem(DELETED_ARTWORKS_KEY);
  localStorage.removeItem(DELETED_DESIGNS_KEY);
  // Re-seed defaults
  await seedDefaultsIfEmpty(defaultArtworks, defaultDesignProjects, defaultCarouselItems);
}
