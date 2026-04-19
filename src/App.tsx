import React, { useState, useEffect, Component } from 'react';
import { UserProfile } from './types';
import PreviewCard from './components/PreviewCard';
import EditForm from './components/EditForm';
import { Edit3, Eye, LogIn, LogOut, Download, User as UserIcon } from 'lucide-react';
import { auth, signInWithGoogle, logOut, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';

const defaultProfile: UserProfile = {
  name: 'Alex Morgan',
  title: 'Senior Product Designer',
  company: 'Design Studio Inc.',
  bio: 'Passionate about creating intuitive and beautiful user experiences. Let\'s build something amazing together.',
  email: 'alex.morgan@example.com',
  phone: '+1 (555) 123-4567',
  whatsapp: '+15551234567',
  website: 'https://alexmorgan.design',
  address: 'San Francisco, CA',
  linkedin: 'https://linkedin.com/in/alexmorgan',
  twitter: 'https://twitter.com/alexmorgan',
  instagram: 'https://instagram.com/alexmorgan',
  youtube: 'https://youtube.com/c/alexmorgan',
  facebook: 'https://facebook.com/alexmorgan',
  avatarUrl: '',
  coverUrl: '',
  themeColor: '#0ea5e9', // Sky blue
  services: [
    {
      id: '1',
      title: 'UI/UX Design',
      description: 'Complete user interface and experience design for web and mobile applications.',
      price: '$150/hr',
      imageUrl: 'https://picsum.photos/seed/design/400/300'
    },
    {
      id: '2',
      title: 'Brand Identity',
      description: 'Logo design, color palettes, and comprehensive brand guidelines.',
      price: '$2000',
      imageUrl: 'https://picsum.photos/seed/brand/400/300'
    }
  ],
  gallery: [
    { id: '1', url: 'https://picsum.photos/seed/g1/800/600', type: 'image' },
    { id: '2', url: 'https://picsum.photos/seed/g2/800/600', type: 'image' },
    { id: '3', url: 'https://picsum.photos/seed/g3/800/600', type: 'image' },
  ]
};

const emptyProfile: UserProfile = {
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

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.error.message);
        if (parsed.error) errorMessage = parsed.error;
      } catch (e) {}

      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied or Error</h2>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const urlParams = new URLSearchParams(window.location.search);
  const sharedId = urlParams.get('id');
  const isSharedView = urlParams.get('shared') === 'true' || (!!window.location.pathname.substring(1) && !window.location.pathname.startsWith('/api'));
  
  // Detect slug from path (e.g., /TheNationalTailors)
  const path = window.location.pathname.substring(1);
  const slugFromPath = path && !path.includes('/') && !path.startsWith('api') ? path : null;
  const identifier = sharedId || slugFromPath;

  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  
  // Default to Preview mode (isEditing = false)
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    console.log('App mounted. PWA registration status checking...');
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.console.log('--- PWA: Install Prompt is READY ---');
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    setDeferredPrompt(null);
  };

  const handleLogin = async () => {
    try {
      console.log('Initiating Google Sign-In...');
      await signInWithGoogle();
      console.log('Sign-In call completed');
    } catch (error: any) {
      console.error('CRITICAL LOGIN ERROR:', error);
      // Firebase errors like 'auth/popup-blocked' or 'auth/cancelled-popup-request'
      if (error.code === 'auth/popup-blocked') {
        alert('Login popup was blocked by your browser. Please allow popups for this site and try again.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        alert('Login window was closed before completion. Please try again.');
      } else if (error.code === 'auth/unauthorized-domain') {
        alert('This domain is not authorized for Firebase login. Please open the app in a NEW TAB (top right icon) to login.');
      } else {
        alert(`Login failed: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const profileId = profile.id || Math.random().toString(36).substring(2, 10);
      const profileToSave = {
        ...profile,
        id: profileId,
        ownerUid: user.uid,
        updatedAt: new Date().toISOString()
      };

      console.log('Saving profile to Firestore...', { id: profileId, ownerUid: user.uid });

      // 1. Save the profile document
      await setDoc(doc(db, 'profiles', profileId), profileToSave);

      // 2. If there's a slug, update the slug mapping
      if (profile.slug) {
        const slug = profile.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
        
        // Check if slug is already taken by another profile
        const slugRef = doc(db, 'slugs', slug);
        const slugDoc = await getDoc(slugRef);
        
        if (slugDoc.exists() && slugDoc.data().profileId !== profileId) {
          alert('This custom link is already taken. Please choose another one.');
          setIsSaving(false);
          return;
        }
        
        await setDoc(slugRef, { profileId });
      }

      setProfile(profileToSave);
      alert('Profile saved successfully to cloud!');
    } catch (e) {
      console.error('Error saving profile to Firestore:', e);
      alert('Failed to save profile. Please check your connection.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      setLoading(true);
      try {
        if (identifier) {
          // 1. Try to load by slug first
          const slug = identifier.trim().toLowerCase();
          const slugDoc = await getDoc(doc(db, 'slugs', slug));
          
          let profileId = identifier;
          if (slugDoc.exists()) {
            profileId = slugDoc.data().profileId;
          }

          // 2. Load the profile document
          const profileDoc = await getDoc(doc(db, 'profiles', profileId));
          if (profileDoc.exists() && isMounted) {
            setProfile(profileDoc.data() as UserProfile);
          } else if (isMounted) {
            console.error('Profile not found in Firestore');
          }
        } else if (user) {
          // Load user's own profile by ownerUid
          const q = query(collection(db, 'profiles'), where('ownerUid', '==', user.uid));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty && isMounted) {
            const data = querySnapshot.docs[0].data() as UserProfile;
            console.log('Loaded profile from Firestore:', { id: data.id, hasCover: !!data.coverUrl });
            setProfile(data);
          } else if (isMounted) {
            console.log('No profile found in Firestore for user, creating blank');
            setProfile({
              ...emptyProfile,
              name: user.displayName || '',
              email: user.email || '',
              avatarUrl: user.photoURL || ''
            });
          }
        } else if (!identifier && isMounted) {
          setProfile(defaultProfile);
        }
      } catch (e) {
        console.error('Error loading profile from Firestore:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProfile();
    return () => { isMounted = false; };
  }, [identifier, user?.uid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isSharedView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center sm:py-8 relative overflow-hidden">
        {/* Elegant background graphics */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-300/30 to-indigo-300/30 blur-3xl mix-blend-multiply"></div>
          <div className="absolute top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-pink-300/30 to-orange-300/30 blur-3xl mix-blend-multiply"></div>
          <div className="absolute -bottom-[20%] left-[10%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-blue-300/30 to-cyan-300/30 blur-3xl mix-blend-multiply"></div>
        </div>
        
        <div className="w-full max-w-md px-4 flex justify-center mb-6">
          <button 
            onClick={() => {
              window.location.href = window.location.origin;
            }}
            className="flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl text-sm font-semibold text-blue-600 hover:bg-white transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Edit3 size={16} />
            Create Your Own Digital Card
          </button>
        </div>

        <PreviewCard profile={profile} isSharedView={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900 relative overflow-hidden">
      {/* Elegant background graphics */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none fixed">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-300/30 to-indigo-300/30 blur-3xl mix-blend-multiply"></div>
        <div className="absolute top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-pink-300/30 to-orange-300/30 blur-3xl mix-blend-multiply"></div>
        <div className="absolute -bottom-[20%] left-[10%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-blue-300/30 to-cyan-300/30 blur-3xl mix-blend-multiply"></div>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                N
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900 hidden sm:block">
                Neox Digital
              </span>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex flex-col items-end mr-2">
                    <span className="text-xs font-semibold text-gray-900">{user.displayName || user.email}</span>
                  </div>
                  <div className="bg-gray-100 p-1 rounded-xl flex">
                    {deferredPrompt ? (
                      <button
                        onClick={handleInstallClick}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all mr-1 animate-pulse"
                        title="Install App Now"
                      >
                        <Download size={16} />
                        <span>Install App</span>
                      </button>
                    ) : (
                      <div className="hidden lg:flex items-center px-4 text-[10px] text-gray-400 font-mono">
                        PWA: Waiting for browser...
                      </div>
                    )}
                    <button
                      onClick={() => setIsEditing(true)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isEditing 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <Edit3 size={16} />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        !isEditing 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <Eye size={16} />
                      <span className="hidden sm:inline">Preview</span>
                    </button>
                  </div>
                  <button 
                    onClick={logOut}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md"
                >
                  <LogIn size={18} />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {!user ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 mb-6">
              <UserIcon size={40} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome To Digital Visiting Card</h1>
            <p className="text-gray-600 max-w-md mb-8">
              Create a professional digital presence in minutes. Sign in to start building your personalized card.
            </p>
            <button 
              onClick={handleLogin}
              className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl text-lg font-bold hover:bg-blue-700 transition-all shadow-xl hover:shadow-2xl active:scale-95"
            >
              <LogIn size={24} />
              Get Started with Google
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
            {/* Edit Form Section */}
            <div className={`w-full lg:w-1/2 transition-all duration-300 ${isEditing ? 'block' : 'hidden lg:block lg:opacity-50 lg:pointer-events-none'}`}>
              <EditForm profile={profile} onChange={setProfile} onSave={handleSave} isSaving={isSaving} />
            </div>

            {/* Preview Section */}
            <div className={`w-full lg:w-1/2 flex justify-center sticky top-24 transition-all duration-300 ${!isEditing ? 'block' : 'hidden lg:block'}`}>
              <div className="w-full max-w-md transform transition-transform duration-500 hover:scale-[1.02]">
                <PreviewCard profile={profile} isSharedView={false} onProfileUpdate={setProfile} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
