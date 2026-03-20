import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import PreviewCard from './components/PreviewCard';
import EditForm from './components/EditForm';
import { Edit3, Eye, LogOut } from 'lucide-react';
import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';

const defaultProfile: UserProfile = {
  name: '',
  title: '',
  company: '',
  bio: '',
  email: '',
  phone: '',
  whatsapp: '',
  website: '',
  address: '',
  linkedin: '',
  twitter: '',
  instagram: '',
  youtube: '',
  facebook: '',
  avatarUrl: '',
  coverUrl: '',
  themeColor: '#0ea5e9',
  services: [],
  gallery: []
};

export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const sharedId = urlParams.get('id');
  const isSharedView = urlParams.get('shared') === 'true';

  const path = window.location.pathname.substring(1);
  const slugFromPath = path && !path.includes('/') && !path.startsWith('api') ? path : null;
  const identifier = sharedId || slugFromPath;

  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Auth state check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ✅ Profile load — server se (har device pe same data)
  useEffect(() => {
    async function loadProfile() {
      if (identifier) {
        // Shared/public view — kisi ka bhi card
        try {
          const response = await fetch(`/api/profiles/${identifier}`);
          if (response.ok) {
            const data = await response.json();
            setProfile(data.profile_data || data);
          }
        } catch (e) {
          console.error('Error loading profile:', e);
        } finally {
          setLoading(false);
        }
      } else if (user) {
        // ✅ Logged in — server se apna card lo
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const response = await fetch('/api/profiles/me/card', {
              headers: {
                'Authorization': `Bearer ${session.access_token}`
              }
            });
            if (response.ok) {
              const data = await response.json();
              setProfile(data.profile_data || data);
            }
            // 404 = nayi card, default profile rahega
          }
        } catch (e) {
          console.error('Error loading profile:', e);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadProfile();
    }
  }, [identifier, user, authLoading]); // ✅ user change pe reload

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(defaultProfile);
  };

  // Loading
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Shared View
  if (isSharedView || identifier) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center sm:py-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-300/30 to-indigo-300/30 blur-3xl"></div>
          <div className="absolute top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-pink-300/30 to-orange-300/30 blur-3xl"></div>
        </div>
        <PreviewCard profile={profile} isSharedView={true} />
      </div>
    );
  }

  // Login Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6">
            V
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">VisitCard</h1>
          <p className="text-gray-500 mb-8">Apna Digital Visiting Card banao aur share karo</p>
          
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-700 font-semibold py-4 px-6 rounded-2xl transition-all shadow-sm"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Google se Login Karo
          </button>

          <p className="text-xs text-gray-400 mt-6">
            Free mein shuru karo — koi credit card nahi chahiye
          </p>
        </div>
      </div>
    );
  }

  // Main App
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-900 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none fixed">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-300/30 to-indigo-300/30 blur-3xl"></div>
        <div className="absolute top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-pink-300/30 to-orange-300/30 blur-3xl"></div>
      </div>

      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl">V</div>
              <span className="font-bold text-xl text-gray-900 hidden sm:block">VisitCard</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-1 rounded-xl flex">
                <button
                  onClick={() => setIsEditing(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isEditing ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <Edit3 size={16} />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${!isEditing ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <Eye size={16} />
                  <span className="hidden sm:inline">Preview</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <img
                  src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`}
                  alt="User"
                  className="w-8 h-8 rounded-full border-2 border-blue-200"
                />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          <div className={`w-full lg:w-1/2 transition-all duration-300 ${isEditing ? 'block' : 'hidden lg:block lg:opacity-50 lg:pointer-events-none'}`}>
            <EditForm profile={profile} onChange={setProfile} />
          </div>
          <div className={`w-full lg:w-1/2 flex justify-center sticky top-24 transition-all duration-300 ${!isEditing ? 'block' : 'hidden lg:block'}`}>
            <div className="w-full max-w-md">
              <PreviewCard profile={profile} isSharedView={false} onProfileUpdate={setProfile} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
