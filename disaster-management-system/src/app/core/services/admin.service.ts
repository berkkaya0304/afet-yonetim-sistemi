import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User } from '../models/user.model';

export interface AdminStatistics {
  totalHelpRequests: number;
  activeVolunteers: number;
  completedTasks: number;
  safeZones: number;
  pendingRequests: number;
  totalUsers: number;
}

export interface Announcement {
  id?: string;
  type: 'INFO' | 'WARNING' | 'EMERGENCY';
  title: string;
  message: string;
  location?: string;
  createdAt?: Date;
  isActive?: boolean;
}

export interface SafeZone {
  id?: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  capacity: number;
  currentOccupancy: number;
  isActive: boolean;
  type: 'SHELTER' | 'DISTRIBUTION' | 'MEDICAL' | 'COORDINATION';
  address: string;
}



export interface HelpRequest {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  location: string;
  latitude: number;
  longitude: number;
  requesterId: string;
  requesterName: string;
  assignedVolunteerId?: string;
  assignedVolunteerName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  location: string;
  latitude: number;
  longitude: number;
  assignedVolunteerId: string;
  assignedVolunteerName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  level: string;
  rarity: string;
  points: number;
  criteria: {
    type: string;
    value: number;
    description: string;
  };
  earnedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  // Dashboard Statistics
  getDashboardStatistics(): Observable<AdminStatistics> {
    return this.http.get<AdminStatistics>(this.apiService.getApiUrl('/admin/statistics'));
  }

  // Announcements
  createAnnouncement(announcement: Announcement): Observable<Announcement> {
    return this.http.post<Announcement>(this.apiService.getApiUrl('/admin/announcements'), announcement);
  }

  getAnnouncements(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(this.apiService.getApiUrl('/admin/announcements'));
  }

  updateAnnouncement(id: string, announcement: Partial<Announcement>): Observable<Announcement> {
    return this.http.put<Announcement>(this.apiService.getApiUrl(`/admin/announcements/${id}`), announcement);
  }

  deleteAnnouncement(id: string): Observable<void> {
    return this.http.delete<void>(this.apiService.getApiUrl(`/admin/announcements/${id}`));
  }

  // SafeZones
  getSafeZones(): Observable<SafeZone[]> {
    return this.http.get<SafeZone[]>(this.apiService.getApiUrl('/admin/safezones'));
  }

  createSafeZone(safeZone: SafeZone): Observable<SafeZone> {
    return this.http.post<SafeZone>(this.apiService.getApiUrl('/admin/safezones'), safeZone);
  }

  updateSafeZone(id: string, safeZone: Partial<SafeZone>): Observable<SafeZone> {
    return this.http.put<SafeZone>(this.apiService.getApiUrl(`/admin/safezones/${id}`), safeZone);
  }

  deleteSafeZone(id: string): Observable<void> {
    return this.http.delete<void>(this.apiService.getApiUrl(`/admin/safezones/${id}`));
  }

  activateSafeZone(id: string): Observable<SafeZone> {
    return this.http.put<SafeZone>(this.apiService.getApiUrl(`/admin/safezones/${id}/activate`), {});
  }

  deactivateSafeZone(id: string): Observable<SafeZone> {
    return this.http.put<SafeZone>(this.apiService.getApiUrl(`/admin/safezones/${id}/deactivate`), {});
  }

  bulkActivateSafeZones(ids: string[]): Observable<void> {
    return this.http.put<void>(this.apiService.getApiUrl('/admin/safezones/bulk/activate'), { ids });
  }

  bulkDeactivateSafeZones(ids: string[]): Observable<void> {
    return this.http.put<void>(this.apiService.getApiUrl('/admin/safezones/bulk/deactivate'), { ids });
  }

  // Users
  getAllUsers(): Observable<User[]> {
    return this.http.get<any[]>(this.apiService.getApiUrl('/admin/users/all')).pipe(
      map((users: any[]) => users.map((user: any) => ({
        ...user,
        created_at: user.created_at ? new Date(user.created_at) : new Date(),
        phone: user.phone_number || user.phone || '',
        location: this.getUserLocation(user),
        skills: user.skills || [],
        isActive: user.isActive !== undefined ? user.isActive : true
      })))
    );
  }

  private getUserLocation(user: any): string {
    // If user has a location, return it
    if (user.location) {
      return user.location;
    }
    
    // If user has coordinates, create a location string
    if (user.latitude && user.longitude) {
      return `Koordinat: ${user.latitude}, ${user.longitude}`;
    }
    
    // If user has last known location ID, return it
    if (user.last_known_location_id) {
      return `Konum ID: ${user.last_known_location_id}`;
    }
    
    // Default to Ankara, Turkey center
    return 'Ankara, Türkiye Merkezi';
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(this.apiService.getApiUrl(`/users/${id}`));
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(this.apiService.getApiUrl(`/users/${id}`), user);
  }

  deactivateUser(id: number): Observable<void> {
    return this.http.put<void>(this.apiService.getApiUrl(`/users/${id}/deactivate`), {});
  }

