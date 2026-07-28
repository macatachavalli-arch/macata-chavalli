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
import { Artwork, DesignProject } from '../types';

const app = initializeApp(firebaseConfig);

// Initialize Firestore targeting the specific databaseId if provided
export const db = getFirestore(
  app, 
  firebaseConfig.firestoreDatabaseId || '(default)'
);

export const ARTWORKS_COLLECTION = 'artworks';
export const DESIGNS_COLLECTION = 'designProjects';

// Subscribe to real-time updates for artworks
export function subscribeArtworks(
  onSuccess: (artworks: Artwork[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, ARTWORKS_COLLECTION));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Artwork[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Artwork;
        list.push({ ...data, id: docSnap.id });
      });
      // Sort: featured first, then by title
      list.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
      onSuccess(list);
    },
    (err) => {
      console.error('Error fetching artworks from Firestore:', err);
      if (onError) onError(err);
    }
  );
}

// Subscribe to real-time updates for design projects
export function subscribeDesignProjects(
  onSuccess: (projects: DesignProject[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, DESIGNS_COLLECTION));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: DesignProject[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as DesignProject;
        list.push({ ...data, id: docSnap.id });
      });
      list.sort((a, b) => (a.num || '').localeCompare(b.num || ''));
      onSuccess(list);
    },
    (err) => {
      console.error('Error fetching design projects from Firestore:', err);
      if (onError) onError(err);
    }
  );
}

// Save or Update an Artwork in Firestore
export async function saveArtworkToCloud(artwork: Artwork): Promise<void> {
  const id = artwork.id || `art-${Date.now()}`;
  const docRef = doc(db, ARTWORKS_COLLECTION, id);
  // Clean undefined fields
  const cleanData = JSON.parse(JSON.stringify({ ...artwork, id }));
  await setDoc(docRef, cleanData, { merge: true });
}

// Delete Artwork from Firestore
export async function deleteArtworkFromCloud(id: string): Promise<void> {
  const docRef = doc(db, ARTWORKS_COLLECTION, id);
  await deleteDoc(docRef);
}

// Save or Update a Design Project in Firestore
export async function saveDesignProjectToCloud(project: DesignProject): Promise<void> {
  const id = project.id || `design-${Date.now()}`;
  const docRef = doc(db, DESIGNS_COLLECTION, id);
  const cleanData = JSON.parse(JSON.stringify({ ...project, id }));
  await setDoc(docRef, cleanData, { merge: true });
}

// Delete Design Project from Firestore
export async function deleteDesignProjectFromCloud(id: string): Promise<void> {
  const docRef = doc(db, DESIGNS_COLLECTION, id);
  await deleteDoc(docRef);
}

// Initialize and seed default database records if Firestore is empty
export async function seedDefaultsIfEmpty(
  defaultArtworks: Artwork[], 
  defaultDesignProjects: DesignProject[]
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
    return true;
  } catch (e) {
    console.error('Error seeding defaults to Firestore:', e);
    return false;
  }
}

// Reset cloud database to factory defaults
export async function resetCloudToDefaults(
  defaultArtworks: Artwork[],
  defaultDesignProjects: DesignProject[]
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
  // Re-seed defaults
  await seedDefaultsIfEmpty(defaultArtworks, defaultDesignProjects);
}
