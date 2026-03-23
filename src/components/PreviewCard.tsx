import React, { useState } from 'react';
import { UserProfile } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Phone, Mail, Globe, MapPin, Linkedin, Twitter, Instagram, 
  Download, Share2, QrCode, X, MessageCircle, Youtube, Facebook,
  Briefcase, Image as ImageIcon, User
} from 'lucide-react';
import { supabase } from '../supabaseClient';

interface PreviewCardProps {
  profile: UserProfile;
  isSharedView?: boolean;
  onProfileUpdate?: (profile: UserProfile) => void;
}

export default function PreviewCard({ profile, isSharedView = false, onProfileUpdate }: PreviewCardProps) {
  const [showQR, setShowQR] = useState(false);
  const [sharePhone, setSharePhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [isSaving, setIsSaving] = useState(false);
  const [qrUrl, setQrUrl] = useState('');

  // ✅ FIX 1: Save karke share URL lo
  const getShareUrl = async (): Promise<string | null> => {
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Pehle login karo!');
        return null;
      }

      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        const result = await response.json();
        const slug = result.slug || result.profile_data?.slug;
        const id = result.id;
        const url = new URL(window.location.origin);
        if (slug) {
          url.pathname = `/${slug}`;
        } else {
          url.searchParams.set('id', id);
          url.searchParams.set('shared', 'true');
        }
        return url.toString();
      } else {
        const err = await response.json();
        alert(err.error || 'Share link banane mein dikkat aayi');
      }
    } catch (e) {
      console.error('Share URL error:', e);
    } finally {
      setIsSaving(false);
    }
    return null;
  };

  // ✅ FIX 2: whatsapp:// protocol — seedha app khulega
  const handleWhatsappDirectShare = async () => {
    if (!sharePhone || isSaving) return;
    const shareUrl = await getShareUrl();
    if (!shareUrl) return;
    const cleaned = sharePhone.replace(/\D/g, '');
    const fullNumber = `${countryCode.replace('+', '')}${cleaned}`;
    const text = encodeURIComponent(`Mera Digital Visiting Card dekhein: ${shareUrl}`);
    window.location.href = `whatsapp://send?phone=${fullNumber}&text=${text}`;
  };

  const handleShowQR = async () => {
    setShowQR(true);
    const shareUrl = await getShareUrl();
    if (shareUrl) setQrUrl(shareUrl);
  };

  const handleShare = async () => {
    if (isSaving) return;
    const shareUrl = await getShareUrl();
    if (!shareUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${profile.name} - ${profile.title}`, url: shareUrl });
      } catch {
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied!');
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied!');
    }
  };

  const generateVCard = () => {
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${profile.name}\nORG:${profile.company}\nTITLE:${profile.title}\nTEL;TYPE=WORK,VOICE:${profile.phone}\nTEL;TYPE=CELL,VOICE:${profile.whatsapp}\nEMAIL;TYPE=PREF,INTERNET:${profile.email}\nURL:${profile.website}\nNOTE:${profile.bio}\nEND:VCARD`;
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(profile.name || 'card').replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getWhatsappLink = () => {
    if (!profile.whatsapp) return '#';
    return `https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`;
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-xl h-[800px] sm:rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/40 overflow-hidden relative font-sans text-gray-800 flex flex-col z-10">
      <div className="flex-1 overflow-y-auto pb-24 custom-scrollbar">
        <div className="h-48 w-full relative bg-cover bg-center flex-shrink-0"
          style={{ backgroundColor: profile.themeColor || '#3b82f6', backgroundImage: profile.coverUrl ? `url(${profile.coverUrl})` : 'none' }}>
          <div className="absolute inset-0 bg-black/10"></div>
          <button onClick={handleShowQR}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors text-white z-10">
            <QrCode size={20} />
          </button>
        </div>

        <div className="px-6 relative">
          <div className="flex justify-center -mt-20 mb-4 relative z-10">
            <img
              src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'A')}&background=random&size=150`}
              alt={profile.name}
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{profile.name || 'Your Name'}</h1>
            <p className="text-md font-medium text-gray-600 mb-1">{profile.title || 'Your Title'}</p>
            <p className="text-sm text-gray-500">{profile.company || 'Your Company'}</p>
          </div>

          {/* ✅ FIX 3: Shared view mein bhi Save Contact + Share */}
          {isSharedView ? (
            <div className="flex flex-col gap-3 mb-8">
              {profile.whatsapp && (
                <a href={getWhatsappLink()} target="_blank" rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-[#25D366] text-white font-semibold flex items-center justify-center gap-2 shadow-md transition-transform hover:scale-[1.02]">
                  <MessageCircle size={20} />
                  Chat on WhatsApp
                </a>
              )}
              <div className="flex gap-3">
                <button onClick={generateVCard}
                  className="flex-1 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-md transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: profile.themeColor || '#3b82f6' }}>
                  <Download size={18} />
                  Save Contact
                </button>
                <button onClick={() => {
                    const url = window.location.href;
                    if (navigator.share) { navigator.share({ title: profile.name, url }); }
                    else { navigator.clipboard.writeText(url); alert('Link copied!'); }
                  }}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-800 font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                  <Share2 size={18} />
                  Share
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Owner: WhatsApp share box */}
              <div className="mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 text-center">Share this card via WhatsApp</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex flex-1 rounded-xl overflow-hidden border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-[#25D366]">
                    <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-gray-50 border-r border-gray-200 px-3 py-3 text-gray-700 text-sm font-medium focus:outline-none cursor-pointer">
                      <option value="+91">IN (+91)</option>
                      <option value="+1">US (+1)</option>
                      <option value="+44">UK (+44)</option>
                      <option value="+61">AU (+61)</option>
                      <option value="+971">AE (+971)</option>
                    </select>
                    <input type="tel" value={sharePhone} onChange={(e) => setSharePhone(e.target.value)}
                      placeholder="WhatsApp Number"
                      className="flex-1 px-4 py-3 text-sm focus:outline-none w-full" />
                  </div>
                  <button onClick={handleWhatsappDirectShare} disabled={!sharePhone || isSaving}
                    className="bg-[#25D366] hover:bg-[#1DA851] disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 whitespace-nowrap">
                    {isSaving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <MessageCircle size={18} />}
                    {isSaving ? 'Saving...' : 'Share Now'}
                  </button>
                </div>
              </div>

              {/* Owner action buttons */}
              <div className="flex flex-col gap-3 mb-8">
                {profile.whatsapp && (
                  <a href={getWhatsappLink()} target="_blank" rel="noopener noreferrer"
                    className="w-full py-3 rounded-xl bg-[#25D366] text-white font-semibold flex items-center justify-center gap-2 shadow-md transition-transform hover:scale-[1.02]">
                    <MessageCircle size={20} />
                    Chat on WhatsApp
                  </a>
                )}
                <div className="flex gap-3">
                  <button onClick={generateVCard}
                    className="flex-1 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-md transition-transform hover:scale-[1.02]"
                    style={{ backgroundColor: profile.themeColor || '#3b82f6' }}>
                    <Download size={18} />
                    Save Contact
                  </button>
                  <button onClick={handleShare}
                    className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-800 font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                    <Share2 size={18} />
                    Share
                  </button>
                </div>
              </div>
            </>
          )}

          {profile.bio && (
            <div className="mb-8 bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <User size={16} style={{ color: profile.themeColor || '#3b82f6' }} />
                About Me
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{profile.bio}</p>
            </div>
          )}

          {profile.services && profile.services.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Briefcase size={16} style={{ color: profile.themeColor || '#3b82f6' }} />
                Products & Services
              </h2>
              <div className="space-y-4">
                {profile.services.map((service) => (
                  <div key={service.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {service.imageUrl && <img src={service.imageUrl} alt={service.title} className="w-full h-40 object-cover" referrerPolicy="no-referrer" />}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900">{service.title}</h3>
                        {service.price && <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap">{service.price}</span>}
                      </div>
                      <p className="text-sm text-gray-600">{service.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile.gallery && profile.gallery.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ImageIcon size={16} style={{ color: profile.themeColor || '#3b82f6' }} />
                Gallery
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {profile.gallery.map((item) => (
                  <div key={item.id} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                    {item.url
                      ? <img src={item.url} alt="Gallery" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={24} /></div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(profile.linkedin || profile.twitter || profile.instagram || profile.facebook || profile.youtube) && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 text-center">Connect With Me</h2>
              <div className="flex flex-wrap justify-center gap-3">
                {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"><Linkedin size={20} /></a>}
                {profile.twitter && <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-sky-50 hover:text-sky-500 transition-colors"><Twitter size={20} /></a>}
                {profile.instagram && <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-pink-50 hover:text-pink-600 transition-colors"><Instagram size={20} /></a>}
                {profile.facebook && <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"><Facebook size={20} /></a>}
                {profile.youtube && <a href={profile.youtube} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"><Youtube size={20} /></a>}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex justify-around items-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20 sm:rounded-b-3xl">
        {profile.phone && (
          <a href={`tel:${profile.phone}`} className="flex flex-col items-center gap-1 group">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 transition-transform group-hover:-translate-y-1"><Phone size={18} /></div>
            <span className="text-[10px] font-medium text-gray-500">Call</span>
          </a>
        )}
        {profile.whatsapp && (
          <a href={getWhatsappLink()} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 group">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-50 text-green-600 transition-transform group-hover:-translate-y-1"><MessageCircle size={18} /></div>
            <span className="text-[10px] font-medium text-gray-500">WhatsApp</span>
          </a>
        )}
        {profile.email && (
          <a href={`mailto:${profile.email}`} className="flex flex-col items-center gap-1 group">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-50 text-red-600 transition-transform group-hover:-translate-y-1"><Mail size={18} /></div>
            <span className="text-[10px] font-medium text-gray-500">Email</span>
          </a>
        )}
        {profile.address && (
          <a href={`https://maps.google.com/?q=${encodeURIComponent(profile.address)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 group">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-50 text-purple-600 transition-transform group-hover:-translate-y-1"><MapPin size={18} /></div>
            <span className="text-[10px] font-medium text-gray-500">Map</span>
          </a>
        )}
        {profile.website && (
          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 group">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-700 transition-transform group-hover:-translate-y-1"><Globe size={18} /></div>
            <span className="text-[10px] font-medium text-gray-500">Website</span>
          </a>
        )}
      </div>

      {showQR && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6">
          <button onClick={() => setShowQR(false)}
            className="absolute top-6 right-6 p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center">
            <h3 className="text-xl font-bold mb-6 text-gray-900">Scan to Connect</h3>
            <div className="p-4 bg-white rounded-2xl border-2 border-gray-100">
              {qrUrl
                ? <QRCodeSVG value={qrUrl} size={200} fgColor={profile.themeColor || '#000000'} />
                : <div className="w-[200px] h-[200px] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}
            </div>
            <p className="mt-6 text-sm text-gray-500 text-center">Point your camera at the QR code<br/>to view this digital card.</p>
          </div>
        </div>
      )}
    </div>
  );
}
