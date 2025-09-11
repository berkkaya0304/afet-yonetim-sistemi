import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { VolunteerService } from '../../../core/services/volunteer.service';
import { Badge, BadgeCategory, BadgeLevel, BadgeRarity, VolunteerStats } from '../../../core/models/volunteer.model';

@Component({
  selector: 'app-volunteer-badges',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="volunteer-badges">
      <!-- Header -->
      <div class="badges-header">
        <h1>🏆 Gönüllü Rozetleri</h1>
        <p>Başarılarını ve kazanılan rozetleri görüntüle</p>
      </div>

      <!-- Stats Overview -->
      <div class="badges-stats">
        <div class="stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-content">
            <h3>{{ earnedBadges.length }}</h3>
            <p>Kazanılan Rozet</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <h3>{{ totalPoints }}</h3>
            <p>Toplam Puan</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💎</div>
          <div class="stat-content">
            <h3>{{ rareBadgesCount }}</h3>
            <p>Nadir Rozetler</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <h3>{{ nextBadgeProgress }}%</h3>
            <p>Sonraki Rozet</p>
          </div>
        </div>
      </div>

      <!-- Badge Categories -->
      <div class="badge-categories">
        <button 
          [class.active]="selectedCategory === 'all'"
          (click)="selectCategory('all')"
          class="category-btn"
        >
          <span>🌟</span> Tümü
        </button>
        <button 
          [class.active]="selectedCategory === 'ACHIEVEMENT'"
          (click)="selectCategory('ACHIEVEMENT')"
          class="category-btn"
        >
          <span>🏅</span> Başarılar
        </button>
        <button 
          [class.active]="selectedCategory === 'SKILL'"
          (click)="selectCategory('SKILL')"
          class="category-btn"
        >
          <span>🛠️</span> Yetkinlikler
        </button>
        <button 
          [class.active]="selectedCategory === 'PARTICIPATION'"
          (click)="selectCategory('PARTICIPATION')"
          class="category-btn"
        >
          <span>👥</span> Katılım
        </button>
        <button 
          [class.active]="selectedCategory === 'SPECIAL'"
          (click)="selectCategory('SPECIAL')"
          class="category-btn"
        >
          <span>🎁</span> Özel
        </button>
        <button 
          [class.active]="selectedCategory === 'MILESTONE'"
          (click)="selectCategory('MILESTONE')"
          class="category-btn"
        >
          <span>📊</span> Kilometre Taşları
        </button>
      </div>

      <!-- Badges Grid -->
      <div class="badges-grid">
        @if (isLoadingBadges) {
          <div class="badge-card">
            <div class="badge-header">
              <div class="badge-icon">⚙️</div>
              <div class="badge-level">Yükleniyor...</div>
            </div>
            <div class="badge-content">
              <p>Rozetler yükleniyor, lütfen bekleyin.</p>
            </div>
          </div>
        } @else if (hasError) {
          <div class="badge-card">
            <div class="badge-header">
              <div class="badge-icon">❌</div>
              <div class="badge-level">Hata</div>
            </div>
            <div class="badge-content">
              <p>{{ errorMessage }}</p>
              <button (click)="refreshBadges()">Tekrar Yükle</button>
            </div>
          </div>
        } @else {
          @for (badge of filteredBadges; track badge.id) {
            <div class="badge-card" [class.earned]="badge.earnedAt">
              <div class="badge-header">
                <div class="badge-icon">{{ badge.icon }}</div>
                <div class="badge-level level-{{ badge.level.toLowerCase() }}">
                  {{ getBadgeLevelLabel(badge.level) }}
                </div>
              </div>
              
              <div class="badge-content">
                <h3 class="badge-name">{{ badge.name }}</h3>
                <p class="badge-description">{{ badge.description }}</p>
                
                <div class="badge-meta">
                  <span class="badge-category">{{ getBadgeCategoryLabel(badge.category) }}</span>
                  <span class="badge-rarity rarity-{{ badge.rarity.toLowerCase() }}">
                    {{ getBadgeRarityLabel(badge.rarity) }}
                  </span>
                  <span class="badge-points">+{{ badge.points }} puan</span>
                </div>

                @if (badge.earnedAt) {
                  <div class="badge-earned">
                    <span class="earned-date">Kazanıldı: {{ formatDate(badge.earnedAt) }}</span>
                    <div class="earned-progress">
                      <div class="progress-bar">
                        <div class="progress-fill" [style.width.%]="badge.progress"></div>
                      </div>
                      <span class="progress-text">{{ badge.progress }}%</span>
                    </div>
                  </div>
                } @else {
                  <div class="badge-criteria">
                    <h4>Kazanma Kriterleri:</h4>
                    <p>{{ badge.criteria.description }}</p>
                    @if (badge.criteria.conditions && badge.criteria.conditions.length > 0) {
                      <ul class="criteria-list">
                        @for (condition of badge.criteria.conditions; track condition) {
                          <li>{{ condition }}</li>
                        }
                      </ul>
                    }
                  </div>
                }
              </div>
            </div>
          }
        }
      </div>

      <!-- Empty State -->
      @if (filteredBadges.length === 0 && !isLoadingBadges && !hasError) {
        <div class="empty-state">
          <span class="empty-icon">🏆</span>
          <h3>Bu kategoride rozet bulunamadı</h3>
          <p>Farklı bir kategori seç veya daha fazla görev tamamlayarak rozet kazan!</p>
        </div>
      }

      <!-- Achievement Progress -->
      <div class="achievement-progress">
        <h3>📈 Başarı İlerlemesi</h3>
        <div class="progress-cards">
          <div class="progress-card">
            <h4>🎯 Görev Tamamlama</h4>
            <div class="progress-info">
              <span class="progress-current">{{ completedTasksCount }}</span>
              <span class="progress-separator">/</span>
              <span class="progress-target">{{ nextTaskBadgeTarget }}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="taskCompletionProgress"></div>
            </div>
            <p class="progress-note">Sonraki rozet: {{ nextTaskBadgeName }}</p>
          </div>

          <div class="progress-card">
            <h4>⏱️ Toplam Saat</h4>
            <div class="progress-info">
              <span class="progress-current">{{ totalHours }}</span>
              <span class="progress-separator">/</span>
              <span class="progress-target">{{ nextHourBadgeTarget }}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="hourProgress"></div>
            </div>
            <p class="progress-note">Sonraki rozet: {{ nextHourBadgeName }}</p>
          </div>

          <div class="progress-card">
            <h4>🛠️ Yetkinlik Kullanımı</h4>
            <div class="progress-info">
              <span class="progress-current">{{ skillUsageCount }}</span>
              <span class="progress-separator">/</span>
              <span class="progress-target">{{ nextSkillBadgeTarget }}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="skillProgress"></div>
            </div>
            <p class="progress-note">Sonraki rozet: {{ nextSkillBadgeName }}</p>
          </div>
        </div>
      </div>

      <!-- Recent Achievements -->
      <div class="recent-achievements">
        <h3>🎉 Son Kazanılan Rozetler</h3>
        <div class="achievements-list">
          @for (badge of recentEarnedBadges; track badge.id) {
            <div class="achievement-item">
              <div class="achievement-icon">{{ badge.icon }}</div>
              <div class="achievement-info">
                <h4>{{ badge.name }}</h4>
                <p>{{ badge.description }}</p>
                <span class="achievement-date">{{ formatDate(badge.earnedAt) }}</span>
              </div>
              <div class="achievement-level level-{{ badge.level.toLowerCase() }}">
                {{ getBadgeLevelLabel(badge.level) }}
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .volunteer-badges {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .badges-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .badges-header h1 {
      margin: 0 0 8px 0;
      font-size: 2.5em;
      color: #1e293b;
    }

    .badges-header p {
      margin: 0;
      color: #64748b;
      font-size: 1.1em;
    }

    .badges-stats {
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

    .badge-categories {
      display: flex;
      gap: 12px;
      margin-bottom: 32px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .category-btn {
      padding: 12px 20px;
      border: 2px solid #e2e8f0;
      background: white;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      color: #64748b;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .category-btn:hover {
      border-color: #3b82f6;
      color: #3b82f6;
    }

    .category-btn.active {
      background: #3b82f6;
      border-color: #3b82f6;
      color: white;
    }

    .badges-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }

    .badge-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      border: 1px solid #e2e8f0;
      overflow: hidden;
      transition: all 0.3s;
    }

    .badge-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    }

    .badge-card.earned {
      border-color: #10b981;
      box-shadow: 0 4px 20px rgba(16, 185, 129, 0.2);
    }

    .badge-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .badge-icon {
      font-size: 3em;
    }

    .badge-level {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.8em;
      font-weight: 700;
      color: white;
    }

    .level-bronze { background: #cd7f32; }
    .level-silver { background: #c0c0c0; }
    .level-gold { background: #ffd700; color: #1e293b; }
    .level-platinum { background: #e5e4e2; color: #1e293b; }
    .level-diamond { background: #b9f2ff; color: #1e293b; }

    .badge-content {
      padding: 24px;
    }

    .badge-name {
      margin: 0 0 12px 0;
      color: #1e293b;
      font-size: 1.3em;
      font-weight: 700;
    }

    .badge-description {
      margin: 0 0 16px 0;
      color: #64748b;
      line-height: 1.5;
    }

    .badge-meta {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .badge-category {
      background: #e0f2fe;
      color: #0277bd;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8em;
      font-weight: 500;
    }

    .badge-rarity {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8em;
      font-weight: 600;
      color: white;
    }

    .rarity-common { background: #6b7280; }
    .rarity-uncommon { background: #10b981; }
    .rarity-rare { background: #3b82f6; }
    .rarity-epic { background: #8b5cf6; }
    .rarity-legendary { background: #f59e0b; }

    .badge-points {
      background: #fef3c7;
      color: #92400e;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8em;
      font-weight: 600;
    }

    .badge-earned {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 16px;
    }

    .earned-date {
      display: block;
      color: #166534;
      font-weight: 600;
      margin-bottom: 12px;
      font-size: 0.9em;
    }

    .earned-progress {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .progress-bar {
      flex: 1;
      height: 8px;
      background-color: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #059669);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .progress-text {
      color: #166534;
      font-weight: 600;
      font-size: 0.9em;
      min-width: 40px;
    }

    .badge-criteria {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
    }

    .badge-criteria h4 {
      margin: 0 0 8px 0;
      color: #374151;
      font-size: 1em;
    }

    .badge-criteria p {
      margin: 0 0 12px 0;
      color: #64748b;
      font-size: 0.9em;
    }

    .criteria-list {
      margin: 0;
      padding-left: 20px;
      color: #64748b;
      font-size: 0.9em;
    }

    .criteria-list li {
      margin-bottom: 4px;
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

    .achievement-progress {
      background: white;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      border: 1px solid #e2e8f0;
      margin-bottom: 32px;
    }

    .achievement-progress h3 {
      margin: 0 0 24px 0;
      color: #1e293b;
      font-size: 1.5em;
      text-align: center;
    }

    .progress-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .progress-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
    }

    .progress-card h4 {
      margin: 0 0 16px 0;
      color: #1e293b;
      font-size: 1.1em;
      text-align: center;
    }

    .progress-info {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }

    .progress-current {
      font-size: 1.5em;
      font-weight: 700;
      color: #3b82f6;
    }

    .progress-separator {
      color: #6b7280;
      font-size: 1.2em;
    }

    .progress-target {
      font-size: 1.2em;
      color: #64748b;
    }

    .progress-note {
      margin: 12px 0 0 0;
      text-align: center;
      color: #6b7280;
      font-size: 0.9em;
    }

    .recent-achievements {
      background: white;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      border: 1px solid #e2e8f0;
    }

    .recent-achievements h3 {
      margin: 0 0 24px 0;
      color: #1e293b;
      font-size: 1.5em;
      text-align: center;
    }

    .achievements-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .achievement-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
    }

    .achievement-icon {
      font-size: 2.5em;
      flex-shrink: 0;
    }

    .achievement-info {
      flex: 1;
    }

    .achievement-info h4 {
      margin: 0 0 4px 0;
      color: #1e293b;
      font-size: 1.1em;
    }

    .achievement-info p {
      margin: 0 0 8px 0;
      color: #64748b;
      font-size: 0.9em;
    }

    .achievement-date {
      color: #6b7280;
      font-size: 0.8em;
      font-weight: 500;
    }

    .achievement-level {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.8em;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
    }

    @media (max-width: 768px) {
      .volunteer-badges {
        padding: 16px;
      }

      .badges-stats {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }

      .badge-categories {
        flex-direction: column;
        align-items: center;
      }

      .category-btn {
        width: 100%;
        max-width: 300px;
        justify-content: center;
      }

      .badges-grid {
        grid-template-columns: 1fr;
      }

      .progress-cards {
        grid-template-columns: 1fr;
      }

      .achievement-item {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class VolunteerBadgesComponent implements OnInit, OnDestroy {
  selectedCategory: string = 'all';
  earnedBadges: Badge[] = [];
  allBadges: Badge[] = [];
  
  // Progress tracking
  completedTasksCount = 0;
  totalHours = 0;
  skillUsageCount = 0;

  // Loading states
  isLoadingBadges = false;
  isLoadingStats = false;

  // Error states
  hasError = false;
  errorMessage = '';

  private subscriptions: Subscription[] = [];

  constructor(private volunteerService: VolunteerService) {}

  ngOnInit(): void {
    this.loadBadges();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadBadges(): void {
    // Set loading states
    this.isLoadingBadges = true;
    this.isLoadingStats = true;
    this.hasError = false;
    this.errorMessage = '';

    this.subscriptions.push(
      this.volunteerService.volunteerBadges$.subscribe(badges => {
        this.earnedBadges = badges;
        this.generateAllBadges();
        this.updateProgressTracking();
        this.isLoadingBadges = false;
      })
    );

    // Load volunteer stats for progress tracking
    this.subscriptions.push(
      this.volunteerService.volunteerStats$.subscribe(stats => {
        if (stats) {
          this.updateProgressFromStats(stats);
        }
        this.isLoadingStats = false;
      })
    );

    const currentVolunteer = this.volunteerService.getCurrentVolunteer();
    if (currentVolunteer) {
      this.volunteerService.getVolunteerBadges(currentVolunteer.id).subscribe({
        error: (error) => {
          console.error('Error loading badges:', error);
          this.handleError('Rozetler yüklenirken hata oluştu');
          this.isLoadingBadges = false;
        }
      });
      this.volunteerService.getVolunteerStats(currentVolunteer.id).subscribe({
        error: (error) => {
          console.error('Error loading stats:', error);
          this.handleError('İstatistikler yüklenirken hata oluştu');
          this.isLoadingStats = false;
        }
      });
    } else {
      this.isLoadingBadges = false;
      this.isLoadingStats = false;
    }

    // Set up periodic refresh for real-time updates
    this.setupPeriodicRefresh();
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

  private setupPeriodicRefresh(): void {
    // Refresh data every 60 seconds for real-time updates
    const refreshInterval = setInterval(() => {
      const currentVolunteer = this.volunteerService.getCurrentVolunteer();
      if (currentVolunteer) {
        this.volunteerService.getVolunteerBadges(currentVolunteer.id).subscribe({
          error: (error) => {
            console.error('Error refreshing badges:', error);
            this.handleError('Rozetler yenilenirken hata oluştu');
          }
        });
        this.volunteerService.getVolunteerStats(currentVolunteer.id).subscribe({
          error: (error) => {
            console.error('Error refreshing stats:', error);
            this.handleError('İstatistikler yenilenirken hata oluştu');
          }
        });
      }
    }, 60000); // 60 seconds

    // Store interval ID for cleanup
    this.subscriptions.push({
      unsubscribe: () => clearInterval(refreshInterval)
    } as Subscription);
  }

  refreshBadges(): void {
    this.loadBadges();
  }

  private updateProgressFromStats(stats: VolunteerStats): void {
    this.completedTasksCount = stats.totalTasksCompleted;
    this.totalHours = stats.totalHours;
    this.skillUsageCount = stats.skillsCount;
  }

  private updateProgressTracking(): void {
    // Update progress based on earned badges and current stats
    if (this.earnedBadges.length > 0) {
      // Find the highest level badge to determine next target
      const highestBadge = this.earnedBadges.reduce((prev, current) => {
        const prevLevel = this.getBadgeLevelValue(prev.level);
        const currentLevel = this.getBadgeLevelValue(current.level);
        return prevLevel > currentLevel ? prev : current;
      });
      
      // Progress will be calculated in the computed property
      console.log('Progress tracking updated for badge:', highestBadge.name);
    }
  }

  private getBadgeLevelValue(level: BadgeLevel): number {
    const levelValues = {
      [BadgeLevel.BRONZE]: 1,
      [BadgeLevel.SILVER]: 2,
      [BadgeLevel.GOLD]: 3,
      [BadgeLevel.PLATINUM]: 4,
      [BadgeLevel.DIAMOND]: 5
    };
    return levelValues[level] || 1;
  }

  // Computed property for next badge progress
  get nextBadgeProgress(): number {
    if (this.earnedBadges.length === 0) {
      return Math.min(100, Math.floor((this.completedTasksCount / 5) * 100));
    }
    
    // Find the highest level badge to determine next target
    const highestBadge = this.earnedBadges.reduce((prev, current) => {
      const prevLevel = this.getBadgeLevelValue(prev.level);
      const currentLevel = this.getBadgeLevelValue(current.level);
      return prevLevel > currentLevel ? prev : current;
    });
    
    const currentLevel = this.getBadgeLevelValue(highestBadge.level);
    const nextLevel = Math.min(currentLevel + 1, 5);
    
    // Calculate progress based on current level
    if (nextLevel === 2) { // Silver
      return Math.min(100, Math.floor((this.completedTasksCount / 10) * 100));
    } else if (nextLevel === 3) { // Gold
      return Math.min(100, Math.floor((this.completedTasksCount / 25) * 100));
    } else if (nextLevel === 4) { // Platinum
      return Math.min(100, Math.floor((this.completedTasksCount / 50) * 100));
    } else if (nextLevel === 5) { // Diamond
      return Math.min(100, Math.floor((this.completedTasksCount / 100) * 100));
    } else {
      return 100; // Already at highest level
    }
  }

  private loadMockData(): void {
    // Load mock data for progress tracking
    // In a real implementation, this would come from the service
  }

  private generateAllBadges(): void {
    // Generate all possible badges for demonstration
    this.allBadges = [
      ...this.earnedBadges,
      // Add unearned badges
      {
        id: 1001,
        name: 'Uzman Gönüllü',
        description: '100 görev tamamla ve uzman seviyesine ulaş',
        icon: '👑',
        category: BadgeCategory.ACHIEVEMENT,
        level: BadgeLevel.GOLD,
        criteria: {
          type: 'TASK_COUNT',
          value: 100,
          description: '100 görev tamamla',
          conditions: ['Görevleri başarıyla tamamla', 'Yüksek puan al']
        },
        earnedAt: new Date(),
        progress: 47,
        maxProgress: 100,
        rarity: BadgeRarity.RARE,
        points: 100
      },
      {
        id: 1002,
        name: 'Gece Kartalı',
        description: 'Gece saatlerinde bir görevi tamamla',
        icon: '🦉',
        category: BadgeCategory.SPECIAL,
        level: BadgeLevel.SILVER,
        criteria: {
          type: 'SPECIAL_EVENT',
          value: 1,
          description: 'Gece saatlerinde görev tamamla',
          conditions: ['22:00-06:00 arası görev yap']
        },
        earnedAt: new Date(),
        progress: 0,
        maxProgress: 1,
        rarity: BadgeRarity.UNCOMMON,
        points: 25
      }
    ];
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  get filteredBadges(): Badge[] {
    if (this.selectedCategory === 'all') {
      return this.allBadges;
    }
    return this.allBadges.filter(badge => badge.category === this.selectedCategory);
  }

  get recentEarnedBadges(): Badge[] {
    return this.earnedBadges
      .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
      .slice(0, 5);
  }

  // Computed properties for progress tracking
  get totalPoints(): number {
    return this.earnedBadges.reduce((sum, badge) => sum + badge.points, 0);
  }

  get rareBadgesCount(): number {
    return this.earnedBadges.filter(badge => 
      badge.rarity === 'RARE' || badge.rarity === 'EPIC' || badge.rarity === 'LEGENDARY'
    ).length;
  }

  get nextTaskBadgeTarget(): number {
    if (this.completedTasksCount < 5) return 5;
    if (this.completedTasksCount < 15) return 15;
    if (this.completedTasksCount < 30) return 30;
    return 100;
  }

  get nextTaskBadgeName(): string {
    if (this.completedTasksCount < 5) return 'İlk Adım';
    if (this.completedTasksCount < 15) return 'Yardımsever (Seviye 2)';
    if (this.completedTasksCount < 30) return 'Yardımsever (Seviye 3)';
    return 'Uzman Gönüllü';
  }

  get taskCompletionProgress(): number {
    return Math.min(100, Math.floor((this.completedTasksCount / this.nextTaskBadgeTarget) * 100));
  }

  get nextHourBadgeTarget(): number {
    if (this.totalHours < 50) return 50;
    if (this.totalHours < 100) return 100;
    return 500;
  }

  get nextHourBadgeName(): string {
    if (this.totalHours < 50) return 'Zaman Kahramanı';
    if (this.totalHours < 100) return 'Saat Ustası';
    return 'Zaman Efendisi';
  }

  get hourProgress(): number {
    return Math.min(100, Math.floor((this.totalHours / this.nextHourBadgeTarget) * 100));
  }

  get nextSkillBadgeTarget(): number {
    if (this.skillUsageCount < 10) return 10;
    if (this.skillUsageCount < 25) return 25;
    return 50;
  }

  get nextSkillBadgeName(): string {
    if (this.skillUsageCount < 10) return 'Yetenek Geliştirici';
    if (this.skillUsageCount < 25) return 'Yetenek Ustası';
    return 'Yetenek Efendisi';
  }

  get skillProgress(): number {
    return Math.min(100, Math.floor((this.skillUsageCount / this.nextSkillBadgeTarget) * 100));
  }

  // Helper methods for labels
  getBadgeCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'ACHIEVEMENT': 'Başarı',
      'SKILL': 'Yetkinlik',
      'PARTICIPATION': 'Katılım',
      'SPECIAL': 'Özel',
      'MILESTONE': 'Kilometre Taşı'
    };
    return labels[category] || category;
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

  getBadgeRarityLabel(rarity: string): string {
    const labels: { [key: string]: string } = {
      'COMMON': 'Yaygın',
      'UNCOMMON': 'Nadir',
      'RARE': 'Nadir',
      'EPIC': 'Efsanevi',
      'LEGENDARY': 'Efsanevi'
    };
    return labels[rarity] || rarity;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
