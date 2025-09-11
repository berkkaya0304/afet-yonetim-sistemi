import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { VolunteerService } from '../../../core/services/volunteer.service';
import { VolunteerTeam, TeamRole, TeamStatus, SkillCategory } from '../../../core/models/volunteer.model';

@Component({
  selector: 'app-volunteer-teams',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="volunteer-teams">
      <!-- Header -->
      <div class="teams-header">
        <h1>👥 Gönüllü Ekipleri</h1>
        <p>Ekip bilgilerini görüntüle ve yeni ekiplere katıl</p>
      </div>

      <!-- Current Team Section -->
      @if (currentTeam) {
        <div class="current-team-section">
          <h2>🔄 Mevcut Ekibin</h2>
          <div class="team-card current-team">
            <div class="team-header">
              <div class="team-info">
                <h3>{{ currentTeam.name }}</h3>
                <p class="team-description">{{ currentTeam.description }}</p>
                <div class="team-status status-{{ currentTeam.status.toLowerCase() }}">
                  {{ getTeamStatusLabel(currentTeam.status) }}
                </div>
              </div>
              <div class="team-stats">
                <div class="stat-item">
                  <span class="stat-value">{{ currentTeam.currentMembers }}</span>
                  <span class="stat-label">Üye</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ currentTeam.totalTasksCompleted }}</span>
                  <span class="stat-label">Görev</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ currentTeam.rating }}/5</span>
                  <span class="stat-label">Puan</span>
                </div>
              </div>
            </div>

            <div class="team-details">
              <div class="detail-section">
                <h4>📍 Konum</h4>
                <p>{{ currentTeam.location.address }}, {{ currentTeam.location.district }}</p>
                <p class="coordinates">{{ currentTeam.location.coordinates }}</p>
              </div>

              <div class="detail-section">
                <h4>🛠️ Uzmanlık Alanları</h4>
                <div class="specializations">
                  @for (skill of currentTeam.specializations; track skill) {
                    <span class="skill-tag">{{ getSkillCategoryLabel(skill) }}</span>
                  }
                </div>
              </div>

              <div class="detail-section">
                <h4>📞 İletişim Bilgileri</h4>
                <div class="contact-info">
                  <div class="contact-item">
                    <span class="contact-label">📱 Telefon:</span>
                    <span class="contact-value">{{ currentTeam.contactInfo.phone }}</span>
                  </div>
                  <div class="contact-item">
                    <span class="contact-label">📧 E-posta:</span>
                    <span class="contact-value">{{ currentTeam.contactInfo.email }}</span>
                  </div>
                  <div class="contact-item">
                    <span class="contact-label">🚨 Acil:</span>
                    <span class="contact-value">{{ currentTeam.contactInfo.emergencyPhone }}</span>
                  </div>
                  <div class="contact-item">
                    <span class="contact-label">🏢 Toplantı Yeri:</span>
                    <span class="contact-value">{{ currentTeam.contactInfo.meetingLocation }}</span>
                  </div>
                  <div class="contact-item">
                    <span class="contact-label">⏰ Toplantı Saati:</span>
                    <span class="contact-value">{{ currentTeam.contactInfo.meetingTime }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="team-members">
              <h4>👥 Ekip Üyeleri</h4>
              <div class="members-grid">
                @for (member of currentTeam.members; track member.volunteerId) {
                  <div class="member-card">
                    <div class="member-avatar">
                      <span class="avatar-text">{{ getMemberInitials(member.volunteerId) }}</span>
                    </div>
                    <div class="member-info">
                      <h5>Üye #{{ member.volunteerId }}</h5>
                      <div class="member-role role-{{ member.role.toLowerCase() }}">
                        {{ getTeamRoleLabel(member.role) }}
                      </div>
                      <div class="member-stats">
                        <span class="member-stat">{{ member.tasksCompleted }} görev</span>
                        <span class="member-stat">{{ member.skills.length }} yetkinlik</span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="no-team-section">
          <div class="no-team-card">
            <span class="no-team-icon">👥</span>
            <h3>Henüz bir ekibe katılmadın</h3>
            <p>Ekiplere katılarak daha etkili gönüllülük yapabilir ve deneyim kazanabilirsin.</p>
            <button (click)="showAvailableTeams()" class="btn btn-primary">
              <span>🔍</span> Müsait Ekipleri Gör
            </button>
          </div>
        </div>
      }

      <!-- Available Teams Section -->
      <div class="available-teams-section">
        <h2>🎯 Müsait Ekipler</h2>
        <div class="teams-grid">
          @for (team of availableTeams; track team.id) {
            <div class="team-card available-team">
              <div class="team-header">
                <div class="team-info">
                  <h3>{{ team.name }}</h3>
                  <p class="team-description">{{ team.description }}</p>
                  <div class="team-status status-{{ team.status.toLowerCase() }}">
                    {{ getTeamStatusLabel(team.status) }}
                  </div>
                </div>
                <div class="team-stats">
                  <div class="stat-item">
                    <span class="stat-value">{{ team.currentMembers }}/{{ team.maxMembers }}</span>
                    <span class="stat-label">Üye</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ team.totalTasksCompleted }}</span>
                    <span class="stat-label">Görev</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ team.rating }}/5</span>
                    <span class="stat-label">Puan</span>
                  </div>
                </div>
              </div>

              <div class="team-details">
                <div class="detail-section">
                  <h4>📍 Konum</h4>
                  <p>{{ team.location.address }}, {{ team.location.district }}</p>
                  <p class="coordinates">{{ team.location.coordinates }}</p>
                </div>

                <div class="detail-section">
                  <h4>🛠️ Uzmanlık Alanları</h4>
                  <div class="specializations">
                    @for (skill of team.specializations; track skill) {
                      <span class="skill-tag">{{ getSkillCategoryLabel(skill) }}</span>
                    }
                  </div>
                </div>

                <div class="detail-section">
                  <h4>📞 İletişim Bilgileri</h4>
                  <div class="contact-info">
                    <div class="contact-item">
                      <span class="contact-label">📱 Telefon:</span>
                      <span class="contact-value">{{ team.contactInfo.phone }}</span>
                    </div>
                    <div class="contact-item">
                      <span class="contact-label">📧 E-posta:</span>
                      <span class="contact-value">{{ team.contactInfo.email }}</span>
                    </div>
                    <div class="contact-item">
                      <span class="contact-label">⏰ Toplantı Saati:</span>
                      <span class="contact-value">{{ team.contactInfo.meetingTime }}</span>
                    </div>
                  </div>
                </div>
              </div>

                             <div class="team-actions">
                 @if (team.status === TeamStatus.RECRUITING) {
                   <button 
                     (click)="joinTeam(team.id)"
                     class="btn btn-success"
                     [disabled]="isJoiningTeam === team.id"
                   >
                     <span>{{ isJoiningTeam === team.id ? '⏳' : '✅' }}</span>
                     {{ isJoiningTeam === team.id ? 'Katılım...' : 'Ekibe Katıl' }}
                   </button>
                 } @else if (team.status === TeamStatus.FULL) {
                   <button class="btn btn-secondary" disabled>
                     <span>❌</span> Ekip Dolu
                   </button>
                 } @else {
                   <button class="btn btn-outline" disabled>
                     <span>⏸️</span> Kayıt Kapalı
                   </button>
                 }
                
                <button (click)="viewTeamDetails(team)" class="btn btn-outline">
                  <span>👁️</span> Detayları Gör
                </button>
              </div>
            </div>
          }
        </div>

        @if (availableTeams.length === 0) {
          <div class="empty-state">
            <span class="empty-icon">👥</span>
            <h3>Müsait Ekip Bulunamadı</h3>
            <p>Şu anda kayıt alan ekip bulunmuyor. Daha sonra tekrar kontrol et.</p>
          </div>
        }
      </div>

      <!-- Team Search Section -->
      <div class="team-search-section">
        <h2>🔍 Ekip Ara</h2>
        <div class="search-filters">
          <div class="filter-group">
            <label for="locationFilter">Konum:</label>
            <select id="locationFilter" [(ngModel)]="locationFilter" class="filter-select">
              <option [value]="EMPTY_FILTER">Tüm Konumlar</option>
              <option value="İstanbul">İstanbul</option>
              <option value="Ankara">Ankara</option>
              <option value="İzmir">İzmir</option>
              <option value="Bursa">Bursa</option>
              <option value="Antalya">Antalya</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="skillFilter">Uzmanlık:</label>
                         <select id="skillFilter" [(ngModel)]="skillFilter" class="filter-select">
               <option [value]="EMPTY_FILTER">Tüm Uzmanlıklar</option>
               <option [value]="SkillCategory.MEDICAL">Tıbbi</option>
               <option [value]="SkillCategory.TRANSPORTATION">Ulaşım</option>
               <option [value]="SkillCategory.EQUIPMENT">Ekipman</option>
               <option [value]="SkillCategory.COMMUNICATION">İletişim</option>
               <option [value]="SkillCategory.LOGISTICS">Lojistik</option>
               <option [value]="SkillCategory.CONSTRUCTION">İnşaat</option>
               <option [value]="SkillCategory.PSYCHOLOGICAL">Psikolojik</option>
               <option [value]="SkillCategory.ADMINISTRATIVE">İdari</option>
               <option [value]="SkillCategory.SEARCH_RESCUE">Arama Kurtarma</option>
             </select>
          </div>

          <div class="filter-group">
            <label for="statusFilter">Durum:</label>
                         <select id="statusFilter" [(ngModel)]="statusFilter" class="filter-select">
               <option [value]="EMPTY_FILTER">Tüm Durumlar</option>
               <option [value]="TeamStatus.RECRUITING">Kayıt Alan</option>
               <option [value]="TeamStatus.ACTIVE">Aktif</option>
               <option [value]="TeamStatus.FULL">Dolu</option>
             </select>
          </div>

          <button (click)="applyFilters()" class="btn btn-primary">
            <span>🔍</span> Filtrele
          </button>
          <button (click)="clearFilters()" class="btn btn-secondary">
            <span>🔄</span> Temizle
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .volunteer-teams {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .teams-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .teams-header h1 {
      margin: 0 0 8px 0;
      font-size: 2.5em;
      color: #1e293b;
    }

    .teams-header p {
      margin: 0;
      color: #64748b;
      font-size: 1.1em;
    }

    .current-team-section,
    .available-teams-section,
    .team-search-section {
      margin-bottom: 40px;
    }

    .current-team-section h2,
    .available-teams-section h2,
    .team-search-section h2 {
      margin: 0 0 24px 0;
      color: #1e293b;
      font-size: 1.8em;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .team-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      border: 1px solid #e2e8f0;
      overflow: hidden;
      transition: all 0.3s;
    }

    .team-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    }

    .current-team {
      border-color: #3b82f6;
      box-shadow: 0 4px 20px rgba(59, 130, 246, 0.2);
    }

    .available-team {
      border-color: #10b981;
    }

    .team-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 24px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      gap: 20px;
    }

    .team-info {
      flex: 1;
    }

    .team-info h3 {
      margin: 0 0 8px 0;
      color: #1e293b;
      font-size: 1.5em;
    }

    .team-description {
      margin: 0 0 12px 0;
      color: #64748b;
      line-height: 1.5;
    }

    .team-status {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.8em;
      font-weight: 600;
      color: white;
    }

    .status-active { background: #10b981; }
    .status-recruiting { background: #3b82f6; }
    .status-full { background: #ef4444; }
    .status-inactive { background: #6b7280; }
    .status-suspended { background: #f59e0b; }

    .team-stats {
      display: flex;
      gap: 20px;
      flex-shrink: 0;
    }

    .stat-item {
      text-align: center;
    }

    .stat-value {
      display: block;
      font-size: 1.5em;
      font-weight: 700;
      color: #1e293b;
    }

    .stat-label {
      font-size: 0.8em;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 500;
    }

    .team-details {
      padding: 24px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .detail-section h4 {
      margin: 0 0 12px 0;
      color: #1e293b;
      font-size: 1.1em;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .detail-section p {
      margin: 0 0 8px 0;
      color: #64748b;
    }

    .coordinates {
      font-family: monospace;
      font-size: 0.9em;
      color: #6b7280;
    }

    .specializations {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .skill-tag {
      background: #e0f2fe;
      color: #0277bd;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8em;
      font-weight: 500;
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .contact-item {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .contact-label {
      font-weight: 600;
      color: #374151;
      min-width: 100px;
    }

    .contact-value {
      color: #64748b;
    }

    .team-members {
      padding: 24px;
      border-top: 1px solid #e2e8f0;
    }

    .team-members h4 {
      margin: 0 0 20px 0;
      color: #1e293b;
      font-size: 1.2em;
    }

    .members-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .member-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }

    .member-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #3b82f6;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .avatar-text {
      color: white;
      font-weight: 700;
      font-size: 1.2em;
    }

    .member-info {
      flex: 1;
    }

    .member-info h5 {
      margin: 0 0 4px 0;
      color: #1e293b;
      font-size: 1em;
    }

    .member-role {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.7em;
      font-weight: 600;
      color: white;
      margin-bottom: 8px;
    }

    .role-leader { background: #ef4444; }
    .role-deputy_leader { background: #f59e0b; }
    .role-member { background: #3b82f6; }
    .role-specialist { background: #8b5cf6; }
    .role-trainee { background: #10b981; }

    .member-stats {
      display: flex;
      gap: 8px;
    }

    .member-stat {
      background: white;
      padding: 2px 6px;
      border-radius: 6px;
      font-size: 0.7em;
      color: #6b7280;
      border: 1px solid #e2e8f0;
    }

    .no-team-section {
      margin-bottom: 40px;
    }

    .no-team-card {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      border: 1px solid #e2e8f0;
    }

    .no-team-icon {
      font-size: 4em;
      display: block;
      margin-bottom: 16px;
    }

    .no-team-card h3 {
      margin: 0 0 12px 0;
      color: #374151;
      font-size: 1.5em;
    }

    .no-team-card p {
      margin: 0 0 24px 0;
      color: #64748b;
      line-height: 1.5;
    }

    .teams-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }

    .team-actions {
      padding: 24px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .search-filters {
      display: flex;
      gap: 20px;
      margin-bottom: 24px;
      padding: 24px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      border: 1px solid #e2e8f0;
      flex-wrap: wrap;
      align-items: end;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .filter-group label {
      font-weight: 600;
      color: #374151;
      font-size: 0.9em;
    }

    .filter-select {
      padding: 8px 12px;
      border: 2px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.9em;
      background: white;
      min-width: 150px;
    }

    .filter-select:focus {
      outline: none;
      border-color: #3b82f6;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #64748b;
    }

    .empty-icon {
      font-size: 4em;
      display: block;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 12px 0;
      color: #374151;
      font-size: 1.5em;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9em;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
    }

    .btn-secondary {
      background: #6b7280;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #4b5563;
    }

    .btn-success {
      background: #10b981;
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background: #059669;
    }

    .btn-outline {
      background: transparent;
      color: #3b82f6;
      border: 2px solid #3b82f6;
    }

    .btn-outline:hover:not(:disabled) {
      background: #3b82f6;
      color: white;
    }

    @media (max-width: 768px) {
      .volunteer-teams {
        padding: 16px;
      }

      .team-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .team-stats {
        width: 100%;
        justify-content: space-around;
      }

      .team-details {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .teams-grid {
        grid-template-columns: 1fr;
      }

      .search-filters {
        flex-direction: column;
        gap: 16px;
      }

      .filter-select {
        min-width: auto;
        width: 100%;
      }

      .team-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }

      .members-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class VolunteerTeamsComponent implements OnInit, OnDestroy {
  currentTeam: VolunteerTeam | null = null;
  availableTeams: VolunteerTeam[] = [];
  isJoiningTeam: number | null = null;

  // Filters
  locationFilter: string = '';
  skillFilter: SkillCategory | '' = '';
  statusFilter: TeamStatus | '' = '';

  // Empty filter values
  readonly EMPTY_FILTER = '' as const;

  // Enums for template
  SkillCategory = SkillCategory;
  TeamStatus = TeamStatus;
  TeamRole = TeamRole;

  private subscriptions: Subscription[] = [];

  constructor(private volunteerService: VolunteerService) {}

  ngOnInit(): void {
    this.loadTeams();
    this.loadMockData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadTeams(): void {
    // Load current volunteer team
    this.subscriptions.push(
      this.volunteerService.volunteerTeam$.subscribe(team => {
        this.currentTeam = team;
      })
    );

    const currentVolunteer = this.volunteerService.getCurrentVolunteer();
    if (currentVolunteer) {
      this.volunteerService.getVolunteerTeam(currentVolunteer.id).subscribe();
    }

    // Set up periodic refresh for real-time updates
    this.setupPeriodicRefresh();
  }

  private setupPeriodicRefresh(): void {
    // Refresh team data every 60 seconds for real-time updates
    const refreshInterval = setInterval(() => {
      const currentVolunteer = this.volunteerService.getCurrentVolunteer();
      if (currentVolunteer) {
        this.volunteerService.getVolunteerTeam(currentVolunteer.id).subscribe();
      }
    }, 60000); // 60 seconds

    // Store interval ID for cleanup
    this.subscriptions.push({
      unsubscribe: () => clearInterval(refreshInterval)
    } as Subscription);
  }

  private loadMockData(): void {
    // Load mock available teams
    this.availableTeams = [
      {
        id: 2,
        name: 'Ankara Acil Müdahale Ekibi',
        description: 'Ankara bölgesinde acil durumlara hızlı müdahale ekibi',
        leaderId: 3,
        members: [],
        specializations: [SkillCategory.MEDICAL, SkillCategory.TRANSPORTATION],
        maxMembers: 12,
        currentMembers: 6,
        status: TeamStatus.RECRUITING,
        createdAt: new Date('2023-06-01'),
        totalTasksCompleted: 89,
        rating: 4.6,
        location: {
          latitude: 39.9334,
          longitude: 32.8597,
          address: 'Kızılay Meydanı',
          city: 'Ankara',
          district: 'Çankaya',
          coordinates: '39.9334, 32.8597'
        },
        contactInfo: {
          phone: '+90 312 555 0123',
          email: 'ankara.ekip@example.com',
          emergencyPhone: '+90 312 555 9999',
          meetingLocation: 'Kızılay Belediyesi',
          meetingTime: 'Her Cumartesi 14:00'
        }
      },
      {
        id: 3,
        name: 'İzmir Sahil Güvenlik Ekibi',
        description: 'İzmir sahil bölgesinde güvenlik ve kurtarma operasyonları',
        leaderId: 4,
        members: [],
        specializations: [SkillCategory.SEARCH_RESCUE, SkillCategory.EQUIPMENT],
        maxMembers: 10,
        currentMembers: 10,
        status: TeamStatus.FULL,
        createdAt: new Date('2023-08-15'),
        totalTasksCompleted: 67,
        rating: 4.8,
        location: {
          latitude: 38.4192,
          longitude: 27.1287,
          address: 'Alsancak Mah.',
          city: 'İzmir',
          district: 'Konak',
          coordinates: '38.4192, 27.1287'
        },
        contactInfo: {
          phone: '+90 232 555 0123',
          email: 'izmir.ekip@example.com',
          emergencyPhone: '+90 232 555 9999',
          meetingLocation: 'Alsancak Belediyesi',
          meetingTime: 'Her Pazar 10:00'
        }
      }
    ];
  }

  showAvailableTeams(): void {
    // Scroll to available teams section
    const element = document.querySelector('.available-teams-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  joinTeam(teamId: number): void {
    this.isJoiningTeam = teamId;
    
    this.volunteerService.joinTeam(teamId).subscribe({
      next: (team) => {
        console.log('Successfully joined team:', team);
        this.isJoiningTeam = null;
        
        // Show success message
        this.showSuccessMessage('Ekibe başarıyla katıldın!');
        
        // Refresh team data
        this.loadTeams();
      },
      error: (error) => {
        console.error('Error joining team:', error);
        this.isJoiningTeam = null;
        
        // Show error message
        this.showErrorMessage('Ekibe katılırken bir hata oluştu. Lütfen tekrar dene.');
      }
    });
  }

  viewTeamDetails(team: VolunteerTeam): void {
    // This would open a team details modal or navigate to team details
    console.log('Viewing team details:', team.id);
  }

  applyFilters(): void {
    // Apply filters to available teams
    console.log('Applying filters:', {
      location: this.locationFilter,
      skill: this.skillFilter,
      status: this.statusFilter
    });
    
    // In a real implementation, you would filter the teams based on these criteria
    // For now, we'll just log the filters
    this.showSuccessMessage('Filtreler uygulandı');
  }

  clearFilters(): void {
    this.locationFilter = this.EMPTY_FILTER;
    this.skillFilter = this.EMPTY_FILTER;
    this.statusFilter = this.EMPTY_FILTER;
    
    this.showSuccessMessage('Filtreler temizlendi');
  }

  // Helper methods for labels
  getTeamStatusLabel(status: TeamStatus): string {
    const labels: Record<TeamStatus, string> = {
      [TeamStatus.ACTIVE]: 'Aktif',
      [TeamStatus.RECRUITING]: 'Kayıt Alan',
      [TeamStatus.FULL]: 'Dolu',
      [TeamStatus.INACTIVE]: 'Pasif',
      [TeamStatus.SUSPENDED]: 'Askıya Alınmış'
    };
    return labels[status] || status;
  }

  getTeamRoleLabel(role: TeamRole): string {
    const labels: Record<TeamRole, string> = {
      [TeamRole.LEADER]: 'Lider',
      [TeamRole.DEPUTY_LEADER]: 'Yardımcı Lider',
      [TeamRole.MEMBER]: 'Üye',
      [TeamRole.SPECIALIST]: 'Uzman',
      [TeamRole.TRAINEE]: 'Stajyer'
    };
    return labels[role] || role;
  }

  getSkillCategoryLabel(category: SkillCategory): string {
    const labels: Record<SkillCategory, string> = {
      [SkillCategory.MEDICAL]: 'Tıbbi',
      [SkillCategory.TRANSPORTATION]: 'Ulaşım',
      [SkillCategory.EQUIPMENT]: 'Ekipman',
      [SkillCategory.COMMUNICATION]: 'İletişim',
      [SkillCategory.LOGISTICS]: 'Lojistik',
      [SkillCategory.CONSTRUCTION]: 'İnşaat',
      [SkillCategory.PSYCHOLOGICAL]: 'Psikolojik',
      [SkillCategory.ADMINISTRATIVE]: 'İdari',
      [SkillCategory.SEARCH_RESCUE]: 'Arama Kurtarma',
      [SkillCategory.OTHER]: 'Diğer'
    };
    return labels[category] || category;
  }

  getMemberInitials(volunteerId: number): string {
    // Generate initials based on volunteer ID
    const names = ['AY', 'FD', 'MK', 'AO', 'ZC', 'BA', 'SD', 'EK', 'HK', 'YD'];
    return names[volunteerId % names.length];
  }

  private showSuccessMessage(message: string): void {
    // In a real app, you would use a toast service
    console.log('Success:', message);
    // You can implement a toast notification here
  }

  private showErrorMessage(message: string): void {
    // In a real app, you would use a toast service
    console.error('Error:', message);
    // You can implement a toast notification here
  }
}