  // Help Requests
  getHelpRequests(status?: string): Observable<HelpRequest[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<HelpRequest[]>(this.apiService.getApiUrl('/help-requests'), { params });
  }

  updateHelpRequestStatus(id: string, status: string): Observable<HelpRequest> {
    return this.http.put<HelpRequest>(this.apiService.getApiUrl(`/help-requests/admin/${id}/status`), { status });
  }

  assignVolunteerToRequest(requestId: string, volunteerId: string): Observable<HelpRequest> {
    return this.http.put<HelpRequest>(this.apiService.getApiUrl(`/help-requests/${requestId}/assign`), { volunteerId });
  }

  // Assignments
  getAssignments(status?: string): Observable<Assignment[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Assignment[]>(this.apiService.getApiUrl('/assignments'), { params });
  }

  createAssignment(assignment: Partial<Assignment>): Observable<Assignment> {
    return this.http.post<Assignment>(this.apiService.getApiUrl('/assignments'), assignment);
  }

  updateAssignment(id: string, assignment: Partial<Assignment>): Observable<Assignment> {
    return this.http.put<Assignment>(this.apiService.getApiUrl(`/assignments/${id}`), assignment);
  }

  updateAssignmentStatus(id: string, status: string): Observable<Assignment> {
    return this.http.put<Assignment>(this.apiService.getApiUrl(`/assignments/${id}/status`), { status });
  }

  deleteAssignment(id: string): Observable<void> {
    return this.http.delete<void>(this.apiService.getApiUrl(`/assignments/${id}`));
  }

  // Badges
  getBadges(): Observable<Badge[]> {
    return this.http.get<Badge[]>(this.apiService.getApiUrl('/admin/badges'));
  }

  createBadge(badge: Partial<Badge>): Observable<Badge> {
    return this.http.post<Badge>(this.apiService.getApiUrl('/admin/badges'), badge);
  }

  updateBadge(id: number, badge: Partial<Badge>): Observable<Badge> {
    return this.http.put<Badge>(this.apiService.getApiUrl(`/admin/badges/${id}`), badge);
  }

  deleteBadge(id: number): Observable<void> {
    return this.http.delete<void>(this.apiService.getApiUrl(`/admin/badges/${id}`));
  }

  awardBadge(userId: number, badgeId: number): Observable<void> {
    return this.http.post<void>(this.apiService.getApiUrl('/admin/badges/award'), { userId, badgeId });
  }

  // Volunteer Management
  getVolunteers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiService.getApiUrl('/admin/volunteers'));
  }

  assignBadgeToVolunteer(volunteerId: number, badgeId: number, note?: string): Observable<void> {
    return this.http.post<void>(this.apiService.getApiUrl('/admin/badges/assign'), { 
      userId: volunteerId, 
      badgeId, 
      note 
    });
  }

  getVolunteerBadges(volunteerId: number): Observable<Badge[]> {
    return this.http.get<Badge[]>(this.apiService.getApiUrl(`/admin/volunteers/${volunteerId}/badges`));
  }

  // Skills
  getSkills(): Observable<any[]> {
    return this.http.get<any[]>(this.apiService.getApiUrl('/skills'));
  }

  getUserSkills(userId: number): Observable<any[]> {
    return this.http.get<any[]>(this.apiService.getApiUrl(`/skills/users/${userId}/skills`));
  }

  addUserSkill(userId: number, skillId: number): Observable<void> {
    return this.http.post<void>(this.apiService.getApiUrl(`/skills/users/${userId}/skills/${skillId}`), {});
  }

  createSkill(skill: any): Observable<any> {
    return this.http.post<any>(this.apiService.getApiUrl('/skills'), skill);
  }

  removeUserSkill(userId: string, skillId: string): Observable<void> {
    return this.http.delete<void>(this.apiService.getApiUrl(`/skills/users/${userId}/skills/${skillId}`));
  }

  updateUserSkill(userId: number, skillId: number, skillData: any): Observable<any> {
    return this.http.put<any>(this.apiService.getApiUrl(`/skills/users/${userId}/skills/${skillId}`), skillData);
  }

  // Locations
  getLocations(): Observable<any[]> {
    return this.http.get<any[]>(this.apiService.getApiUrl('/locations'));
  }

  getLocationById(id: string): Observable<any> {
    return this.http.get<any>(this.apiService.getApiUrl(`/locations/${id}`));
  }

  // Notifications
  getNotificationHistory(userId: string): Observable<any[]> {
    return this.http.get<any[]>(this.apiService.getApiUrl(`/notifications/history/${userId}`));
  }

  markNotificationAsRead(notificationId: string): Observable<void> {
    return this.http.put<void>(this.apiService.getApiUrl(`/notifications/mark-read/${notificationId}`), {});
  }

  markAllNotificationsAsRead(userId: string): Observable<void> {
    return this.http.put<void>(this.apiService.getApiUrl(`/notifications/mark-all-read/${userId}`), {});
  }

  updateNotificationPreferences(userId: string, preferences: any): Observable<void> {
    return this.http.put<void>(this.apiService.getApiUrl(`/notifications/preferences/${userId}`), preferences);
  }
}
