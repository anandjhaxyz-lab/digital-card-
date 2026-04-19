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
  Link,
  Image as ImageIcon,
  Palette,
  MessageCircle,
  Youtube,
  Facebook,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Save
} from 'lucide-react';

interface EditFormProps {
  profile: UserProfile;
  onChange: (update: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
  onSave?: () => void;
  isSaving?: boolean;
}

interface InputGroupProps {
  icon: any;
  label: string;
  name: string;
  profile: UserProfile;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  placeholder?: string;
}

const InputGroup = ({ icon: Icon, label, name, type = 'text', placeholder, profile, onChange }: InputGroupProps) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative rounded-md shadow-sm">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      {type === 'textarea' ? (
        <textarea
          name={name}
          value={profile[name as keyof UserProfile] as string || ''}
          onChange={onChange}
          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
          placeholder={placeholder}
          rows={3}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={profile[name as keyof UserProfile] as string || ''}
          onChange={onChange}
          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
          placeholder={placeholder}
        />
      )}
    </div>
  </div>
);

export default function EditForm({ profile, onChange, onSave, isSaving }: EditFormProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'services' | 'gallery'>('basic');
  const [isUploading, setIsUploading] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatarUrl' | 'coverUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(field);
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimensions
          const MAX_WIDTH = field === 'avatarUrl' ? 400 : 1200;
          const MAX_HEIGHT = field === 'avatarUrl' ? 400 : 800;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          onChange(prev => ({ ...prev, [field]: dataUrl }));
          setIsUploading(null);
        };
        img.onerror = () => {
          console.error('Error loading image for compression');
          setIsUploading(null);
        };
        img.src = reader.result as string;
      };
      reader.onerror = () => {
        console.error('Error reading file');
        setIsUploading(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (field: 'avatarUrl' | 'coverUrl') => {
    onChange(prev => ({ ...prev, [field]: '' }));
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
          {/* Basic Info */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <div className="md:col-span-2">
                <InputGroup 
                  icon={Link} 
                  label="Custom Card Link (Slug)" 
                  name="slug" 
                  placeholder="yourname-or-business" 
                  profile={profile}
                  onChange={handleChange}
                />
                <p className="text-[10px] text-gray-500 -mt-3 mb-4 ml-1">
                  Your link will be: {window.location.origin}/{profile.slug || 'slug'}
                </p>
              </div>
              <InputGroup icon={User} label="Full Name" name="name" placeholder="John Doe" profile={profile} onChange={handleChange} />
              <InputGroup icon={Briefcase} label="Job Title" name="title" placeholder="Software Engineer" profile={profile} onChange={handleChange} />
              <InputGroup icon={Building2} label="Company" name="company" placeholder="Acme Corp" profile={profile} onChange={handleChange} />
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 relative group">
                    {isUploading === 'avatarUrl' ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      </div>
                    ) : profile.avatarUrl ? (
                      <>
                        <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => removeImage('avatarUrl')}
                          className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      <User className="w-full h-full p-2 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'avatarUrl')}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Picture</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-12 rounded bg-gray-200 overflow-hidden flex-shrink-0 relative group">
                    {isUploading === 'coverUrl' ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      </div>
                    ) : profile.coverUrl ? (
                      <>
                        <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => removeImage('coverUrl')}
                          className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      <ImageIcon className="w-full h-full p-2 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'coverUrl')}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
            <InputGroup icon={User} label="Bio" name="bio" type="textarea" placeholder="A short bio about yourself..." profile={profile} onChange={handleChange} />
          </section>

          {/* Contact Info */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <InputGroup icon={Mail} label="Email Address" name="email" type="email" placeholder="john@example.com" profile={profile} onChange={handleChange} />
              <InputGroup icon={Phone} label="Phone Number" name="phone" type="tel" placeholder="+1 (555) 000-0000" profile={profile} onChange={handleChange} />
              <InputGroup icon={MessageCircle} label="WhatsApp Number" name="whatsapp" type="tel" placeholder="+15550000000" profile={profile} onChange={handleChange} />
              <InputGroup icon={Globe} label="Website" name="website" type="url" placeholder="https://johndoe.com" profile={profile} onChange={handleChange} />
              <InputGroup icon={MapPin} label="Address" name="address" placeholder="123 Main St, City, Country" profile={profile} onChange={handleChange} />
            </div>
          </section>

          {/* Social Links */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <InputGroup icon={Linkedin} label="LinkedIn URL" name="linkedin" type="url" placeholder="https://linkedin.com/in/johndoe" profile={profile} onChange={handleChange} />
              <InputGroup icon={Twitter} label="Twitter URL" name="twitter" type="url" placeholder="https://twitter.com/johndoe" profile={profile} onChange={handleChange} />
              <InputGroup icon={Instagram} label="Instagram URL" name="instagram" type="url" placeholder="https://instagram.com/johndoe" profile={profile} onChange={handleChange} />
              <InputGroup icon={Facebook} label="Facebook URL" name="facebook" type="url" placeholder="https://facebook.com/johndoe" profile={profile} onChange={handleChange} />
              <InputGroup icon={Youtube} label="YouTube URL" name="youtube" type="url" placeholder="https://youtube.com/c/johndoe" profile={profile} onChange={handleChange} />
            </div>
          </section>

          {/* Appearance */}
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
                  <input
                    type="text"
                    value={service.title}
                    onChange={(e) => updateService(service.id, 'title', e.target.value)}
                    className="w-full text-sm border-gray-300 rounded-md py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Web Development"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Price (Optional)</label>
                  <input
                    type="text"
                    value={service.price || ''}
                    onChange={(e) => updateService(service.id, 'price', e.target.value)}
                    className="w-full text-sm border-gray-300 rounded-md py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. $500 or Starting at $50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={service.description}
                    onChange={(e) => updateService(service.id, 'description', e.target.value)}
                    className="w-full text-sm border-gray-300 rounded-md py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe this product or service..."
                    rows={2}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                  <input
                    type="url"
                    value={service.imageUrl || ''}
                    onChange={(e) => updateService(service.id, 'imageUrl', e.target.value)}
                    className="w-full text-sm border-gray-300 rounded-md py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
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
                  <input
                    type="url"
                    value={item.url}
                    onChange={(e) => updateGalleryItem(item.id, e.target.value)}
                    className="w-full text-sm border-gray-300 rounded-md py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Image URL (e.g. https://example.com/photo.jpg)"
                  />
                </div>
                <button 
                  onClick={() => removeGalleryItem(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {onSave && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <Save size={24} />
            )}
            {isSaving ? 'Saving Changes...' : 'Save All Changes'}
          </button>
          <p className="text-center text-xs text-gray-500 mt-3">
            Your changes will be saved to your digital profile.
          </p>
        </div>
      )}
    </div>
  );
}
