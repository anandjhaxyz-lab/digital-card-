import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import { randomBytes } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, 'profiles.db'));

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE,
    data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Migration: Add slug column if it doesn't exist
try {
  db.exec('ALTER TABLE profiles ADD COLUMN slug TEXT');
} catch (e) {
  // Column already exists or other error
}

try {
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_slug ON profiles(slug)');
} catch (e) {
  // Index already exists or other error
}

const insertProfile = db.prepare('INSERT INTO profiles (id, slug, data) VALUES (?, ?, ?)');
const updateProfile = db.prepare('UPDATE profiles SET data = ?, slug = ? WHERE id = ?');
const getProfileById = db.prepare('SELECT data FROM profiles WHERE id = ?');
const getProfileBySlug = db.prepare('SELECT data FROM profiles WHERE slug = ?');

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '5mb' }));

  // API Routes
  app.post('/api/profiles', (req, res) => {
    try {
      const profileData = req.body;
      const id = profileData.id;
      const slug = profileData.slug?.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
      
      // Check if slug is already taken by ANOTHER profile
      if (slug) {
        const existing = db.prepare('SELECT id FROM profiles WHERE slug = ?').get(slug) as { id: string } | undefined;
        if (existing && existing.id !== id) {
          return res.status(400).json({ error: 'This custom link is already taken.' });
        }
      }

      const data = JSON.stringify(profileData);
      
      if (id) {
        // Try to update existing profile
        const existing = db.prepare('SELECT id FROM profiles WHERE id = ?').get(id) as { id: string } | undefined;
        if (existing) {
          updateProfile.run(data, slug || null, id);
          return res.json({ id, slug });
        }
      }

      // Create new profile
      const newId = randomBytes(4).toString('hex');
      insertProfile.run(newId, slug || null, data);
      res.json({ id: newId, slug });
    } catch (error) {
      console.error('Error saving profile:', error);
      res.status(500).json({ error: 'Failed to save profile' });
    }
  });

  app.get('/api/profiles/:identifier', (req, res) => {
    try {
      const identifier = req.params.identifier;
      // Try by slug first, then by ID
      let row = getProfileBySlug.get(identifier) as { data: string } | undefined;
      if (!row) {
        row = getProfileById.get(identifier) as { data: string } | undefined;
      }

      if (row) {
        res.json(JSON.parse(row.data));
      } else {
        res.status(404).json({ error: 'Profile not found' });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
  }

  // Catch-all route to serve the app for vanity URLs
  app.get('*', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      res.sendFile(path.join(__dirname, 'dist/index.html'));
    } else {
      // In dev mode, Vite middleware handles this, but we can explicitly point to index.html if needed
      res.sendFile(path.join(__dirname, 'index.html'));
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
