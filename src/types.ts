export interface Service {
  id: string;
  title: string;
  description: string;
  price?: string;
  imageUrl?: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  type: 'image' | 'video';
}

export interface UserProfile {
  name: string;
  title: string;
  company: string;
  bio: string;
  email: string;
  phone: string;
  whatsapp: string;
  website: string;
  address: string;
  linkedin: string;
  twitter: string;
  instagram: string;
  youtube: string;
  facebook: string;
  avatarUrl: string;
  coverUrl: string;
  themeColor: string;
  services: Service[];
  gallery: GalleryItem[];
}
