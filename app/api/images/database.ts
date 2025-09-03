import { ImageRecord, ImageSearchParams } from './types';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const IMAGES_DIR = path.join(DATA_DIR, 'images');
const METADATA_FILE = path.join(DATA_DIR, 'metadata.json');

// Assicurarsi che le directory esistano
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

export class ImageDatabase {
  private static loadMetadata(): ImageRecord[] {
    try {
      if (!fs.existsSync(METADATA_FILE)) {
        return [];
      }
      const data = fs.readFileSync(METADATA_FILE, 'utf8');
      const parsed = JSON.parse(data);
      return parsed.map((item: any) => ({
        ...item,
        uploadDate: new Date(item.uploadDate)
      }));
    } catch (error) {
      console.log('Error loading metadata:', error);
      return [];
    }
  }

  private static saveMetadata(records: ImageRecord[]): void {
    try {
      fs.writeFileSync(METADATA_FILE, JSON.stringify(records, null, 2));
    } catch (error) {
      console.log('Error saving metadata:', error);
    }
  }

  static async saveImage(record: Omit<ImageRecord, 'id'>): Promise<string> {
    const id = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const imagePath = path.join(IMAGES_DIR, `${id}.bin`);
    
    // Salva l'immagine sul file system
    fs.writeFileSync(imagePath, record.buffer);
    
    // Salva i metadati
    const metadata = this.loadMetadata();
    const imageRecord: ImageRecord = {
      ...record,
      id,
      buffer: Buffer.from([]) // Non salvare il buffer nei metadati
    };
    metadata.push(imageRecord);
    this.saveMetadata(metadata);
    
    console.log(`Image saved with ID: ${id}`);
    return id;
  }

  static async searchImages(params: ImageSearchParams): Promise<ImageRecord[]> {
    const metadata = this.loadMetadata();
    let results = metadata;

    // Filtra per tag se specificati
    if (params.tags && params.tags.length > 0) {
      results = results.filter(record => 
        params.tags!.some(tag => 
          record.tags.some(recordTag => 
            recordTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
    }

    // Ordinamento per data di upload (più recenti prima)
    results.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

    // Paginazione
    const offset = params.offset || 0;
    const limit = params.limit || 50;
    results = results.slice(offset, offset + limit);

    console.log(`Found ${results.length} images matching search criteria`);
    return results;
  }

  static async getImage(id: string): Promise<ImageRecord | null> {
    const metadata = this.loadMetadata();
    const record = metadata.find(r => r.id === id);
    
    if (!record) {
      console.log(`Image not found: ${id}`);
      return null;
    }

    // Carica il buffer dell'immagine
    const imagePath = path.join(IMAGES_DIR, `${id}.bin`);
    if (!fs.existsSync(imagePath)) {
      console.log(`Image file not found: ${imagePath}`);
      return null;
    }

    const buffer = fs.readFileSync(imagePath);
    return {
      ...record,
      buffer
    };
  }

static async deleteImage(id: string) {
  const imagePath = path.join(IMAGES_DIR, `${id}.bin`);
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }

  const metadata = this.loadMetadata();
  const updated = metadata.filter(r => r.id !== id);
  this.saveMetadata(updated);
}

static async updateImageTags(id: string, tags: string[]) {
  const metadata = this.loadMetadata();
  const record = metadata.find(r => r.id === id);
  if (!record) throw new Error('Immagine non trovata');
  record.tags = tags;
  this.saveMetadata(metadata);
}

static async removeTagGlobally(tag: string) {
  const metadata = this.loadMetadata();
  for (const record of metadata) {
    record.tags = record.tags.filter(t => t !== tag);
  }
  this.saveMetadata(metadata);
}

static async renameTagGlobally(oldTag: string, newTag: string) {
  const metadata = this.loadMetadata();
  for (const record of metadata) {
    record.tags = record.tags.map(t => (t === oldTag ? newTag : t));
  }
  this.saveMetadata(metadata);
}

  static async getAllTags(): Promise<string[]> {
    const metadata = this.loadMetadata();
    const allTags = metadata.flatMap(record => record.tags);
    const uniqueTags = Array.from(new Set(allTags));
    return uniqueTags.sort();
  }
}