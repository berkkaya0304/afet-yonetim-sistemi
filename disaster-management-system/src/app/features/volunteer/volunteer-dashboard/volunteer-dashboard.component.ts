import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { VolunteerService } from '../../../core/services/volunteer.service';
import { NavigationGuardService } from '../../../core/services/navigation-guard.service';
import { Volunteer, VolunteerTask, Badge, VolunteerTeam, VolunteerStats } from '../../../core/models/volunteer.model';

@Component({
  selector: 'app-volunteer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="volunteer-dashboard">
      <!-- Error Display -->
      @if (hasError) {
        <div class="error-banner">
          <span class="error-icon">⚠️</span>
          <span class="error-text">{{ errorMessage }}</span>
          <button (click)="hasError = false" class="error-close">✕</button>
        </div>
      }

      <!-- Header -->
      <div class="dashboard-header">
        <div class="welcome-section">
          <h1>Hoş Geldin, {{ currentVolunteer?.firstName || 'Gönüllü' }}! 👋</h1>
          <p class="welcome-text">Bugün topluma nasıl yardım edebiliriz?</p>
        </div>
        <div class="quick-actions">
          <button routerLink="/volunteer/tasks" class="btn btn-primary">
            <span>📋</span> Görevleri Gör
          </button>
          <button routerLink="/volunteer/map" class="btn btn-secondary">
            <span>🗺️</span> Haritayı Aç
          </button>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            @if (isLoadingStats) {
              <div class="loading-spinner">⏳</div>
            } @else {
              <h3>{{ volunteerStats?.totalTasksCompleted || 0 }}</h3>
            }
            <p>Tamamlanan Görev</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-content">
            @if (isLoadingStats) {
              <div class="loading-spinner">⏳</div>
            } @else {
              <h3>{{ volunteerStats?.totalHours || 0 }}</h3>
            }
            <p>Toplam Saat</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            @if (isLoadingStats) {
              <div class="loading-spinner">⏳</div>
            } @else {
              <h3>{{ volunteerStats?.averageRating || 0 }}/5</h3>
            }
            <p>Ortalama Puan</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-content">
            @if (isLoadingStats) {
              <div class="loading-spinner">⏳</div>
            } @else {
              <h3>{{ volunteerStats?.badgesEarned || 0 }}</h3>
            }
            <p>Kazanılan Rozet</p>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="dashboard-grid">
        <!-- Current Tasks -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>🔄 Aktif Görevler</h3>
            <button routerLink="/volunteer/tasks" class="btn-link">Tümünü Gör</button>
          </div>
          <div class="card-content">
            @if (isLoadingTasks) {
              <div class="loading-state">
                <div class="loading-spinner">⏳</div>
                <p>Görevler yükleniyor...</p>
              </div>
            } @else if (currentTasks.length > 0) {
              @for (task of currentTasks; track task.id) {
                <div class="task-item">
                  <div class="task-info">
                    <h4>{{ task.title }}</h4>
                    <p>{{ task.description }}</p>
                    <div class="task-meta">
                      <span class="task-category">{{ getTaskCategoryLabel(task.category) }}</span>
                      <span class="task-priority priority-{{ task.priority.toLowerCase() }}">
                        {{ getTaskPriorityLabel(task.priority) }}
                      </span>
                    </div>
                  </div>
                  <div class="task-actions">
                    <button (click)="updateTaskStatus(task.id, 'IN_PROGRESS')" 
                            class="btn btn-sm btn-primary"
                            [disabled]="task.status === 'IN_PROGRESS'">
                      {{ task.status === 'IN_PROGRESS' ? 'Devam Ediyor' : 'Başla' }}
                    </button>
                  </div>
                </div>
              }
            } @else {
              <div class="empty-state">
                <span class="empty-icon">📋</span>
                <p>Aktif görevin bulunmuyor</p>
                <button routerLink="/volunteer/tasks" class="btn btn-primary">
                  Görev Ara
                </button>
              </div>
            }
          </div>
        </div>

        <!-- Available Tasks -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>🎯 Müsait Görevler</h3>
            <button routerLink="/volunteer/tasks" class="btn-link">Tümünü Gör</button>
          </div>
          <div class="card-content">
            @if (isLoadingAvailableTasks) {
              <div class="loading-state">
                <div class="loading-spinner">⏳</div>
                <p>Müsait görevler yükleniyor...</p>
              </div>
            } @else if (availableTasks.length > 0) {
              @for (task of availableTasks.slice(0, 3); track task.id) {
                <div class="task-item">
                  <div class="task-info">
                    <h4>{{ task.title }}</h4>
                    <p>{{ task.description }}</p>
                    <div class="task-meta">
                      <span class="task-category">{{ getTaskCategoryLabel(task.category) }}</span>
                      <span class="task-priority priority-{{ task.priority.toLowerCase() }}">
                        {{ getTaskPriorityLabel(task.priority) }}
                      </span>
                    </div>
                  </div>
                  <div class="task-actions">
                    <button (click)="acceptTask(task.id)" class="btn btn-sm btn-success">
                      Görevi Üstlen
                    </button>
                  </div>
                </div>
              }
              @if (availableTasks.length > 3) {
                <div class="more-tasks">
                  <p>+{{ availableTasks.length - 3 }} görev daha</p>
                  <button routerLink="/volunteer/tasks" class="btn btn-outline">
                    Tümünü Gör
                  </button>
                </div>
              }
            } @else {
              <div class="empty-state">
                <span class="empty-icon">🎯</span>
                <p>Şu anda müsait görev yok</p>
                <p class="empty-note">Daha sonra tekrar kontrol et</p>
              </div>
            }
          </div>
        </div>

        <!-- Recent Badges -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>🏆 Son Kazanılan Rozetler</h3>
            <button routerLink="/volunteer/badges" class="btn-link">Tümünü Gör</button>
          </div>
          <div class="card-content">
            @if (isLoadingBadges) {
              <div class="loading-state">
                <div class="loading-spinner">⏳</div>
                <p>Rozetler yükleniyor...</p>
              </div>
            } @else if (recentBadges.length > 0) {
              @for (badge of recentBadges.slice(0, 3); track badge.id) {
                <div class="badge-item">
                  <div class="badge-icon">{{ badge.icon }}</div>
                  <div class="badge-info">
                    <h4>{{ badge.name }}</h4>
                    <p>{{ badge.description }}</p>
                    <span class="badge-level level-{{ badge.level.toLowerCase() }}">
                      {{ getBadgeLevelLabel(badge.level) }}
                    </span>
                  </div>
                </div>
              }
            } @else {
              <div class="empty-state">
                <span class="empty-icon">🏆</span>
                <p>Henüz rozet kazanmadın</p>
                <p class="empty-note">Görevleri tamamlayarak rozet kazan</p>
              </div>
            }
          </div>
        </div>

        <!-- Team Info -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>👥 Ekibin</h3>
            <button routerLink="/volunteer/teams" class="btn-link">Detaylar</button>
          </div>
          <div class="card-content">
            @if (isLoadingTeam) {
              <div class="loading-state">
                <div class="loading-spinner">⏳</div>
                <p>Ekip bilgileri yükleniyor...</p>
              </div>
            } @else if (volunteerTeam) {
              <div class="team-info">
                <h4>{{ volunteerTeam.name }}</h4>
                <p>{{ volunteerTeam.description }}</p>
                <div class="team-stats">
                  <span class="team-stat">
                    <strong>{{ volunteerTeam.currentMembers }}</strong> üye
                  </span>
                  <span class="team-stat">
                    <strong>{{ volunteerTeam.totalTasksCompleted }}</strong> görev
                  </span>
                  <span class="team-stat">
                    <strong>{{ volunteerTeam.rating }}/5</strong> puan
                  </span>
                </div>
                <div class="team-actions">
                  <button routerLink="/volunteer/teams" class="btn btn-sm btn-outline">
                    Ekip Detayları
                  </button>
                </div>
              </div>
            } @else {
              <div class="empty-state">
                <span class="empty-icon">👥</span>
                <p>Henüz bir ekibe katılmadın</p>
                <button routerLink="/volunteer/teams" class="btn btn-primary">
                  Ekip Ara
                </button>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Quick Actions Footer -->
      <div class="quick-actions-footer">
        <h3>🚀 Hızlı Erişim</h3>
        <div class="action-buttons">
          <button routerLink="/volunteer/profile" class="action-btn">
            <span class="action-icon">👤</span>
            <span class="action-text">Profilimi Düzenle</span>
          </button>
          <button routerLink="/volunteer/map" class="action-btn">
            <span class="action-icon">🗺️</span>
            <span class="action-text">Haritayı Aç</span>
          </button>
          <button routerLink="/volunteer/tasks" class="action-btn">
            <span class="action-icon">📋</span>
            <span class="action-text">Görevleri Gör</span>
          </button>
          <button routerLink="/volunteer/badges" class="action-btn">
            <span class="action-icon">🏆</span>
            <span class="action-text">Rozetlerim</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .volunteer-dashboard {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      color: white;
    }

    .welcome-section h1 {
      margin: 0 0 8px 0;
      font-size: 2.5em;
      font-weight: 700;
    }

    .welcome-text {
      margin: 0;
      font-size: 1.2em;
      opacity: 0.9;
    }

    .quick-actions {
      display: flex;
      gap: 12px;
    }

    .stats-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      display: flex;
      align-items: center;
      padding: 24px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      border: 1px solid #e2e8f0;
    }

    .stat-icon {
      font-size: 2.5em;
      margin-right: 20px;
    }

    .stat-content h3 {
      margin: 0 0 4px 0;
      font-size: 2em;
      font-weight: 700;
      color: #1e293b;
    }

    .stat-content p {
      margin: 0;
      color: #64748b;
      font-weight: 500;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .dashboard-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .card-header h3 {
      margin: 0;
      color: #1e293b;
      font-size: 1.3em;
    }

    .card-content {
      padding: 24px;
    }

    .task-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 16px 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .task-item:last-child {
      border-bottom: none;
    }

    .task-info h4 {
      margin: 0 0 8px 0;
      color: #1e293b;
      font-size: 1.1em;
    }

    .task-info p {
      margin: 0 0 12px 0;
      color: #64748b;
      font-size: 0.9em;
    }

    .task-meta {
      display: flex;
      gap: 8px;
    }

    .task-category {
      background: #e0f2fe;
      color: #0277bd;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8em;
      font-weight: 500;
    }

    .task-priority {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8em;
      font-weight: 600;
    }

    .priority-low { background: #dcfce7; color: #166534; }
    .priority-medium { background: #fef3c7; color: #92400e; }
    .priority-high { background: #fed7aa; color: #c2410c; }
    .priority-critical { background: #fee2e2; color: #991b1b; }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #64748b;
    }

    .empty-icon {
      font-size: 3em;
      display: block;
      margin-bottom: 16px;
    }

    .empty-note {
      font-size: 0.9em;
      margin-top: 8px;
      opacity: 0.7;
    }

    .more-tasks {
      text-align: center;
      padding: 20px;
      border-top: 1px solid #f1f5f9;
    }

    .badge-item {
      display: flex;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .badge-item:last-child {
      border-bottom: none;
    }

    .badge-icon {
      font-size: 2em;
      margin-right: 16px;
    }

    .badge-info h4 {
      margin: 0 0 4px 0;
      color: #1e293b;
      font-size: 1em;
    }

    .badge-info p {
      margin: 0 0 8px 0;
      color: #64748b;
      font-size: 0.85em;
    }

    .badge-level {
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 0.75em;
      font-weight: 600;
    }

    .level-bronze { background: #cd7f32; color: white; }
    .level-silver { background: #c0c0c0; color: white; }
    .level-gold { background: #ffd700; color: #1e293b; }
    .level-platinum { background: #e5e4e2; color: #1e293b; }
    .level-diamond { background: #b9f2ff; color: #1e293b; }

    .team-info h4 {
      margin: 0 0 8px 0;
      color: #1e293b;
      font-size: 1.2em;
    }

    .team-info p {
      margin: 0 0 16px 0;
      color: #64748b;
    }

    .team-stats {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
    }

    .team-stat {
      background: #f8fafc;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 0.9em;
      color: #475569;
    }

    .quick-actions-footer {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      border: 1px solid #e2e8f0;
    }

    .quick-actions-footer h3 {
      margin: 0 0 20px 0;
      text-align: center;
      color: #1e293b;
    }

    .action-buttons {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      color: inherit;
    }

    .action-btn:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
      transform: translateY(-2px);
    }

    .action-icon {
      font-size: 2em;
      margin-bottom: 8px;
    }

    .action-text {
      font-weight: 600;
      color: #475569;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover {
      background: #2563eb;
    }

    .btn-secondary {
      background: #6b7280;
      color: white;
    }

    .btn-secondary:hover {
      background: #4b5563;
    }

    .btn-success {
      background: #10b981;
      color: white;
    }

    .btn-success:hover {
      background: #059669;
    }

    .btn-outline {
      background: transparent;
      color: #3b82f6;
      border: 2px solid #3b82f6;
    }

    .btn-outline:hover {
      background: #3b82f6;
      color: white;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 0.9em;
    }

    .btn-link {
      background: none;
      border: none;
      color: #3b82f6;
      cursor: pointer;
      font-weight: 500;
      text-decoration: underline;
    }

    .btn-link:hover {
      color: #2563eb;
    }

    .loading-state {
      text-align: center;
      padding: 40px 20px;
      color: #64748b;
    }

    .loading-spinner {
      font-size: 2em;
      margin-bottom: 16px;
    }

    .error-banner {
      background-color: #fee2e2;
      color: #991b1b;
      padding: 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      border: 1px solid #fda4a4;
    }

    .error-icon {
      font-size: 1.5em;
    }

    .error-text {
      flex-grow: 1;
    }

    .error-close {
      background: none;
      border: none;
      color: #991b1b;
      font-size: 1.5em;
      cursor: pointer;
      padding: 0;
    }

    @media (max-width: 768px) {
      .volunteer-dashboard {
        padding: 16px;
      }

      .dashboard-header {
        flex-direction: column;
        text-align: center;
        gap: 20px;
      }

      .welcome-section h1 {
        font-size: 2em;
      }

      .stats-overview {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }

      .dashboard-grid {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }
    }
  `]
})
export class VolunteerDashboardComponent implements OnInit, OnDestroy {
  currentVolunteer: Volunteer | null = null;
  currentTasks: VolunteerTask[] = [];
  availableTasks: VolunteerTask[] = [];
  recentBadges: Badge[] = [];
  volunteerTeam: VolunteerTeam | null = null;
  volunteerStats: VolunteerStats | null = null;

  // Loading states
  isLoadingTasks = false;
  isLoadingAvailableTasks = false;
  isLoadingBadges = false;
  isLoadingTeam = false;
  isLoadingStats = false;

  // Error states
  hasError = false;
  errorMessage = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private volunteerService: VolunteerService,
    private navigationGuardService: NavigationGuardService
  ) {}

  ngOnInit(): void {
    this.loadVolunteerData();
    
    // Ensure navigation guard is active for this component
    this.navigationGuardService.preventBackNavigation();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadVolunteerData(): void {
    // Load current volunteer
    this.subscriptions.push(
      this.volunteerService.currentVolunteer$.subscribe(volunteer => {
        this.currentVolunteer = volunteer;
        if (volunteer) {
          this.loadVolunteerSpecificData(volunteer.id);
        }
      })
    );

    // Load volunteer tasks with real-time updates
    this.subscriptions.push(
      this.volunteerService.volunteerTasks$.subscribe(tasks => {
        this.currentTasks = tasks.filter(task => 
          task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS'
        );
        this.isLoadingTasks = false;
      })
    );

    // Load available tasks with real-time updates
    this.subscriptions.push(
      this.volunteerService.availableTasks$.subscribe(tasks => {
        this.availableTasks = tasks;
        this.isLoadingAvailableTasks = false;
      })
    );

    // Load volunteer badges with real-time updates
    this.subscriptions.push(
      this.volunteerService.volunteerBadges$.subscribe(badges => {
        this.recentBadges = badges.sort((a, b) => 
          new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
        );
        this.isLoadingBadges = false;
      })
    );

    // Load volunteer team with real-time updates
    this.subscriptions.push(
      this.volunteerService.volunteerTeam$.subscribe(team => {
        this.volunteerTeam = team;
        this.isLoadingTeam = false;
      })
    );

    // Load volunteer stats with real-time updates
    this.subscriptions.push(
      this.volunteerService.volunteerStats$.subscribe(stats => {
        this.volunteerStats = stats;
        this.isLoadingStats = false;
      })
    );

    // Set up periodic refresh for real-time updates
    this.setupPeriodicRefresh();
  }

  private setupPeriodicRefresh(): void {
    // Refresh data every 30 seconds for real-time updates
    const refreshInterval = setInterval(() => {
      const currentVolunteer = this.volunteerService.getCurrentVolunteer();
      if (currentVolunteer) {
        this.volunteerService.getVolunteerTasks(currentVolunteer.id).subscribe({
          error: (error) => {
            console.error('Error refreshing tasks:', error);
            this.handleError('Görevler yenilenirken hata oluştu');
          }
        });
        this.volunteerService.getAvailableTasks().subscribe({
          error: (error) => {
            console.error('Error refreshing available tasks:', error);
            this.handleError('Müsait görevler yenilenirken hata oluştu');
          }
        });
        this.volunteerService.getVolunteerStats(currentVolunteer.id).subscribe({
          error: (error) => {
            console.error('Error refreshing stats:', error);
            this.handleError('İstatistikler yenilenirken hata oluştu');
          }
        });
      }
    }, 30000); // 30 seconds

    // Store interval ID for cleanup
    this.subscriptions.push({
      unsubscribe: () => clearInterval(refreshInterval)
    } as Subscription);
  }

  private loadVolunteerSpecificData(volunteerId: number): void {
    // Set loading states
    this.isLoadingTasks = true;
    this.isLoadingAvailableTasks = true;
    this.isLoadingBadges = true;
    this.isLoadingTeam = true;
    this.isLoadingStats = true;
    this.hasError = false;
    this.errorMessage = '';

    // Load all volunteer-specific data with error handling
    this.volunteerService.getVolunteerTasks(volunteerId).subscribe({
      error: (error) => {
        console.error('Error loading volunteer tasks:', error);
        this.handleError('Görevler yüklenirken hata oluştu');
        this.isLoadingTasks = false;
      }
    });
    this.volunteerService.getAvailableTasks().subscribe({
      error: (error) => {
        console.error('Error loading available tasks:', error);
        this.handleError('Müsait görevler yüklenirken hata oluştu');
        this.isLoadingAvailableTasks = false;
      }
    });
    this.volunteerService.getVolunteerBadges(volunteerId).subscribe({
      error: (error) => {
        console.error('Error loading volunteer badges:', error);
        this.handleError('Rozetler yüklenirken hata oluştu');
        this.isLoadingBadges = false;
      }
    });
    this.volunteerService.getVolunteerTeam(volunteerId).subscribe({
      error: (error) => {
        console.error('Error loading volunteer team:', error);
        this.handleError('Ekip bilgileri yüklenirken hata oluştu');
        this.isLoadingTeam = false;
      }
    });
    this.volunteerService.getVolunteerStats(volunteerId).subscribe({
      error: (error) => {
        console.error('Error loading volunteer stats:', error);
        this.handleError('İstatistikler yüklenirken hata oluştu');
        this.isLoadingStats = false;
      }
    });
  }

  private handleError(message: string): void {
    this.hasError = true;
    this.errorMessage = message;
    // Clear error after 5 seconds
    setTimeout(() => {
      this.hasError = false;
      this.errorMessage = '';
    }, 5000);
  }

  acceptTask(taskId: number): void {
    this.volunteerService.acceptTask(taskId).subscribe({
      next: (task) => {
        console.log('Task accepted:', task);
        this.hasError = false;
        this.errorMessage = '';
      },
      error: (error) => {
        console.error('Error accepting task:', error);
        this.handleError('Görev kabul edilirken hata oluştu');
      }
    });
  }

  updateTaskStatus(taskId: number, status: string): void {
    this.volunteerService.updateTaskStatus(taskId, status as any).subscribe({
      next: (task) => {
        console.log('Task status updated:', task);
        this.hasError = false;
        this.errorMessage = '';
      },
      error: (error) => {
        console.error('Error updating task status:', error);
        this.handleError('Görev durumu güncellenirken hata oluştu');
      }
    });
  }

  // Helper methods for labels
  getTaskCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'SEARCH_RESCUE': 'Arama Kurtarma',
      'MEDICAL_AID': 'Tıbbi Yardım',
      'TRANSPORTATION': 'Ulaşım',
      'DISTRIBUTION': 'Dağıtım',
      'COMMUNICATION': 'İletişim',
      'LOGISTICS': 'Lojistik',
      'CONSTRUCTION': 'İnşaat',
      'PSYCHOLOGICAL_SUPPORT': 'Psikolojik Destek',
      'ADMINISTRATIVE': 'İdari',
      'OTHER': 'Diğer'
    };
    return labels[category] || category;
  }

  getTaskPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      'LOW': 'Düşük',
      'MEDIUM': 'Orta',
      'HIGH': 'Yüksek',
      'CRITICAL': 'Kritik'
    };
    return labels[priority] || priority;
  }

  getBadgeLevelLabel(level: string): string {
    const labels: { [key: string]: string } = {
      'BRONZE': 'Bronz',
      'SILVER': 'Gümüş',
      'GOLD': 'Altın',
      'PLATINUM': 'Platin',
      'DIAMOND': 'Elmas'
    };
    return labels[level] || level;
  }
}
