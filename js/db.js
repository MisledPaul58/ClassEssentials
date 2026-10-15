/**
 * ClassEssentials - Gestor de Base de Datos en la Nube (Cloud Database)
 * Integración con Google Firebase Firestore en tiempo real para 1º DAM (IES Las Encinas)
 */

import { DEFAULT_ANNOUNCEMENTS, FIREBASE_CONFIG } from './data.js';

const STORAGE_KEYS = {
    FIREBASE_CONFIG: 'classessentials_firebase_custom_config_v1',
    LOCAL_ANNOUNCEMENTS: 'classessentials_cloud_announcements_cache_v2'
};

class CloudDatabaseService {
    constructor() {
        this.isInitialized = false;
        this.isCloudConnected = false;
        this.db = null;
        this.subscribers = [];
        this.announcements = [];
        this._unsubscribeSnapshot = null; // Referencia al listener activo para poder cancelarlo
    }

    /**
     * Obtiene la configuración de Firebase activa (prioriza la de data.js, luego la guardada en localStorage)
     */
    getConfig() {
        // Prioridad 1: config real en data.js (hardcodeada por el dueño)
        if (FIREBASE_CONFIG && FIREBASE_CONFIG.projectId && FIREBASE_CONFIG.apiKey) {
            return FIREBASE_CONFIG;
        }

        // Prioridad 2: config guardada manualmente por el dueño desde el panel admin
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.FIREBASE_CONFIG);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.projectId && parsed.apiKey) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn("Error leyendo config de Firebase local:", e);
        }

        return null;
    }

    /**
     * Guarda la configuración de Firebase introducida por el dueño desde el panel
     */
    saveConfig(configObj) {
        try {
            localStorage.setItem(STORAGE_KEYS.FIREBASE_CONFIG, JSON.stringify(configObj));
            return true;
        } catch (e) {
            console.error("Error al guardar config de Firebase:", e);
            return false;
        }
    }

    /**
     * Inicializa la conexión con Firebase Firestore.
     * Cancela cualquier listener previo antes de crear uno nuevo (evita duplicados).
     */
    async init(onUpdateCallback) {
        // Registrar el callback si no estaba ya
        if (onUpdateCallback && !this.subscribers.includes(onUpdateCallback)) {
            this.subscribers.push(onUpdateCallback);
        }

        // CANCELAR listener anterior antes de crear uno nuevo
        if (this._unsubscribeSnapshot) {
            this._unsubscribeSnapshot();
            this._unsubscribeSnapshot = null;
        }

        const config = this.getConfig();

        if (config && config.projectId && config.apiKey) {
            try {
                const { initializeApp, getApps, getApp } = await import("https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js");
                const {
                    getFirestore,
                    collection,
                    onSnapshot,
                    query,
                    orderBy
                } = await import("https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js");

                // Reutilizar la app si ya fue inicializada, evitar doble initializeApp
                let app;
                const existingApps = getApps();
                if (existingApps.length === 0) {
                    app = initializeApp(config);
                } else {
                    app = getApp();
                }

                this.db = getFirestore(app);
                this.isCloudConnected = true;

                const colRef = collection(this.db, "announcements");
                const q = query(colRef, orderBy("createdAt", "desc"));

                // Crear UN SOLO listener y guardar la función unsubscribe
                this._unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
                    const cloudPosts = [];
                    snapshot.forEach(docSnap => {
                        cloudPosts.push({
                            id: docSnap.id,
                            ...docSnap.data()
                        });
                    });
                    this.announcements = cloudPosts;
                    this.saveLocalCache(cloudPosts);
                    this.notifySubscribers();
                }, (error) => {
                    console.warn("Error en escucha de Firestore (usando respaldo local):", error);
                    this.isCloudConnected = false;
                    this.loadFallbackData();
                });

                return true;
            } catch (err) {
                console.warn("No se pudo conectar a Firebase Firestore:", err);
                this.isCloudConnected = false;
                this.loadFallbackData();
                return false;
            }
        } else {
            // Sin Firebase configurado: cargar respaldo local
            this.isCloudConnected = false;
            this.loadFallbackData();
            return false;
        }
    }

    /**
     * Carga datos de respaldo desde localStorage o los valores por defecto
     */
    loadFallbackData() {
        try {
            const cached = localStorage.getItem(STORAGE_KEYS.LOCAL_ANNOUNCEMENTS);
            if (cached) {
                this.announcements = JSON.parse(cached);
            } else {
                this.announcements = [...DEFAULT_ANNOUNCEMENTS];
                this.saveLocalCache(this.announcements);
            }
        } catch (e) {
            this.announcements = [...DEFAULT_ANNOUNCEMENTS];
        }
        this.notifySubscribers();
    }

    saveLocalCache(posts) {
        try {
            localStorage.setItem(STORAGE_KEYS.LOCAL_ANNOUNCEMENTS, JSON.stringify(posts));
        } catch (e) {}
    }

    notifySubscribers() {
        this.subscribers.forEach(cb => {
            try {
                cb(this.announcements, this.isCloudConnected);
            } catch (e) {
                console.error("Error en suscriptor de base de datos:", e);
            }
        });
    }

    /**
     * Guarda un nuevo anuncio o recurso en la Base de Datos en la Nube
     */
    async addAnnouncement(postData) {
        const newPost = {
            title: postData.title,
            category: postData.category,
            author: postData.author || "Compañero/a 1º DAM",
            link: postData.link || "",
            linkText: postData.linkText || (postData.link ? "Acceder al Recurso" : ""),
            description: postData.description,
            badge: postData.badge || (postData.isOfficial ? "Oficial" : "Aporte de Clase"),
            isOfficial: Boolean(postData.isOfficial),
            date: new Date().toISOString().slice(0, 10),
            createdAt: new Date().toISOString()
        };

        if (this.isCloudConnected && this.db) {
            try {
                const { collection, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js");
                await addDoc(collection(this.db, "announcements"), {
                    ...newPost,
                    createdAt: serverTimestamp()
                });
                // El onSnapshot actualizará la UI automáticamente
                return { success: true, inCloud: true };
            } catch (err) {
                console.error("Error al guardar en Firestore:", err);
                return { success: false, inCloud: true, error: err.message };
            }
        }

        // Respaldo local (sin conexión a Firebase)
        newPost.id = 'post-' + Date.now();
        this.announcements.unshift(newPost);
        this.saveLocalCache(this.announcements);
        this.notifySubscribers();
        return { success: true, inCloud: false };
    }

    /**
     * Borra permanentemente un anuncio de la Base de Datos en la Nube
     */
    async deleteAnnouncement(postId) {
        if (this.isCloudConnected && this.db) {
            try {
                const { doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js");
                await deleteDoc(doc(this.db, "announcements", postId));
                // El onSnapshot actualizará la UI automáticamente al recibir el cambio
                return { success: true, inCloud: true };
            } catch (err) {
                console.error("Error al eliminar documento en Firestore:", err);
                return { success: false, inCloud: true, error: err.message };
            }
        }

        // Respaldo local (sin conexión a Firebase)
        this.announcements = this.announcements.filter(p => p.id !== postId);
        this.saveLocalCache(this.announcements);
        this.notifySubscribers();
        return { success: true, inCloud: false };
    }

    /**
     * Siembra los anuncios oficiales iniciales en Firestore (solo si está vacío)
     * Llamado manualmente desde el panel admin con el botón "Restaurar Originales"
     */
    async seedDefaultAnnouncements() {
        if (!this.isCloudConnected || !this.db) {
            this.announcements = [...DEFAULT_ANNOUNCEMENTS];
            this.saveLocalCache(this.announcements);
            this.notifySubscribers();
            return;
        }

        try {
            const { collection, addDoc, getDocs, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js");
            const colRef = collection(this.db, "announcements");
            const existingDocs = await getDocs(colRef);

            if (existingDocs.empty) {
                for (const item of DEFAULT_ANNOUNCEMENTS) {
                    await addDoc(colRef, {
                        ...item,
                        isOfficial: true,
                        createdAt: serverTimestamp()
                    });
                }
                console.log("Anuncios por defecto sembrados en Firestore.");
            } else {
                console.log("Firestore ya tiene anuncios, no se siembran duplicados.");
            }
        } catch (err) {
            console.error("Error al sembrar anuncios por defecto:", err);
        }
    }

    /**
     * Restaura los anuncios iniciales
     */
    restoreDefaults() {
        this.seedDefaultAnnouncements();
    }
}

export const CloudDB = new CloudDatabaseService();
