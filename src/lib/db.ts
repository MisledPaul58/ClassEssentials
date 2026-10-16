/**
 * Servicio de base de datos del tablón.
 *
 * - Si hay configuración de Firebase (variable de entorno `PUBLIC_FIREBASE_CONFIG`
 *   o configuración guardada por el dueño en localStorage), se conecta a
 *   Firestore en tiempo real.
 * - Si no, funciona en modo local usando la caché del navegador.
 *
 * El SDK de Firebase se importa de forma dinámica: solo se descarga cuando hace
 * falta, así la web carga al instante y el código no expone ninguna clave en el
 * repositorio (se inyecta en tiempo de build desde los Secrets de GitHub).
 */

import { DEFAULT_ANNOUNCEMENTS } from '../data/announcements';
import { FIREBASE_CONFIG } from './config';
import { STORAGE_KEYS, readJSON, writeJSON } from './storage';
import type { Announcement, FirebaseConfigLike } from './types';

export interface NewAnnouncementInput {
  title: string;
  category: string;
  author: string;
  link: string;
  linkText: string;
  description: string;
  isOfficial: boolean;
  ownerToken: string;
}

export interface UpdateAnnouncementInput {
  title: string;
  category: string;
  author: string;
  link: string;
  linkText: string;
  description: string;
}

export interface DbResult {
  success: boolean;
  inCloud: boolean;
  error?: string;
}

type UpdateCallback = (posts: Announcement[], isCloudConnected: boolean) => void;

function isAnnouncementLike(value: unknown): value is Announcement {
  if (!value || typeof value !== 'object') return false;
  const post = value as Record<string, unknown>;
  return typeof post.id === 'string' && typeof post.title === 'string';
}

class CloudDatabaseService {
  private cloudConnected = false;
  private db: import('firebase/firestore').Firestore | null = null;
  private subscribers: UpdateCallback[] = [];
  private posts: Announcement[] = [];
  private unsubscribeSnapshot: (() => void) | null = null;

  get isCloudConnected(): boolean {
    return this.cloudConnected;
  }

  /** Config activa: primero la del entorno (build), después la guardada por el dueño. */
  getConfig(): FirebaseConfigLike | null {
    if (FIREBASE_CONFIG) return FIREBASE_CONFIG;

    const saved = readJSON<FirebaseConfigLike>(STORAGE_KEYS.firebaseConfig);
    if (saved && saved.projectId && saved.apiKey) return saved;

    return null;
  }

  /** Guarda una configuración de Firebase personalizada (panel del dueño). */
  saveCustomConfig(config: FirebaseConfigLike): void {
    writeJSON(STORAGE_KEYS.firebaseConfig, config);
  }

  /**
   * Inicializa la conexión. Cancela cualquier listener previo antes de crear
   * uno nuevo para evitar suscripciones duplicadas.
   */
  async init(callback?: UpdateCallback): Promise<boolean> {
    if (callback && !this.subscribers.includes(callback)) {
      this.subscribers.push(callback);
    }

    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
      this.unsubscribeSnapshot = null;
    }

    const config = this.getConfig();
    if (!config) {
      this.cloudConnected = false;
      this.loadFallbackData();
      return false;
    }

