import { Location } from './location.model';

export interface User {
  id: number;
  fullName: string;
  email: string;
  password_hash: string;
  phone_number?: string;
  role: UserRole;
  last_known_location_id?: number;
  created_at?: Date;
  // Additional properties for admin functionality
  phone?: string;
  location?: string;
  skills?: string[];
  isActive?: boolean;
  createdAt?: Date; // Alternative property name for compatibility
}

export enum UserRole {
  VATANDAS = 'VATANDAS',
  GONULLU = 'GONULLU',
  YONETICI = 'YONETICI'
}

export interface Skill {
  id: number;
  skill_name: string;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon_url?: string;
  criteria_text: string;
}

export interface UserBadge {
  id: number;
  user_id: number;
  badge_id: number;
  earned_at: Date;
}

export interface UserSkill {
  user_id: number;
  skill_id: number;
}
