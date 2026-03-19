import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Local development ke liye .env.local load karega, 
// Production (Railway) par ye fail nahi hoga agar file missing ho.
dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Supabase Clients ─────────────────────────────────────────
// Railway Variables tab mein ye keys honi chahiye
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables in Railway Settings!');
  // Production mein crash na ho isliye exit tabhi karein jab environment variables bilkul na hon
  if (process.env.NODE_ENV === 'production') process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '');
const supabasePublic = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

// ─── Auth Middleware ──────────────────────────────────────────
async function requireAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Login required.' });
  }

  const token = authHeader.split(' ')[1];
  const { data, error } = await supabasePublic.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: 'Invalid token.' });
  }

  (req as any).user = data.user;
  next();
}

// ─── Server ───────────────────────────────────────────────────
async function startServer() {
  const app = express();
  
  // Railway defaults to 8080, but will provide the PORT variable
  const PORT = Number(process.env.PORT) || 8080;

  app.use(express.json({ limit: '5mb' }));

  // --- Auth Routes ---
  app.get('/auth/google', async (req, res) => {
    const origin = req.headers.origin || `http://localhost:${PORT}`;
    const { data, error } = await supabasePublic.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
        skipBrowserRedirect: true,
      },
    });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ url: data.url });
  });

  app.get('/auth/me', requireAuth, (req, res) => {
    const user = (req as any).user;
    res.json({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name,
      avatar: user.user_metadata?.avatar_url,
    });
  });

  // --- Card Routes ---
  app.get('/api/profiles/:identifier', async (req, res) => {
    try {
      const { identifier } = req.params;
      let { data, error } = await supabaseAdmin.from('cards').select('*').eq('slug', identifier).single();
      if (!data) {
        ({ data, error } = await supabaseAdmin.from('cards').select('*').eq('id', identifier).single());
      }
      if (!data) return res.status(404).json({ error: 'Profile not found' });
      res.json(data.profile_data);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  app.get('/api/profiles/me/card', requireAuth, async (req, res) => {
    const user = (req as any).user;
    const { data } = await supabaseAdmin.from('cards').select('*').eq('user_id', user.id).single();
    if (!data) return res.status(404).json({ error: 'Card not found' });
    res.json(data.profile_data);
  });

  app.post('/api/profiles', requireAuth, async (req, res) => {
    const user = (req as any).user;
    try {
      const profileData = req.body;
      const slug = profileData.slug?.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-') || null;

      if (slug) {
        const { data: existing } = await supabaseAdmin.from('cards').select('user_id').eq('slug', slug).single();
        if (existing && existing.user_id !== user.id) {
          return res.status(400).json({ error: 'Slug already taken.' });
        }
      }

      const { data: existingCard } = await supabaseAdmin.from('cards').select('id').eq('user_id', user.id).single();

      if (existingCard) {
        const { data, error } = await supabaseAdmin.from('cards').update({
          slug, profile_data: profileData, updated_at: new Date().toISOString()
        }).eq('user_id', user.id).select().single();
        if (error) throw error;
        return res.json(data);
      } else {
        const { data, error } = await supabaseAdmin.from('cards').insert({
          user_id: user.id, slug, profile_data: { ...profileData, email: user.email }
        }).select().single();
        if (error) throw error;
        return res.json(data);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Vite / Static ──────────────────────────────────────────
  // ── Vite / Static ──────────────────────────────────────────
  const distPath = path.join(process.cwd(), 'dist');

  if (process.env.NODE_ENV === 'production') {
    // Railway par 'dist' folder serve karega
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'index.html'));
    });
  }

  // CRITICAL FIX: Bind to 0.0.0.0 for Railway
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is live on port ${PORT}`);
  });
}

startServer();
