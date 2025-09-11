import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { 
  Volunteer, 
  VolunteerTask, 
  Badge, 
  VolunteerTeam, 
  VolunteerStats,
  SkillCategory,
  SkillLevel,
  TaskStatus,
  TaskPriority,
  TaskCategory,
  EmergencyLevel,
  BadgeCategory,
  BadgeLevel,
  BadgeRarity,
  TeamRole,
  TeamStatus
} from '../models/volunteer.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class VolunteerService {
  // BehaviorSubjects for reactive state management
  private currentVolunteerSubject = new BehaviorSubject<Volunteer | null>(null);
  private volunteerTasksSubject = new BehaviorSubject<VolunteerTask[]>([]);
  private availableTasksSubject = new BehaviorSubject<VolunteerTask[]>([]);
  private volunteerBadgesSubject = new BehaviorSubject<Badge[]>([]);
  private volunteerTeamSubject = new BehaviorSubject<VolunteerTeam | null>(null);
  private volunteerStatsSubject = new BehaviorSubject<VolunteerStats | null>(null);

  // Public observables
  public currentVolunteer$ = this.currentVolunteerSubject.asObservable();
  public volunteerTasks$ = this.volunteerTasksSubject.asObservable();
  public availableTasks$ = this.availableTasksSubject.asObservable();
  public volunteerBadges$ = this.volunteerBadgesSubject.asObservable();
  public volunteerTeam$ = this.volunteerTeamSubject.asObservable();
  public volunteerStats$ = this.volunteerStatsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {
    console.log('VolunteerService: Constructor called');
    this.loadInitialData();
  }

  private loadInitialData(): void {
    // Load current volunteer data if available
    const storedVolunteer = localStorage.getItem('currentVolunteer');
    if (storedVolunteer) {
      try {
        const volunteer = JSON.parse(storedVolunteer);
        this.currentVolunteerSubject.next(volunteer);
        this.loadVolunteerData(volunteer.id);
      } catch (error) {
        console.error('Error parsing stored volunteer data:', error);
      }
    }
  }

  // ===== VOLUNTEER MANAGEMENT =====
  
  getCurrentVolunteer(): Volunteer | null {
    return this.currentVolunteerSubject.value;
  }

  setCurrentVolunteer(volunteer: Volunteer): void {
    this.currentVolunteerSubject.next(volunteer);
    localStorage.setItem('currentVolunteer', JSON.stringify(volunteer));
  }

  clearCurrentVolunteer(): void {
    this.currentVolunteerSubject.next(null);
    localStorage.removeItem('currentVolunteer');
  }

  getVolunteerById(id: number): Observable<Volunteer> {
    return this.http.get<Volunteer>(this.apiService.getApiUrl(`/users/${id}`)).pipe(
      tap(volunteer => {
        if (volunteer.id === this.getCurrentVolunteer()?.id) {
          this.setCurrentVolunteer(volunteer);
        }
      }),
      catchError(error => {
        console.error('Error fetching volunteer:', error);
        throw error;
      })
    );
  }

  updateVolunteerProfile(volunteer: Partial<Volunteer>): Observable<Volunteer> {
    const currentVolunteer = this.getCurrentVolunteer();
    if (!currentVolunteer) {
      throw new Error('No current volunteer found');
    }

    return this.http.put<Volunteer>(this.apiService.getApiUrl(`/users/${currentVolunteer.id}`), volunteer).pipe(
      tap(updatedVolunteer => {
        this.setCurrentVolunteer(updatedVolunteer);
      }),
      catchError(error => {
        console.error('Error updating volunteer profile:', error);
        throw error;
      })
    );
  }

  // ===== VOLUNTEER SKILLS =====
  
  getVolunteerSkills(volunteerId: number): Observable<any[]> {
    return this.http.get<any[]>(this.apiService.getApiUrl(`/skills`)).pipe(
      catchError(error => {
        console.error('Error fetching volunteer skills:', error);
        throw error;
      })
    );
  }

  updateVolunteerSkills(volunteerId: number, skills: any[]): Observable<any> {
    return this.http.put<any>(this.apiService.getApiUrl(`/users/${volunteerId}/skills`), { skills }).pipe(
      catchError(error => {
        console.error('Error updating volunteer skills:', error);
        throw error;
      })
    );
  }

  // ===== TASK MANAGEMENT =====
  
  getVolunteerTasks(volunteerId: number): Observable<VolunteerTask[]> {
    return this.http.get<VolunteerTask[]>(this.apiService.getApiUrl(`/assignments/my`)).pipe(
      tap(tasks => {
        this.volunteerTasksSubject.next(tasks);
      }),
      catchError(error => {
        console.error('Error fetching volunteer tasks:', error);
        this.volunteerTasksSubject.next([]);
        throw error;
      })
    );
  }

  getAvailableTasks(): Observable<VolunteerTask[]> {
    return this.http.get<VolunteerTask[]>(this.apiService.getApiUrl(`/assignments/volunteers/tasks/available`)).pipe(
      tap(tasks => {
        this.availableTasksSubject.next(tasks);
      }),
      catchError(error => {
        console.error('Error fetching available tasks:', error);
        this.availableTasksSubject.next([]);
        throw error;
      })
    );
  }

  acceptTask(taskId: number): Observable<VolunteerTask> {
    const currentVolunteer = this.getCurrentVolunteer();
    if (!currentVolunteer) {
      throw new Error('No current volunteer found');
    }

    return this.http.post<VolunteerTask>(this.apiService.getApiUrl(`/assignments/${taskId}/status`), {
      status: 'ASSIGNED',
      volunteerId: currentVolunteer.id
    }).pipe(
      tap(updatedTask => {
        // Update local state
        const currentTasks = this.volunteerTasksSubject.value;
        const updatedTasks = currentTasks.map(task => 
          task.id === taskId ? updatedTask : task
        );
        this.volunteerTasksSubject.next(updatedTasks);

        // Remove from available tasks
        const currentAvailable = this.availableTasksSubject.value;
        const updatedAvailable = currentAvailable.filter(task => task.id !== taskId);
        this.availableTasksSubject.next(updatedAvailable);
      }),
      catchError(error => {
        console.error('Error accepting task:', error);
        throw error;
      })
    );
  }

  updateTaskStatus(taskId: number, status: TaskStatus, notes?: string): Observable<VolunteerTask> {
    return this.http.put<VolunteerTask>(this.apiService.getApiUrl(`/assignments/${taskId}/status`), {
      status,
      notes,
      updatedAt: new Date()
    }).pipe(
      tap(updatedTask => {
        // Update local state
        const currentTasks = this.volunteerTasksSubject.value;
        const updatedTasks = currentTasks.map(task => 
          task.id === taskId ? updatedTask : task
        );
        this.volunteerTasksSubject.next(updatedTasks);
      }),
      catchError(error => {
        console.error('Error updating task status:', error);
        throw error;
      })
    );
  }

  // ===== BADGE SYSTEM =====
  
  getVolunteerBadges(volunteerId: number): Observable<Badge[]> {
    return this.http.get<Badge[]>(this.apiService.getApiUrl(`/admin/badges`)).pipe(
      map(badges => {
        // Filter badges for the specific volunteer
        // Since the backend might return all badges, we filter by volunteer
        return badges.filter(badge => {
          // Check if badge has volunteer information or if it's a general badge
          return true; // For now, return all badges until backend structure is clear
        });
      }),
      tap(badges => {
        this.volunteerBadgesSubject.next(badges);
      }),
      catchError(error => {
        console.error('Error fetching volunteer badges:', error);
        this.volunteerBadgesSubject.next([]);
        throw error;
      })
    );
  }

  checkAndAwardBadges(volunteerId: number): Observable<Badge[]> {
    return this.http.post<Badge[]>(this.apiService.getApiUrl(`/admin/badges/check`), {
      volunteerId
    }).pipe(
      tap(newBadges => {
        if (newBadges.length > 0) {
          const currentBadges = this.volunteerBadgesSubject.value;
          this.volunteerBadgesSubject.next([...currentBadges, ...newBadges]);
        }
      }),
      catchError(error => {
        console.error('Error checking badges:', error);
        throw error;
      })
    );
  }

  // ===== TEAM MANAGEMENT =====
  
  getVolunteerTeam(volunteerId: number): Observable<VolunteerTeam | null> {
    // For now, we'll return null as team management might be handled differently
    // This can be updated when team endpoints are available
    this.volunteerTeamSubject.next(null);
    return of(null);
  }

  joinTeam(teamId: number): Observable<VolunteerTeam> {
    const currentVolunteer = this.getCurrentVolunteer();
    if (!currentVolunteer) {
      throw new Error('No current volunteer found');
    }

    // This will need to be implemented when team endpoints are available
    throw new Error('Team joining not yet implemented');
  }

  // ===== STATISTICS =====
  
  getVolunteerStats(volunteerId: number): Observable<VolunteerStats> {
    return this.http.get<any>(this.apiService.getApiUrl(`/admin/statistics`)).pipe(
      map(stats => {
        // Transform admin statistics to volunteer-specific stats
        return {
          volunteerId,
          totalTasksCompleted: stats.totalTasksCompleted || 0,
          totalHours: stats.totalHours || 0,
          averageRating: stats.averageRating || 0,
          badgesEarned: stats.badgesEarned || 0,
          skillsCount: stats.skillsCount || 0,
          teamParticipation: stats.teamParticipation || 0,
          emergencyResponseCount: stats.emergencyResponseCount || 0,
          consecutiveDays: stats.consecutiveDays || 0,
          monthlyStats: stats.monthlyStats || [],
          skillProgress: stats.skillProgress || []
        };
      }),
      tap(stats => {
        this.volunteerStatsSubject.next(stats);
      }),
      catchError(error => {
        console.error('Error fetching volunteer stats:', error);
        // Return default stats
        const defaultStats: VolunteerStats = {
          volunteerId,
          totalTasksCompleted: 0,
          totalHours: 0,
          averageRating: 0,
          badgesEarned: 0,
          skillsCount: 0,
          teamParticipation: 0,
          emergencyResponseCount: 0,
          consecutiveDays: 0,
          monthlyStats: [],
          skillProgress: []
        };
        this.volunteerStatsSubject.next(defaultStats);
        return of(defaultStats);
      })
    );
  }

  // ===== HELP REQUESTS =====
  
  getVolunteerHelpRequests(volunteerId: number): Observable<any[]> {
    return this.http.get<any[]>(this.apiService.getApiUrl(`/help-requests`)).pipe(
      map(requests => {
        // Filter requests that the volunteer can help with
        return requests.filter(request => 
          request.status === 'PENDING' || request.status === 'ASSIGNED'
        );
      }),
      catchError(error => {
        console.error('Error fetching help requests:', error);
        throw error;
      })
    );
  }

  // ===== LOCATIONS =====
  
  getVolunteerLocations(): Observable<any[]> {
    return this.http.get<any[]>(this.apiService.getApiUrl(`/locations`)).pipe(
      catchError(error => {
        console.error('Error fetching locations:', error);
        throw error;
      })
    );
  }

  // ===== SAFE ZONES =====
  
  getNearbySafeZones(latitude: number, longitude: number, radius: number = 10): Observable<any[]> {
    const params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString())
      .set('radius', radius.toString());
    
    return this.http.get<any[]>(this.apiService.getApiUrl(`/safezones/nearby`), { params }).pipe(
      catchError(error => {
        console.error('Error fetching nearby safe zones:', error);
        throw error;
      })
    );
  }

  // ===== NOTIFICATIONS =====
  
  getVolunteerNotifications(volunteerId: number): Observable<any[]> {
    return this.http.get<any[]>(this.apiService.getApiUrl(`/notifications/history/${volunteerId}`)).pipe(
      catchError(error => {
        console.error('Error fetching notifications:', error);
        throw error;
      })
    );
  }

  // ===== REAL-TIME UPDATES =====
  
  refreshAllData(): void {
    const currentVolunteer = this.getCurrentVolunteer();
    if (currentVolunteer) {
      this.loadVolunteerData(currentVolunteer.id);
    }
  }

  private loadVolunteerData(volunteerId: number): void {
    // Load all volunteer data
    this.getVolunteerTasks(volunteerId).subscribe({
      error: (error) => console.error('Error loading volunteer tasks:', error)
    });
    this.getVolunteerBadges(volunteerId).subscribe({
      error: (error) => console.error('Error loading volunteer badges:', error)
    });
    this.getVolunteerTeam(volunteerId).subscribe({
      error: (error) => console.error('Error loading volunteer team:', error)
    });
    this.getVolunteerStats(volunteerId).subscribe({
      error: (error) => console.error('Error loading volunteer stats:', error)
    });
  }
}
