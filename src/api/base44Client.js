// Standalone Base44-compatible client
// 100% independent from base44.com - fully persistent in localStorage with fallback to initial data
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

const STORAGE_PREFIX = import.meta.env.VITE_STORAGE_PREFIX || 'portal_diferentaco_db_dev_';

export function getEnvironmentInfo() {
  const env = import.meta.env.VITE_APP_ENV || 'development';
  return {
    env,
    name: import.meta.env.VITE_APP_NAME || 'Portal Diferentaço (DEV)',
    prefix: STORAGE_PREFIX,
    isDev: env === 'development',
    prodUrl: import.meta.env.VITE_PROD_URL || 'https://victorefranco.com.br',
    showBadge: import.meta.env.VITE_SHOW_ENV_BADGE === 'true' || env === 'development'
  };
}

export function resetToProductionSnapshot() {
  try {
    Object.keys(INITIAL_DATA).forEach(entity => {
      localStorage.removeItem(`${STORAGE_PREFIX}${entity}`);
      localStorage.setItem(`${STORAGE_PREFIX}${entity}`, JSON.stringify(INITIAL_DATA[entity]));
    });
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
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${entity}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${entity} from localStorage:`, e);
  }
  const initial = INITIAL_DATA[entity] || [];
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${entity}`, JSON.stringify(initial));
  } catch (e) {}
  return JSON.parse(JSON.stringify(initial));
}

function setStorage(entity, data) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${entity}`, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${entity} to localStorage:`, e);
  }
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

    // Check date or string or number
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
      const newRecord = {
        ...data,
        id: data.id || generateId(),
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
        created_by_id: '6906ca5e85d3d7007a37ecf1',
        created_by: 'tofani100@gmail.com'
      };
      records.unshift(newRecord);
      setStorage(entityName, records);
      return newRecord;
    },

    async update(id, data) {
      const records = getStorage(entityName);
      const idx = records.findIndex(r => r.id === id);
      if (idx === -1) {
        // If updating an unexisting singleton (e.g. SiteConfig)
        return this.create({ ...data, id });
      }
      const updated = {
        ...records[idx],
        ...data,
        id,
        updated_date: new Date().toISOString()
      };
      records[idx] = updated;
      setStorage(entityName, records);
      return updated;
    },

    async delete(id) {
      let records = getStorage(entityName);
      records = records.filter(r => r.id !== id);
      setStorage(entityName, records);
      return { success: true, id };
    },

    async deleteMany(query) {
      let records = getStorage(entityName);
      records = records.filter(item => !matchesQuery(item, query));
      setStorage(entityName, records);
      return { success: true };
    },

    async bulkCreate(items) {
      const records = getStorage(entityName);
      const created = items.map(item => ({
        ...item,
        id: item.id || generateId(),
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString()
      }));
      records.unshift(...created);
      setStorage(entityName, records);
      return created;
    }
  };
}

export const base44 = {
  auth: {
    async me() {
      try {
        const stored = localStorage.getItem('portal_diferentaco_user');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
      // Default to admin user for seamless management if logged in, or null
      return null;
    },

    async login(email, password) {
      // Allow admin login
      const adminUser = {
        id: '6906ca5e85d3d7007a37ecf1',
        email: email || 'tofani100@gmail.com',
        full_name: 'Marcos Tofani',
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
      async UploadFile({ file }) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({ file_url: reader.result });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
    }
  }
};
