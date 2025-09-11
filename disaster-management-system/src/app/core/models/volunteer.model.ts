// Gönüllü temel bilgileri
export interface Volunteer {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  address: string;
  city: string;
  emergencyContact: EmergencyContact;
  skills: VolunteerSkill[];
  availability: Availability;
  experience: string;
  motivation: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  registrationDate: Date;
  lastActiveDate: Date;
  totalTasksCompleted: number;
  totalHours: number;
  rating: number;
  badges: Badge[];
  teamId?: number;
}

// Acil durum iletişim bilgileri
export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

// Gönüllü yetkinlikleri
export interface VolunteerSkill {
  id: number;
  category: SkillCategory;
  name: string;
  level: SkillLevel;
  certified: boolean;
  certificationDate?: Date;
  experienceYears: number;
  description: string;
}

export enum SkillCategory {
  MEDICAL = 'MEDICAL',
  TRANSPORTATION = 'TRANSPORTATION',
  EQUIPMENT = 'EQUIPMENT',
  COMMUNICATION = 'COMMUNICATION',
  LOGISTICS = 'LOGISTICS',
  CONSTRUCTION = 'CONSTRUCTION',
  PSYCHOLOGICAL = 'PSYCHOLOGICAL',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  SEARCH_RESCUE = 'SEARCH_RESCUE',
  OTHER = 'OTHER'
}

export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

// Müsaitlik durumu
export interface Availability {
  id: number;
  volunteerId: number;
  weekdays: WeekdayAvailability[];
  weekends: WeekendAvailability;
  emergencyResponse: boolean;
  maxDistance: number; // km cinsinden
  preferredTimeSlots: TimeSlot[];
  notes: string;
}

export interface WeekdayAvailability {
  day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  night: boolean;
}

export interface WeekendAvailability {
  saturday: WeekdayAvailability;
  sunday: WeekdayAvailability;
}

export interface TimeSlot {
  startTime: string; // HH:MM formatında
  endTime: string;
}

// Gönüllü görevleri
export interface VolunteerTask {
  id: number;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  location: TaskLocation;
  requiredSkills: SkillCategory[];
  estimatedDuration: number; // dakika cinsinden
  actualDuration?: number;
  assignedVolunteerId?: number;
  assignedTeamId?: number;
  createdAt: Date;
  assignedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  rating?: number;
  feedback?: string;
  photos?: string[];
  emergencyLevel: EmergencyLevel;
}

export enum TaskCategory {
  SEARCH_RESCUE = 'SEARCH_RESCUE',
  MEDICAL_AID = 'MEDICAL_AID',
  TRANSPORTATION = 'TRANSPORTATION',
  DISTRIBUTION = 'DISTRIBUTION',
  COMMUNICATION = 'COMMUNICATION',
  LOGISTICS = 'LOGISTICS',
  CONSTRUCTION = 'CONSTRUCTION',
  PSYCHOLOGICAL_SUPPORT = 'PSYCHOLOGICAL_SUPPORT',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  OTHER = 'OTHER'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum TaskStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED'
}

export enum EmergencyLevel {
  NORMAL = 'NORMAL',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL',
  EMERGENCY = 'EMERGENCY'
}

export interface TaskLocation {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  district: string;
  coordinates: string;
}

// Rozet sistemi
export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  level: BadgeLevel;
  criteria: BadgeCriteria;
  earnedAt: Date;
  progress: number; // 0-100 arası
  maxProgress: number;
  rarity: BadgeRarity;
  points: number;
}

export enum BadgeCategory {
  ACHIEVEMENT = 'ACHIEVEMENT',
  SKILL = 'SKILL',
  PARTICIPATION = 'PARTICIPATION',
  SPECIAL = 'SPECIAL',
  MILESTONE = 'MILESTONE'
}

export enum BadgeLevel {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND'
}

export enum BadgeRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY'
}

export interface BadgeCriteria {
  type: 'TASK_COUNT' | 'HOURS' | 'SKILL_USE' | 'CONSECUTIVE_DAYS' | 'SPECIAL_EVENT';
  value: number;
  description: string;
  conditions?: string[];
}

// Gönüllü ekipleri
export interface VolunteerTeam {
  id: number;
  name: string;
  description: string;
  leaderId: number;
  members: TeamMember[];
  specializations: SkillCategory[];
  maxMembers: number;
  currentMembers: number;
  status: TeamStatus;
  createdAt: Date;
  totalTasksCompleted: number;
  rating: number;
  location: TaskLocation;
  contactInfo: TeamContactInfo;
}

export interface TeamMember {
  volunteerId: number;
  role: TeamRole;
  joinedAt: Date;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  skills: SkillCategory[];
  tasksCompleted: number;
}

export enum TeamRole {
  LEADER = 'LEADER',
  DEPUTY_LEADER = 'DEPUTY_LEADER',
  MEMBER = 'MEMBER',
  SPECIALIST = 'SPECIALIST',
  TRAINEE = 'TRAINEE'
}

export enum TeamStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  FULL = 'FULL',
  RECRUITING = 'RECRUITING',
  SUSPENDED = 'SUSPENDED'
}

export interface TeamContactInfo {
  phone: string;
  email: string;
  emergencyPhone: string;
  meetingLocation: string;
  meetingTime: string;
}

// Gönüllü istatistikleri
export interface VolunteerStats {
  volunteerId: number;
  totalTasksCompleted: number;
  totalHours: number;
  averageRating: number;
  badgesEarned: number;
  skillsCount: number;
  teamParticipation: number;
  emergencyResponseCount: number;
  consecutiveDays: number;
  monthlyStats: MonthlyStats[];
  skillProgress: SkillProgress[];
}

export interface MonthlyStats {
  month: string;
  tasksCompleted: number;
  hours: number;
  rating: number;
  badgesEarned: number;
}

export interface SkillProgress {
  skillId: number;
  skillName: string;
  currentLevel: SkillLevel;
  progress: number;
  nextLevel: SkillLevel;
  tasksCompleted: number;
  hoursSpent: number;
}
