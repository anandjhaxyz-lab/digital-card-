import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import PreviewCard from './components/PreviewCard';
import EditForm from './components/EditForm';
import { Edit3, Eye } from 'lucide-react';

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

export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const sharedId = urlParams.get('id');
  const isSharedView = urlParams.get('shared') === 'true';
  
  // Detect slug from path (e.g., /TheNationalTailors)
  const path = window.location.pathname.substring(1);
  const slugFromPath = path && !path.includes('/') && !path.startsWith('api') ? path : null;
  const identifier = sharedId || slugFromPath;

  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [loading, setLoading] = useState(!!identifier);
  
  // If we have an identifier, we should default to Preview mode
  const [isEditing, setIsEditing] = useState(!identifier && !isSharedView);

  useEffect(() => {
    async function loadProfile() {
      if (identifier) {
        try {
          const response = await fetch(`/api/profiles/${identifier}`);
          if (response.ok) {
            const data = await response.json();
            setProfile(data);
          } else {
            console.error('Failed to fetch profile');
          }
        } catch (e) {
          console.error('Error loading profile:', e);
        } finally {
          setLoading(false);
        }
      } else {
        // Fallback to local storage if no identifier
        const saved = localStorage.getItem('visitingCardProfile');
        if (saved) {
          try {
            setProfile(JSON.parse(saved));
          } catch (e) {
            console.error('Failed to parse saved profile', e);
          }
        }
      }
    }
    loadProfile();
  }, [identifier]);

  useEffect(() => {
    if (isSharedView || identifier) return; // Don't update local storage if we are just viewing a shared card

    // Save to local storage
    localStorage.setItem('visitingCardProfile', JSON.stringify(profile));
  }, [profile, isSharedView, identifier]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isSharedView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center sm:py-8 relative overflow-hidden">
        {/* Elegant background graphics */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-300/30 to-indigo-300/30 blur-3xl mix-blend-multiply"></div>
          <div className="absolute top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-pink-300/30 to-orange-300/30 blur-3xl mix-blend-multiply"></div>
          <div className="absolute -bottom-[20%] left-[10%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-blue-300/30 to-cyan-300/30 blur-3xl mix-blend-multiply"></div>
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
                V
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900 hidden sm:block">
                VisitCard
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 p-1 rounded-xl flex">
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
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Edit Form Section */}
          <div className={`w-full lg:w-1/2 transition-all duration-300 ${isEditing ? 'block' : 'hidden lg:block lg:opacity-50 lg:pointer-events-none'}`}>
            <EditForm profile={profile} onChange={setProfile} />
          </div>

          {/* Preview Section */}
          <div className={`w-full lg:w-1/2 flex justify-center sticky top-24 transition-all duration-300 ${!isEditing ? 'block' : 'hidden lg:block'}`}>
            <div className="w-full max-w-md transform transition-transform duration-500 hover:scale-[1.02]">
              <PreviewCard profile={profile} isSharedView={false} onProfileUpdate={setProfile} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
