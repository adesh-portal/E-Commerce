import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FileDatabase {
  constructor() {
    this.dataDir = path.join(__dirname, '..', 'data');
    this.ensureDataDir();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  getFilePath(collection) {
    return path.join(this.dataDir, `${collection}.json`);
  }

  list(collection) {
    try {
      const filePath = this.getFilePath(collection);
      if (!fs.existsSync(filePath)) {
        return [];
      }
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${collection}:`, error);
      return [];
    }
  }

  insert(collection, data) {
    try {
      const items = this.list(collection);
      const newItem = {
        ...data,
        _id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      items.push(newItem);
      this.save(collection, items);
      return newItem;
    } catch (error) {
      console.error(`Error inserting into ${collection}:`, error);
      throw error;
    }
  }

  getById(collection, id) {
    const items = this.list(collection);
    return items.find(item => item._id === id);
  }

  update(collection, id, data) {
    try {
      const items = this.list(collection);
      const index = items.findIndex(item => item._id === id);
      
      if (index === -1) {
        return null;
      }

      items[index] = {
        ...items[index],
        ...data,
        updatedAt: new Date().toISOString()
      };

      this.save(collection, items);
      return items[index];
    } catch (error) {
      console.error(`Error updating ${collection}:`, error);
      throw error;
    }
  }

  // Update by id (alias for update) to match routes' expectations
  updateById(collection, id, data) {
    return this.update(collection, id, data);
  }

  delete(collection, id) {
    try {
      const items = this.list(collection);
      const filteredItems = items.filter(item => item._id !== id);
      
      if (items.length === filteredItems.length) {
        return false; // Item not found
      }

      this.save(collection, filteredItems);
      return true;
    } catch (error) {
      console.error(`Error deleting from ${collection}:`, error);
      throw error;
    }
  }

  // Delete by id (alias for delete) to match routes' expectations
  deleteById(collection, id) {
    return this.delete(collection, id);
  }

  // Increment numeric fields by id (adds field if missing)
  incById(collection, id, increments) {
    try {
      const items = this.list(collection);
      const index = items.findIndex(item => item._id === id);
      if (index === -1) return null;

      const current = { ...items[index] };
      Object.entries(increments || {}).forEach(([key, delta]) => {
        const currentValue = Number(current[key] || 0);
        const incValue = Number(delta || 0);
        current[key] = currentValue + incValue;
      });
      current.updatedAt = new Date().toISOString();

      items[index] = current;
      this.save(collection, items);
      return current;
    } catch (error) {
      console.error(`Error incrementing in ${collection}:`, error);
      throw error;
    }
  }

  save(collection, data) {
    try {
      const filePath = this.getFilePath(collection);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error(`Error saving ${collection}:`, error);
      throw error;
    }
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}

// Text matching utility function
// Supports two forms:
// 1) textMatchAny(text, searchTerms)
// 2) textMatchAny(object, fieldNames[], query)
export function textMatchAny(subject, fieldsOrTerms, maybeQuery) {
  if (subject == null || fieldsOrTerms == null) return false;

  // Form 2: object + fields + query
  if (Array.isArray(fieldsOrTerms) && typeof maybeQuery !== 'undefined') {
    const obj = subject || {};
    const query = String(maybeQuery).toLowerCase();
    if (!query) return false;
    return fieldsOrTerms.some((fieldName) => {
      const value = obj && Object.prototype.hasOwnProperty.call(obj, fieldName)
        ? obj[fieldName]
        : undefined;
      if (value == null) return false;
      return String(value).toLowerCase().includes(query);
    });
  }

  // Form 1: simple text + terms
  const textLower = String(subject).toLowerCase();
  const terms = Array.isArray(fieldsOrTerms) ? fieldsOrTerms : [fieldsOrTerms];
  return terms.some(term => textLower.includes(String(term).toLowerCase()));
}

// Export as named export to match the import
export const FileDB = new FileDatabase();

// Also export as default for flexibility
export default FileDB;