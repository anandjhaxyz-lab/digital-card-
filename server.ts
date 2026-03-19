import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Supabase Clients ─────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables. Check .env.local');
  process.exit(1);
}

// Admin client — bypasses RLS (only used server-side)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Public client — used to verify user JWT tokens
const supabasePublic = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Auth Middleware ──────────────────────────────────────────
async function requireAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Login karo pehle. Authorization header missing.' });
  }

  const token = authHeader.split(' ')[1];
  const { data, error } = await supabasePublic.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: 'Invalid token. Please login again.' });
  }

  (req as any).user = data.user;
  next();
}

// ─── Server ───────────────────────────────────────────────────
async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: '5mb' }));

  // ── Auth Routes ────────────────────────────────────────────

  // GET /auth/google — Returns Google OAuth URL for frontend to redirect to
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

  // GET /auth/me — Returns current user info from JWT
  app.get('/auth/me', requireAuth, (req, res) => {
    const user = (req as any).user;
    res.json({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name,
      avatar: user.user_metadata?.avatar_url,
    });
  });

  // ── Card Routes ────────────────────────────────────────────

  // GET /api/profiles/:identifier — Public: get card by id or slug
  app.get('/api/profiles/:identifier', async (req, res) => {
    try {
      const { identifier } = req.params;

      // Try by slug first
      let { data, error } = await supabaseAdmin
        .from('cards')
        .select('*')
        .eq('slug', identifier)
        .single();

      // If not found, try by id
      if (!data) {
        ({ data, error } = await supabaseAdmin
          .from('cards')
          .select('*')
          .eq('id', identifier)
          .single());
      }

      if (!data) return res.status(404).json({ error: 'Profile not found' });

      res.json(data.profile_data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  // GET /api/profiles/me/card — Auth: get my own card
  app.get('/api/profiles/me/card', requireAuth, async (req, res) => {
    const user = (req as any).user;
    try {
      const { data, error } = await supabaseAdmin
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!data) return res.status(404).json({ error: 'Card not found. Please create one.' });
      res.json(data.profile_data);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch your card' });
    }
  });

  // POST /api/profiles — Auth: create or update MY card only
  app.post('/api/profiles', requireAuth, async (req, res) => {
    const user = (req as any).user;
    try {
      const profileData = req.body;
      const slug = profileData.slug?.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-') || null;

      // Check if slug is taken by ANOTHER user
      if (slug) {
        const { data: existing } = await supabaseAdmin
          .from('cards')
          .select('user_id')
          .eq('slug', slug)
          .single();

        if (existing && existing.user_id !== user.id) {
          return res.status(400).json({ error: 'Yeh custom link pehle se liya hua hai.' });
        }
      }

      // Check if user already has a card
      const { data: existingCard } = await supabaseAdmin
        .from('cards')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingCard) {
        // UPDATE existing card (user can only update their own)
        const { data, error } = await supabaseAdmin
          .from('cards')
          .update({
            slug,
            profile_data: profileData,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id) // ← ownership enforced here
          .select()
          .single();

        if (error) throw error;
        return res.json({ id: data.id, slug: data.slug });
      } else {
        // INSERT new card
        const { data, error } = await supabaseAdmin
          .from('cards')
          .insert({
            user_id: user.id,
            slug,
            profile_data: {
              ...profileData,
              email: profileData.email || user.email, // auto-fill from Google
            },
          })
          .select()
          .single();

        if (error) throw error;
        return res.json({ id: data.id, slug: data.slug });
      }
    } catch (err: any) {
      console.error('Error saving profile:', err);
      res.status(500).json({ error: err.message || 'Failed to save profile' });
    }
  });

  // DELETE /api/profiles/me — Auth: delete my card only
  app.delete('/api/profiles/me', requireAuth, async (req, res) => {
    const user = (req as any).user;
    try {
      await supabaseAdmin
        .from('cards')
        .delete()
        .eq('user_id', user.id); // ← only deletes user's own card

      res.json({ message: 'Card deleted successfully.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete card' });
    }
  });

  // ── Vite / Static ──────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
  }

  app.get('*', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      res.sendFile(path.join(__dirname, 'dist/index.html'));
    } else {
      res.sendFile(path.join(__dirname, 'index.html'));
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`🔐 Google Auth: enabled via Supabase`);
    console.log(`🛡️  Ownership protection: enabled`);
  });
}

startServer();
