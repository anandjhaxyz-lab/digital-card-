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
  ChevronDown,
  ChevronUp
} from 'lucide-react';

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

  const InputGroup = ({ icon: Icon, label, name, type = 'text', placeholder }: any) => (
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
            onChange={handleChange}
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
            placeholder={placeholder}
            rows={3}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={profile[name as keyof UserProfile] as string || ''}
            onChange={handleChange}
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
            placeholder={placeholder}
          />
        )}
      </div>
    </div>
  );

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
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-2xl mx-auto font-sans">
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
              <InputGroup icon={User} label="Full Name" name="name" placeholder="John Doe" />
              <InputGroup icon={Briefcase} label="Job Title" name="title" placeholder="Software Engineer" />
              <InputGroup icon={Building2} label="Company" name="company" placeholder="Acme Corp" />
              <InputGroup icon={ImageIcon} label="Avatar URL" name="avatarUrl" placeholder="https://example.com/avatar.jpg" />
              <InputGroup icon={ImageIcon} label="Cover Image URL" name="coverUrl" placeholder="https://example.com/cover.jpg" />
            </div>
            <InputGroup icon={User} label="Bio" name="bio" type="textarea" placeholder="A short bio about yourself..." />
          </section>

          {/* Contact Info */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <InputGroup icon={Mail} label="Email Address" name="email" type="email" placeholder="john@example.com" />
              <InputGroup icon={Phone} label="Phone Number" name="phone" type="tel" placeholder="+1 (555) 000-0000" />
              <InputGroup icon={MessageCircle} label="WhatsApp Number" name="whatsapp" type="tel" placeholder="+15550000000" />
              <InputGroup icon={Globe} label="Website" name="website" type="url" placeholder="https://johndoe.com" />
              <InputGroup icon={MapPin} label="Address" name="address" placeholder="123 Main St, City, Country" />
            </div>
          </section>

          {/* Social Links */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <InputGroup icon={Linkedin} label="LinkedIn URL" name="linkedin" type="url" placeholder="https://linkedin.com/in/johndoe" />
              <InputGroup icon={Twitter} label="Twitter URL" name="twitter" type="url" placeholder="https://twitter.com/johndoe" />
              <InputGroup icon={Instagram} label="Instagram URL" name="instagram" type="url" placeholder="https://instagram.com/johndoe" />
              <InputGroup icon={Facebook} label="Facebook URL" name="facebook" type="url" placeholder="https://facebook.com/johndoe" />
              <InputGroup icon={Youtube} label="YouTube URL" name="youtube" type="url" placeholder="https://youtube.com/c/johndoe" />
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
    </div>
  );
}
