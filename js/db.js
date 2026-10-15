/**
 * ClassEssentials - Gestor de Base de Datos en la Nube (Cloud Database)
 * Soporte para Firebase Firestore en tiempo real y almacenamiento en la nube para 1º DAM
 */

import { DEFAULT_ANNOUNCEMENTS } from './data.js';

// Configuración de Firebase Firestore (Google Cloud - Nivel Gratuito Permanente)
// El dueño de la web puede modificar estos datos desde su panel secreto de administración
export const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "AIzaSyD-CLASS-ESSENTIALS-IES-LAS-ENCINAS",
    authDomain: "classessentials-ies-las-encinas.firebaseapp.com",
    projectId: "classessentials-ies-las-encinas",
    storageBucket: "classessentials-ies-las-encinas.appspot.com",
    messagingSenderId: "109827364512",
    appId: "1:109827364512:web:987bc6543de21a"
};

const STORAGE_KEYS = {
    FIREBASE_CONFIG: 'classessentials_firebase_custom_config_v1',
    CLOUD_CACHE: 'classessentials_cloud_announcements_cache_v1',
    LOCAL_ANNOUNCEMENTS: 'classessentials_local_announcements_v1'
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
     * Obtiene la configuración de Firebase activa (personalizada en localStorage o por defecto)
     */
    getConfig() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.FIREBASE_CONFIG);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn("No se pudo leer la configuración personalizada de Firebase:", e);
        }
        return DEFAULT_FIREBASE_CONFIG;
    }

    /**
     * Guarda una nueva configuración de Firebase introducida por el dueño
     */
    saveConfig(configObj) {
        try {
            localStorage.setItem(STORAGE_KEYS.FIREBASE_CONFIG, JSON.stringify(configObj));
            return true;
        } catch (e) {
            console.error("Error al guardar configuración de Firebase:", e);
            return false;
        }
    }

    /**
     * Inicializa la conexión con Firebase Firestore
     */
    async init(onUpdateCallback) {
        if (onUpdateCallback) {
            this.subscribers.push(onUpdateCallback);
        }

        const config = this.getConfig();

        // Intentar conectar con Firebase Firestore dinámicamente si hay credenciales válidas
        if (config && config.projectId && !config.projectId.includes("IES-LAS-ENCINAS")) {
            try {
                const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
                const { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");

                const app = initializeApp(config);
                this.db = getFirestore(app);
                this.isCloudConnected = true;

                // Escuchar cambios en tiempo real en la colección "announcements"
                const q = query(collection(this.db, "announcements"), orderBy("createdAt", "desc"));
                
                onSnapshot(q, (snapshot) => {
                    const cloudPosts = [];
                    snapshot.forEach(docSnap => {
                        cloudPosts.push({
                            id: docSnap.id,
                            ...docSnap.data()
                        });
                    });

                    this.announcements = cloudPosts;
                    this.cacheAnnouncements(cloudPosts);
                    this.notifySubscribers();
                }, (error) => {
                    console.warn("Aviso de Firestore en tiempo real (usando caché / modo híbrido):", error);
                    this.loadFallbackData();
                });

                return true;
            } catch (err) {
                console.warn("No se pudo iniciar Firebase Firestore (usando almacenamiento sincronizado):", err);
                this.isCloudConnected = false;
                this.loadFallbackData();
                return false;
            }
        } else {
            // Modo local / caché sincronizada mientras el dueño introduce sus claves de Firebase
            this.loadFallbackData();
            return false;
        }
    }

    /**
     * Carga datos iniciales combinando los predeterminados con los almacenados
     */
    loadFallbackData() {
        try {
            const cached = localStorage.getItem(STORAGE_KEYS.LOCAL_ANNOUNCEMENTS);
            if (cached) {
                this.announcements = JSON.parse(cached);
            } else {
                this.announcements = [...DEFAULT_ANNOUNCEMENTS];
                this.saveLocalData(this.announcements);
            }
        } catch (e) {
            this.announcements = [...DEFAULT_ANNOUNCEMENTS];
        }
        this.notifySubscribers();
    }

    saveLocalData(posts) {
        try {
            localStorage.setItem(STORAGE_KEYS.LOCAL_ANNOUNCEMENTS, JSON.stringify(posts));
        } catch (e) {
            console.error("Error al guardar datos locales:", e);
        }
    }

    cacheAnnouncements(posts) {
        try {
            localStorage.setItem(STORAGE_KEYS.CLOUD_CACHE, JSON.stringify(posts));
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
     * Publica un nuevo recurso o anuncio (guardado en la nube y visible para todos)
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
                const { collection, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
                await addDoc(collection(this.db, "announcements"), {
                    ...newPost,
                    createdAt: serverTimestamp()
                });
                return { success: true, inCloud: true };
            } catch (err) {
                console.error("Error al guardar en Firestore:", err);
            }
        }

        // Si Firebase aún no está conectado, guardar en la colección activa local
        newPost.id = 'post-' + Date.now();
        this.announcements.unshift(newPost);
        this.saveLocalData(this.announcements);
        this.notifySubscribers();
        return { success: true, inCloud: false };
    }

    /**
     * Elimina un anuncio como dueño / administrador (eliminado de la nube para todos)
     */
    async deleteAnnouncement(postId) {
        if (this.isCloudConnected && this.db) {
            try {
                const { doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
                await deleteDoc(doc(this.db, "announcements", postId));
                return { success: true, inCloud: true };
            } catch (err) {
                console.error("Error al eliminar de Firestore:", err);
            }
        }

        // Eliminación local
        this.announcements = this.announcements.filter(p => p.id !== postId);
        this.saveLocalData(this.announcements);
        this.notifySubscribers();
        return { success: true, inCloud: false };
    }

    /**
     * Restaura los anuncios oficiales originales
     */
    restoreDefaults() {
        this.announcements = [...DEFAULT_ANNOUNCEMENTS];
        this.saveLocalData(this.announcements);
        this.notifySubscribers();
    }
}

export const CloudDB = new CloudDatabaseService();
