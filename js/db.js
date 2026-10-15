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
    }

    /**
     * Obtiene la configuración de Firebase activa (prioriza la guardada por el dueño, o la de data.js)
     */
    getConfig() {
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

        if (FIREBASE_CONFIG && FIREBASE_CONFIG.projectId && FIREBASE_CONFIG.apiKey) {
            return FIREBASE_CONFIG;
        }

        return null;
    }

    /**
     * Guarda la configuración de Firebase introducida por el dueño
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
     * Inicializa la conexión con Firebase Firestore
     */
    async init(onUpdateCallback) {
        if (onUpdateCallback && !this.subscribers.includes(onUpdateCallback)) {
            this.subscribers.push(onUpdateCallback);
        }

        const config = this.getConfig();

        if (config && config.projectId && config.apiKey && !config.apiKey.includes("AIzaSyD-CLASS-ESSENTIALS")) {
            try {
                const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js");
                const { 
                    getFirestore, 
                    collection, 
                    onSnapshot, 
                    addDoc, 
                    deleteDoc, 
                    doc, 
                    getDocs,
                    serverTimestamp, 
                    query, 
                    orderBy 
                } = await import("https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js");

                let app;
                const apps = getApps();
                if (apps.length === 0) {
                    app = initializeApp(config);
                } else {
                    app = apps[0];
                }

                this.db = getFirestore(app);
                this.isCloudConnected = true;

                // Consulta ordenada cronológicamente
                const colRef = collection(this.db, "announcements");

                // Sembrado inicial si la colección está vacía
                try {
                    const existingDocs = await getDocs(colRef);
                    if (existingDocs.empty) {
                        for (const item of DEFAULT_ANNOUNCEMENTS) {
                            await addDoc(colRef, {
                                ...item,
                                isOfficial: true,
                                createdAt: serverTimestamp()
                            });
                        }
                    }
                } catch (seedErr) {
                    console.warn("Aviso al comprobar datos iniciales:", seedErr);
                }

                // Suscripción en tiempo real (WebSockets / Firestore Snapshot)
                const q = query(colRef, orderBy("createdAt", "desc"));
                
                onSnapshot(q, (snapshot) => {
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
            // Sin Firebase configurado todavía: cargar respaldo
            this.isCloudConnected = false;
            this.loadFallbackData();
            return false;
        }
    }

    /**
     * Carga datos de respaldo
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
                return { success: true, inCloud: true };
            } catch (err) {
                console.error("Error al guardar en Firestore:", err);
            }
        }

        // Respaldo local
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
                // El onSnapshot actualizará la UI automáticamente
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
     * Restaura los anuncios iniciales
     */
    restoreDefaults() {
        this.announcements = [...DEFAULT_ANNOUNCEMENTS];
        this.saveLocalCache(this.announcements);
        this.notifySubscribers();
    }
}

export const CloudDB = new CloudDatabaseService();