    try {
      const { initializeApp, getApps, getApp } = await import('firebase/app');
      const { getFirestore, collection, onSnapshot, query, orderBy } = await import('firebase/firestore');

      const app = getApps().length > 0 ? getApp() : initializeApp(config as import('firebase/app').FirebaseOptions);
      this.db = getFirestore(app);

      const colRef = collection(this.db, 'announcements');
      const q = query(colRef, orderBy('createdAt', 'desc'));

      this.unsubscribeSnapshot = onSnapshot(
        q,
        snapshot => {
          const posts: Announcement[] = [];
          snapshot.forEach(docSnap => {
            posts.push({ ...(docSnap.data() as Omit<Announcement, 'id'>), id: docSnap.id });
          });
          this.posts = posts;
          this.cloudConnected = true;
          this.saveCache(posts);
          this.notify(true);
        },
        error => {
          console.warn('Error en la escucha de Firestore; se usa la caché local:', error);
          this.cloudConnected = false;
          this.loadFallbackData();
        }
      );

      return true;
    } catch (error) {
      console.warn('No se pudo conectar con Firebase; se usa la caché local:', error);
      this.cloudConnected = false;
      this.loadFallbackData();
      return false;
    }
  }

  /** Carga la caché local o los anuncios por defecto. */
  private loadFallbackData(): void {
    const cached = readJSON<unknown[]>(STORAGE_KEYS.announcementsCache);
    if (Array.isArray(cached) && cached.length > 0) {
      const valid = cached.filter(isAnnouncementLike);
      this.posts = valid.length > 0 ? valid : this.defaultPosts();
    } else {
      this.posts = this.defaultPosts();
    }
    this.saveCache(this.posts);
    this.notify(false);
  }

  private defaultPosts(): Announcement[] {
    return DEFAULT_ANNOUNCEMENTS.map(post => ({ ...post }));
  }

  private saveCache(posts: Announcement[]): void {
    writeJSON(STORAGE_KEYS.announcementsCache, posts);
  }

  private notify(isCloud: boolean): void {
    for (const callback of this.subscribers) {
      try {
        callback(this.posts, isCloud);
      } catch (error) {
        console.error('Error en un suscriptor del tablón:', error);
      }
    }
  }

  /** Publica un nuevo anuncio o recurso. */
  async addAnnouncement(input: NewAnnouncementInput): Promise<DbResult> {
    const base = {
      title: input.title,
      category: input.category,
      author: input.author,
      link: input.link,
      linkText: input.linkText,
      description: input.description,
      badge: input.isOfficial ? 'Oficial' : 'Aporte de Clase',
      isOfficial: input.isOfficial,
      ownerToken: input.ownerToken,
      date: new Date().toISOString().slice(0, 10)
    };

    if (this.cloudConnected && this.db) {
      try {
        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
        await addDoc(collection(this.db, 'announcements'), { ...base, createdAt: serverTimestamp() });
        // El listener de tiempo real actualiza la interfaz automáticamente.
        return { success: true, inCloud: true };
      } catch (error) {
        console.error('Error al guardar en Firestore:', error);
        return { success: false, inCloud: true, error: error instanceof Error ? error.message : String(error) };
      }
    }

    const post: Announcement = {
      ...base,
      id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString()
    };
    this.posts = [post, ...this.posts];
    this.saveCache(this.posts);
    this.notify(false);
    return { success: true, inCloud: false };
  }

  /** Actualiza una publicación existente (edición). */
  async updateAnnouncement(postId: string, input: UpdateAnnouncementInput): Promise<DbResult> {
    const patch = {
      title: input.title,
      category: input.category,
      author: input.author,
      link: input.link,
      linkText: input.linkText,
      description: input.description
    };

    if (this.cloudConnected && this.db) {
      try {
        const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
        await updateDoc(doc(this.db, 'announcements', postId), { ...patch, updatedAt: serverTimestamp() });
        return { success: true, inCloud: true };
      } catch (error) {
        console.error('Error al editar en Firestore:', error);
        return { success: false, inCloud: true, error: error instanceof Error ? error.message : String(error) };
      }
    }

    this.posts = this.posts.map(post =>
      post.id === postId ? { ...post, ...patch, updatedAt: new Date().toISOString() } : post
    );
    this.saveCache(this.posts);
    this.notify(false);
    return { success: true, inCloud: false };
  }

  /** Borra una publicación de forma permanente. */
  async deleteAnnouncement(postId: string): Promise<DbResult> {
    if (this.cloudConnected && this.db) {
      try {
        const { doc, deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(this.db, 'announcements', postId));
        return { success: true, inCloud: true };
      } catch (error) {
        console.error('Error al borrar en Firestore:', error);
        return { success: false, inCloud: true, error: error instanceof Error ? error.message : String(error) };
      }
    }

    this.posts = this.posts.filter(post => post.id !== postId);
    this.saveCache(this.posts);
    this.notify(false);
    return { success: true, inCloud: false };
  }

  /**
   * Siembra los anuncios oficiales iniciales en Firestore (solo si está vacío).
   * Se lanza desde el panel del dueño ("Restaurar Originales").
   */
  async seedDefaultAnnouncements(): Promise<void> {
    if (!this.cloudConnected || !this.db) {
      this.posts = this.defaultPosts();
      this.saveCache(this.posts);
      this.notify(false);
      return;
    }

    try {
      const { collection, addDoc, getDocs, serverTimestamp } = await import('firebase/firestore');
      const colRef = collection(this.db, 'announcements');
      const existingDocs = await getDocs(colRef);

      if (!existingDocs.empty) {
        console.log('Firestore ya tiene anuncios; no se siembran duplicados.');
        return;
      }

      for (const item of DEFAULT_ANNOUNCEMENTS) {
        await addDoc(colRef, { ...item, isOfficial: true, createdAt: serverTimestamp() });
      }
      console.log('Anuncios por defecto sembrados en Firestore.');
    } catch (error) {
      console.error('Error al sembrar los anuncios por defecto:', error);
    }
  }
}

/** Instancia única del servicio de base de datos. */
export const CloudDB = new CloudDatabaseService();
