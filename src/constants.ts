import { Category } from './types';

export const CATEGORIES: Category[] = [
  { id: 'plomberie', nameFr: 'Plomberie', nameAr: 'سباكة', icon: 'Droplets' },
  { id: 'electricite', nameFr: 'Électricité', nameAr: 'كهرباء', icon: 'Zap' },
  { id: 'peinture', nameFr: 'Peinture', nameAr: 'صباغة', icon: 'Paintbrush' },
  { id: 'menuiserie', nameFr: 'Menuiserie', nameAr: 'نجارة', icon: 'Hammer' },
  { id: 'maconnerie', nameFr: 'Maçonnerie', nameAr: 'بناء', icon: 'Brick' },
  { id: 'climatisation', nameFr: 'Climatisation', nameAr: 'تكييف', icon: 'Wind' },
  { id: 'serrurerie', nameFr: 'Serrurerie', nameAr: 'أقفال', icon: 'Key' },
  { id: 'tv_reparation', nameFr: 'Réparation TV', nameAr: 'إصلاح التلفاز', icon: 'Tv' },
];

export const CITIES = [
  'Casablanca',
  'Rabat',
  'Marrakech',
  'Fès',
  'Tanger',
  'Agadir',
  'Meknès',
  'Oujda',
  'Kenitra',
  'Tétouan',
];

export const COLORS = {
  primary: '#2563eb', // Blue
  secondary: '#f97316', // Orange
  accent: '#fbbf24', // Amber
};
