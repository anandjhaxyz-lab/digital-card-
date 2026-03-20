import React, { useState } from 'react';
import { UserProfile, Service, GalleryItem } from '../types';
import { 
  User, 
  Briefcase, 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Linkedin, 
  Twitter, 
  Instagram, 
  Image as ImageIcon,
  Palette,
  MessageCircle,
  Youtube,
  Facebook,
  Plus,
  Trash2,
} from 'lucide-react';

interface InputGroupProps {
  icon: React.ElementType;
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

function InputGroup({ icon: Icon, label, name, type = 'text', placeholder, value, onChange }: InputGroupProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        {type === 'textarea' ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
            placeholder={placeholder}
            rows={3}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
            placeholder={placeholder}
          />
        )}
      </div>
    </div>
  );
}

interface EditFormProps {
  profile: UserProfile;
  onChange: (profile: UserProfile) => void;
}

export default function EditForm({ profile, onChange }: EditFormProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'services' | 'gallery'>('basic');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...profile, [name]: value });
  };

  // ✅ Slug fix — poora URL nahi, sirf slug
  const getCleanSlug = (slug: string | undefined) => {
    if (!slug) return '';
    return slug
      .replace(window.location.origin + '/', '')
      .replace(window.location.origin, '')
      .replace(/^\/+/, '');
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanValue = e.target.value
      .replace(window.location.origin + '/', '')
      .replace(window.location.origin, '')
      .replace(/^\/+/, '');
    onChange({ ...profile, slug: cleanValue });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatarUrl' | 'coverUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...profile, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addService = () => {
    const newService: Service = {
      id: Date.now().toString(),
      title: '',
      description: '',
      price: '',
      imageUrl: ''
    };
    onChange({ ...profile, services: [...(profile.services || []), newService] });
  };

  const updateService = (id: string, field: keyof Service, value: string) => {
    const updatedServices = profile.services.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    );
    onChange({ ...profile, services: updatedServices });
  };

  const removeService = (id: string) => {
    onChange({ ...profile, services: profile.services.filter(s => s.id !== id) });
  };

  const addGalleryItem = () => {
    const newItem: GalleryItem = {
      id: Date.now().toString(),
      url: '',
      type: 'image'
    };
    onChange({ ...profile, gallery: [...(profile.gallery || []), newItem] });
  };

  const updateGalleryItem = (id: string, url: string) => {
    const updatedGallery = profile.gallery.map(g => 
      g.id === id ? { ...g, url } : g
    );
    onChange({ ...profile, gallery: updatedGallery });
  };

  const removeGalleryItem = (id: string) => {
    onChange({ ...profile, gallery: profile.gallery.filter(g => g.id !== id) });
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 p-6 md:p-8 max-w-2xl mx-auto font-sans relative z-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Your Card</h2>
      
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          className={`py-2 px-4 font-medium text-sm whitespace-nowrap ${activeTab === 'basic' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('basic')}
        >
          Basic Info
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm whitespace-nowrap ${activeTab === 'services' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('services')}
        >
          Products/Services
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm whitespace-nowrap ${activeTab === 'gallery' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('gallery')}
        >
          Gallery
        </button>
      </div>

      {activeTab === 'basic' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <section>
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Basic Information</h3>
            
            {/* ✅ Custom Card Link — Fix Applied */}
            <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
              <label className="block text-sm font-bold text-blue-900 mb-1">Custom Card Link</label>
              <div className="flex items-center gap-1 bg-white border border-blue-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                <span className="pl-3 text-gray-400 text-sm whitespace-nowrap shrink-0">
                  {window.location.origin}/
                </span>
                <input 
                  type="text" 
                  name="slug"
                  value={getCleanSlug(profile.slug)}
                  onChange={handleSlugChange}
                  placeholder="TheNationalTailors"
                  className="w-full py-2 px-1 text-sm focus:outline-none font-medium min-w-0"
                />
              </div>
              <p className="mt-1 text-xs text-blue-700">
                This will be your personalized link (e.g., {window.location.origin}/yourname)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <InputGroup icon={User} label="Full Name" name="name" placeholder="John Doe"
                value={profile.name || ''} onChange={handleChange} />
              <InputGroup icon={Briefcase} label="Job Title" name="title" placeholder="Software Engineer"
                value={profile.title || ''} onChange={handleChange} />
              <InputGroup icon={Building2} label="Company" name="company" placeholder="Acme Corp"
                value={profile.company || ''} onChange={handleChange} />

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-full h-full p-2 text-gray-400" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'avatarUrl')}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Picture</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-12 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                    {profile.coverUrl ? (
                      <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-full h-full p-2 text-gray-400" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'coverUrl')}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <InputGroup icon={User} label="Bio" name="bio" type="textarea"
              placeholder="A short bio about yourself..."
              value={profile.bio || ''} onChange={handleChange} />
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <InputGroup icon={Mail} label="Email Address" name="email" type="email"
                placeholder="john@example.com" value={profile.email || ''} onChange={handleChange} />
              <InputGroup icon={Phone} label="Phone Number" name="phone" type="tel"
                placeholder="+1 (555) 000-0000" value={profile.phone || ''} onChange={handleChange} />
              <InputGroup icon={MessageCircle} label="WhatsApp Number" name="whatsapp" type="tel"
                placeholder="+15550000000" value={profile.whatsapp || ''} onChange={handleChange} />
              <InputGroup icon={Globe} label="Website" name="website" type="url"
                placeholder="https://johndoe.com" value={profile.website || ''} onChange={handleChange} />
              <InputGroup icon={MapPin} label="Address" name="address"
                placeholder="123 Main St, City, Country" value={profile.address || ''} onChange={handleChange} />
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <InputGroup icon={Linkedin} label="LinkedIn URL" name="linkedin" type="url"
                placeholder="https://linkedin.com/in/johndoe" value={profile.linkedin || ''} onChange={handleChange} />
              <InputGroup icon={Twitter} label="Twitter URL" name="twitter" type="url"
                placeholder="https://twitter.com/johndoe" value={profile.twitter || ''} onChange={handleChange} />
              <InputGroup icon={Instagram} label="Instagram URL" name="instagram" type="url"
                placeholder="https://instagram.com/johndoe" value={profile.instagram || ''} onChange={handleChange} />
              <InputGroup icon={Facebook} label="Facebook URL" name="facebook" type="url"
                placeholder="https://facebook.com/johndoe" value={profile.facebook || ''} onChange={handleChange} />
              <InputGroup icon={Youtube} label="YouTube URL" name="youtube" type="url"
                placeholder="https://youtube.com/c/johndoe" value={profile.youtube || ''} onChange={handleChange} />
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Appearance</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme Color</label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  name="themeColor"
                  value={profile.themeColor || '#3b82f6'}
                  onChange={handleChange}
                  className="h-10 w-10 rounded cursor-pointer border-0 p-0"
                />
                <div className="flex-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Palette className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="themeColor"
                    value={profile.themeColor || ''}
                    onChange={handleChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3 border uppercase"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-lg font-semibold text-gray-900">Products & Services</h3>
            <button 
              onClick={addService}
              className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus size={16} /> Add New
            </button>
          </div>
          
          {(!profile.services || profile.services.length === 0) && (
            <p className="text-gray-500 text-center py-8">No services added yet. Click "Add New" to get started.</p>
          )}

          {profile.services?.map((service, index) => (
            <div key={service.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative">
              <button 
                onClick={() => removeService(service.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
              <h4 className="font-medium text-gray-900 mb-4">Item #{index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" value={service.title}
                    onChange={(e) => updateService(service.id, 'title', e.target.value)}
                    className="w-full text-sm border-gray-300 rounded-md py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Web Development" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Price (Optional)</label>
                  <input type="text" value={service.price || ''}
                    onChange={(e) => updateService(service.id, 'price', e.target.value)}
                    className="w-full text-sm border-gray-300 rounded-md py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. $500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={service.description}
                    onChange={(e) => updateService(service.id, 'description', e.target.value)}
                    className="w-full text-sm border-gray-300 rounded-md py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe this product or service..." rows={2} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                  <input type="url" value={service.imageUrl || ''}
                    onChange={(e) => updateService(service.id, 'imageUrl', e.target.value)}
                    className="w-full text-sm border-gray-300 rounded-md py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/image.jpg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'gallery' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-lg font-semibold text-gray-900">Photo Gallery</h3>
            <button 
              onClick={addGalleryItem}
              className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus size={16} /> Add Photo
            </button>
          </div>
          
          {(!profile.gallery || profile.gallery.length === 0) && (
            <p className="text-gray-500 text-center py-8">No photos added yet. Click "Add Photo" to get started.</p>
          )}

          <div className="grid grid-cols-1 gap-4">
            {profile.gallery?.map((item, index) => (
              <div key={item.id} className="flex gap-3 items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {item.url ? (
                    <img src={item.url} alt={`Gallery ${index}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <ImageIcon className="text-gray-400" size={24} />
                  )}
                </div>
                <div className="flex-1">
                  <input type="url" value={item.url}
                    onChange={(e) => updateGalleryItem(item.id, e.target.value)}
                    className="w-full text-sm border-gray-300 rounded-md py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Image URL (e.g. https://example.com/photo.jpg)" />
                </div>
                <button onClick={() => removeGalleryItem(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
