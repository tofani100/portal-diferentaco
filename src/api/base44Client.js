// Standalone Base44-compatible client with Firebase Firestore Cloud Sync + Local Offline Fallback
import eventInitial from './data/Event.json';
import photoInitial from './data/Photo.json';
import fanPhotoInitial from './data/FanPhoto.json';
import partnerInitial from './data/Partner.json';
import mapPinInitial from './data/MapPin.json';
import videoInitial from './data/Video.json';
import contactRequestInitial from './data/ContactRequest.json';
import siteConfigInitial from './data/SiteConfig.json';
import featuredTrackInitial from './data/FeaturedTrack.json';
import newsletterSubscriberInitial from './data/NewsletterSubscriber.json';
import testimonialInitial from './data/Testimonial.json';
import pollInitial from './data/Poll.json';
import pollVoteInitial from './data/PollVote.json';
import userInitial from './data/User.json';
import { idbGet, idbSet } from './indexedDbStorage';
import { compressImage } from '@/utils/imageOptimizer';
import { APP_VERSION } from '@/version';
import { db } from './firebaseClient';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';

const INITIAL_DATA = {
  Event: eventInitial,
  Photo: photoInitial,
  FanPhoto: fanPhotoInitial,
  Partner: partnerInitial,
  MapPin: mapPinInitial,
  Video: videoInitial,
  ContactRequest: contactRequestInitial,
  SiteConfig: siteConfigInitial,
  FeaturedTrack: featuredTrackInitial,
  NewsletterSubscriber: newsletterSubscriberInitial,
  Testimonial: testimonialInitial,
  Poll: pollInitial,
  PollVote: pollVoteInitial,
  User: userInitial,
};

const isProd = import.meta.env.VITE_APP_ENV === 'production';
const FIRESTORE_PREFIX = isProd ? 'prod_' : 'dev_';
const STORAGE_PREFIX = import.meta.env.VITE_STORAGE_PREFIX || 'portal_diferentaco_db_dev_';
const MEMORY_CACHE = {};

// Helper: Seed Firestore collection with initial data if collection is empty
const seededCollections = new Set();
async function seedFirestoreEntity(entity) {
  if (seededCollections.has(entity)) return;
  seededCollections.add(entity);

  try {
    const items = INITIAL_DATA[entity];
    if (!items || !Array.isArray(items) || items.length === 0) return;

    console.log(`[Firestore] Seeding ${FIRESTORE_PREFIX}${entity} with initial dataset...`);
    const batch = writeBatch(db);
    // Firestore batches limit to 500 operations
    const toSeed = items.slice(0, 50);
    toSeed.forEach(item => {
      const docId = item.id || generateId();
      const docRef = doc(db, `${FIRESTORE_PREFIX}${entity}`, docId);
      batch.set(docRef, { ...item, id: docId }, { merge: true });
    });
    await batch.commit();
    console.log(`[Firestore] Successfully seeded ${toSeed.length} items in ${FIRESTORE_PREFIX}${entity}`);
  } catch (err) {
    console.warn(`[Firestore] Note on seeding ${entity}:`, err?.message || err);
  }
}

// Subscribe each entity to Firestore in real time
function initFirestoreSync(entity) {
  if (typeof window === 'undefined') return;
  try {
    const colRef = collection(db, `${FIRESTORE_PREFIX}${entity}`);
    onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const cloudItems = [];
        snapshot.forEach(docSnap => {
          cloudItems.push({ id: docSnap.id, ...docSnap.data() });
        });

        MEMORY_CACHE[entity] = cloudItems;
        idbSet(`${STORAGE_PREFIX}${entity}`, cloudItems).catch(() => {});
        try {
          localStorage.setItem(`${STORAGE_PREFIX}${entity}`, JSON.stringify(cloudItems));
        } catch (e) {}

        window.dispatchEvent(new CustomEvent('databaseHydrated', { detail: { entity, items: cloudItems } }));
      } else {
        // If empty in Firestore, seed it once with the initial bundle
        seedFirestoreEntity(entity);
      }
    }, (error) => {
      console.warn(`[Firestore] Realtime sync listener warning on ${entity}:`, error?.message || error);
    });
  } catch (e) {
    console.warn(`[Firestore] Sync init warning for ${entity}:`, e);
  }
}

