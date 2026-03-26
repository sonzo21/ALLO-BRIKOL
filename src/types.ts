export type UserRole = 'client' | 'artisan' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  city?: string;
  photoURL?: string;
  role: UserRole;
  createdAt: any;
}

export interface ArtisanProfile {
  uid: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  city: string;
  photoURL?: string;
  description?: string;
  categories: string[];
  hourlyRate?: number;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  availability?: Record<string, any>;
}

export interface Category {
  id: string;
  nameFr: string;
  nameAr: string;
  icon: string;
}

export interface Review {
  id: string;
  artisanId: string;
  clientId: string;
  clientName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export interface ServiceRequest {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  city: string;
  category: string;
  status: 'open' | 'closed';
  createdAt: any;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: string;
  updatedAt: any;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: any;
}