// Asynchronously hydrate MEMORY_CACHE from IndexedDB (or localStorage fallback) + Auto-Migrate Stale Cache
if (typeof window !== 'undefined') {
  try {
    const currentVersionKey = `${STORAGE_PREFIX}app_version`;
    const storedVersion = localStorage.getItem(currentVersionKey);

    // If upgrading to a new version (e.g. V17) or old cached photo/events detected, refresh to fresh snapshot
    if (storedVersion !== APP_VERSION) {
      console.log(`[Base44] Version change detected (${storedVersion} -> ${APP_VERSION}). Refreshing local storage caches...`);
      localStorage.setItem(currentVersionKey, APP_VERSION);
      // Clean up stale configs from previous iterations
      Object.keys(INITIAL_DATA).forEach((entity) => {
        const fresh = JSON.parse(JSON.stringify(INITIAL_DATA[entity]));
        MEMORY_CACHE[entity] = fresh;
        try {
          localStorage.setItem(`${STORAGE_PREFIX}${entity}`, JSON.stringify(fresh));
        } catch (e) {}
        idbSet(`${STORAGE_PREFIX}${entity}`, fresh).catch(() => {});
      });
    }

    // Clean old deleted banner if still residing in storage
    const rawSiteConfig = localStorage.getItem(`${STORAGE_PREFIX}SiteConfig`);
    if (rawSiteConfig) {
      const parsedConfig = JSON.parse(rawSiteConfig);
      const configStr = JSON.stringify(parsedConfig);
      if (configStr.includes('porteamar.jpg') || !parsedConfig[0]?.hero_media_items?.[0]?.mobile_url) {
        const freshConfig = JSON.parse(JSON.stringify(siteConfigInitial));
        MEMORY_CACHE['SiteConfig'] = freshConfig;
        localStorage.setItem(`${STORAGE_PREFIX}SiteConfig`, JSON.stringify(freshConfig));
        idbSet(`${STORAGE_PREFIX}SiteConfig`, freshConfig);
      }
    }
  } catch (e) {
    console.warn('[Base44] Migration warning:', e);
  }

  // 1. Initial fast synchronous hydration from localStorage/InitialData
  Object.keys(INITIAL_DATA).forEach((entity) => {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${entity}`);
      if (raw) {
        MEMORY_CACHE[entity] = JSON.parse(raw);
      } else {
        MEMORY_CACHE[entity] = JSON.parse(JSON.stringify(INITIAL_DATA[entity]));
      }
    } catch (e) {
      MEMORY_CACHE[entity] = JSON.parse(JSON.stringify(INITIAL_DATA[entity]));
    }

    // 2. Hydrate from IndexedDB for large datasets
    idbGet(`${STORAGE_PREFIX}${entity}`).then((idbData) => {
      if (idbData && Array.isArray(idbData) && idbData.length > 0) {
        if (entity === 'SiteConfig' && JSON.stringify(idbData).includes('porteamar.jpg')) {
          idbSet(`${STORAGE_PREFIX}SiteConfig`, siteConfigInitial);
          MEMORY_CACHE['SiteConfig'] = siteConfigInitial;
          return;
        }
        MEMORY_CACHE[entity] = idbData;
        window.dispatchEvent(new CustomEvent('databaseHydrated', { detail: { entity } }));
      }
    }).catch(() => {});

    // 3. Connect real-time Firestore sync
    initFirestoreSync(entity);
  });
}

export function getEnvironmentInfo() {
  const env = import.meta.env.VITE_APP_ENV || 'development';
  return {
    env,
    name: import.meta.env.VITE_APP_NAME || 'Portal Diferentaço (DEV)',
    prefix: STORAGE_PREFIX,
    firestorePrefix: FIRESTORE_PREFIX,
    isDev: env === 'development',
    prodUrl: import.meta.env.VITE_PROD_URL || 'https://victorefranco.com.br',
    showBadge: import.meta.env.VITE_SHOW_ENV_BADGE === 'true' || env === 'development'
  };
}

export async function resetToProductionSnapshot() {
  try {
    for (const entity of Object.keys(INITIAL_DATA)) {
      const clone = JSON.parse(JSON.stringify(INITIAL_DATA[entity]));
      MEMORY_CACHE[entity] = clone;
      await idbSet(`${STORAGE_PREFIX}${entity}`, clone);
      try {
        localStorage.setItem(`${STORAGE_PREFIX}${entity}`, JSON.stringify(clone));
      } catch (e) {}

      // Reseed Firestore with clean clone
      try {
        const batch = writeBatch(db);
        clone.slice(0, 50).forEach(item => {
          const docId = item.id || generateId();
          batch.set(doc(db, `${FIRESTORE_PREFIX}${entity}`, docId), { ...item, id: docId });
        });
        await batch.commit();
      } catch (err) {}
    }
    window.dispatchEvent(new CustomEvent('databaseReset'));
    return true;
  } catch (e) {
    console.error('Error resetting database:', e);
    return false;
  }
}

export function exportCurrentData() {
  const data = {};
  Object.keys(INITIAL_DATA).forEach(entity => {
    data[entity] = getStorage(entity);
  });
  return data;
}

function getStorage(entity) {
  if (MEMORY_CACHE[entity]) {
    return MEMORY_CACHE[entity];
  }
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${entity}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      MEMORY_CACHE[entity] = parsed;
      return parsed;
    }
  } catch (e) {
    console.error(`Error reading ${entity} from localStorage:`, e);
  }
  const initial = INITIAL_DATA[entity] || [];
  const cloned = JSON.parse(JSON.stringify(initial));
  MEMORY_CACHE[entity] = cloned;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${entity}`, JSON.stringify(cloned));
  } catch (e) {}
  return cloned;
}

function setStorage(entity, data) {
  // 1. Immediately update synchronous in-memory cache
  MEMORY_CACHE[entity] = data;

  // 2. Persist to IndexedDB (asynchronous, practically unlimited quota)
  idbSet(`${STORAGE_PREFIX}${entity}`, data).catch(err => {
    console.error(`[IndexedDB] Error persisting ${entity}:`, err);
  });

  // 3. Persist to localStorage (as backup)
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${entity}`, JSON.stringify(data));
  } catch (e) {
    console.warn(`[LocalStorage] Quota reached for ${entity}; safely saved in IndexedDB.`);
  }

  // 4. Dispatch hydration event
  window.dispatchEvent(new CustomEvent('databaseHydrated', { detail: { entity, items: data } }));
}

function generateId() {
  const chars = '0123456789abcdef';
  let id = '';
  for (let i = 0; i < 24; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function sortRecords(records, sortBy) {
  if (!sortBy) return records;
  const isDesc = sortBy.startsWith('-');
  const field = isDesc ? sortBy.slice(1) : sortBy;

  return [...records].sort((a, b) => {
    let valA = a[field];
    let valB = b[field];

    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;

    if (typeof valA === 'number' && typeof valB === 'number') {
      return isDesc ? valB - valA : valA - valB;
    }

    const strA = String(valA);
    const strB = String(valB);
    return isDesc ? strB.localeCompare(strA) : strA.localeCompare(strB);
  });
}

function matchesQuery(record, query) {
  if (!query) return true;
  for (const [key, val] of Object.entries(query)) {
    if (val === undefined) continue;
    if (typeof val === 'boolean') {
      const recVal = Boolean(record[key]);
      if (recVal !== val) return false;
      continue;
    }
    if (record[key] !== val) return false;
  }
  return true;
}

function createEntityHandlers(entityName) {
  return {
    async list(sortBy, limit) {
      let records = getStorage(entityName);
      if (sortBy) records = sortRecords(records, sortBy);
      if (typeof limit === 'number' && limit > 0) records = records.slice(0, limit);
      return records;
    },

    async filter(query, sortBy, limit) {
      let records = getStorage(entityName);
      records = records.filter(item => matchesQuery(item, query));
      if (sortBy) records = sortRecords(records, sortBy);
      if (typeof limit === 'number' && limit > 0) records = records.slice(0, limit);
      return records;
    },

    async get(id) {
      const records = getStorage(entityName);
      const found = records.find(r => r.id === id);
      if (!found) throw new Error(`Record ${id} not found in ${entityName}`);
      return found;
    },

    async create(data) {
      const records = getStorage(entityName);
      const defaults = {
        visible: true,
      };
      if (entityName === 'FanPhoto') {
        defaults.approved = false;
      }
      const newRecord = {
        ...defaults,
        ...data,
        id: data.id || generateId(),
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
        created_by_id: '6906ca5e85d3d7007a37ecf1',
        created_by: 'tofani100@gmail.com'
      };

      // 1. Immediately update local storage and memory
      records.unshift(newRecord);
      setStorage(entityName, records);

      // 2. Sync to Firestore in cloud
      try {
        const docRef = doc(db, `${FIRESTORE_PREFIX}${entityName}`, newRecord.id);
        await setDoc(docRef, newRecord);
      } catch (err) {
        console.warn(`[Firestore] Sync warning creating ${entityName}:`, err?.message || err);
      }

      return newRecord;
    },

    async update(id, data) {
      const records = getStorage(entityName);
      const idx = records.findIndex(r => r.id === id);
      if (idx === -1) {
        return this.create({ ...data, id });
      }
      const updated = {
        ...records[idx],
        ...data,
        id,
        updated_date: new Date().toISOString()
      };

      // 1. Update local storage and memory
      records[idx] = updated;
      setStorage(entityName, records);

      // 2. Sync to Firestore in cloud
      try {
        const docRef = doc(db, `${FIRESTORE_PREFIX}${entityName}`, id);
        await setDoc(docRef, updated, { merge: true });
      } catch (err) {
        console.warn(`[Firestore] Sync warning updating ${entityName}:`, err?.message || err);
      }

      return updated;
    },

    async delete(id) {
      let records = getStorage(entityName);
      records = records.filter(r => r.id !== id);
      setStorage(entityName, records);

      // Sync to Firestore in cloud
      try {
        const docRef = doc(db, `${FIRESTORE_PREFIX}${entityName}`, id);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn(`[Firestore] Sync warning deleting ${entityName}:`, err?.message || err);
      }

      return { success: true, id };
    },

    async deleteMany(query) {
      let records = getStorage(entityName);
      const toDelete = records.filter(item => matchesQuery(item, query));
      records = records.filter(item => !matchesQuery(item, query));
      setStorage(entityName, records);

      // Sync deletes to Firestore
      try {
        const batch = writeBatch(db);
        toDelete.forEach(item => {
          batch.delete(doc(db, `${FIRESTORE_PREFIX}${entityName}`, item.id));
        });
        await batch.commit();
      } catch (err) {
        console.warn(`[Firestore] Sync warning in deleteMany ${entityName}:`, err?.message || err);
      }

      return { success: true };
    },

    async bulkCreate(items) {
      const records = getStorage(entityName);
      const created = items.map(item => ({
        visible: true,
        ...item,
        id: item.id || generateId(),
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString()
      }));
      records.unshift(...created);
      setStorage(entityName, records);

      // Sync bulk to Firestore
      try {
        const batch = writeBatch(db);
        created.forEach(item => {
          batch.set(doc(db, `${FIRESTORE_PREFIX}${entityName}`, item.id), item);
        });
        await batch.commit();
      } catch (err) {
        console.warn(`[Firestore] Sync warning bulkCreate ${entityName}:`, err?.message || err);
      }

      return created;
    }
  };
}

export const base44 = {
  auth: {
    async me() {
      try {
        const stored = localStorage.getItem('portal_diferentaco_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.email) return parsed;
        }
      } catch (e) {}
      // Visitantes comuns iniciam deslogados por padrão (sem privilégios administrativos)
      return null;
    },

    async login(email, password) {
      const adminUser = {
        id: '6906ca5e85d3d7007a37ecf1',
        email: email || 'tofani100@gmail.com',
        full_name: 'Victor e Franco (Admin)',
        role: 'admin'
      };
      localStorage.setItem('portal_diferentaco_user', JSON.stringify(adminUser));
      window.dispatchEvent(new CustomEvent('authChanged', { detail: { user: adminUser } }));
      return adminUser;
    },

    redirectToLogin(redirectUrl) {
      window.dispatchEvent(new CustomEvent('openLoginModal', { detail: { redirectUrl } }));
    },

    async logout() {
      localStorage.removeItem('portal_diferentaco_user');
      window.dispatchEvent(new CustomEvent('authChanged', { detail: { user: null } }));
      window.location.reload();
    }
  },

  entities: {
    Event: createEntityHandlers('Event'),
    Photo: createEntityHandlers('Photo'),
    FanPhoto: createEntityHandlers('FanPhoto'),
    Partner: createEntityHandlers('Partner'),
    MapPin: createEntityHandlers('MapPin'),
    Video: createEntityHandlers('Video'),
    ContactRequest: createEntityHandlers('ContactRequest'),
    SiteConfig: createEntityHandlers('SiteConfig'),
    FeaturedTrack: createEntityHandlers('FeaturedTrack'),
    NewsletterSubscriber: createEntityHandlers('NewsletterSubscriber'),
    Testimonial: createEntityHandlers('Testimonial'),
    Poll: createEntityHandlers('Poll'),
    PollVote: createEntityHandlers('PollVote'),
    User: createEntityHandlers('User'),
  },

  env: getEnvironmentInfo(),
  resetToProductionSnapshot,
  exportCurrentData,

  integrations: {
    Core: {
      async UploadFile({ file, options }) {
        if (file && file.type && file.type.startsWith('image/')) {
          return await compressImage(file, options);
        }

        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              file_url: reader.result,
              originalSize: file.size,
              optimizedSize: file.size,
              savedPercent: 0
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
    }
  }
};
