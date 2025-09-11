import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AdminService } from '../../../core/services/admin.service';
import { User, UserRole } from '../../../core/models/user.model';
import { Badge, BadgeCategory, BadgeLevel, BadgeRarity, BadgeCriteria } from '../../../core/models/volunteer.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-badges',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="py-6">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">Rozet Yönetimi</h1>
                <p class="text-gray-600 mt-2">Rozet oluşturun, düzenleyin ve manuel olarak atayın</p>
              </div>
              <div class="flex space-x-3">
                <button 
                  (click)="openCreateBadgeModal()" 
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Yeni Rozet Oluştur
                </button>
                <button 
                  (click)="openAssignBadgeModal()" 
                  class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Manuel Rozet Ata
                </button>
                <button 
                  (click)="exportBadgeData()" 
                  class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Veri Dışa Aktar
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Statistics -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white shadow rounded-lg p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Toplam Rozet</p>
                <p class="text-2xl font-bold text-gray-900">{{ statistics.total }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white shadow rounded-lg p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Aktif Rozet</p>
                <p class="text-2xl font-bold text-gray-900">{{ statistics.active }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white shadow rounded-lg p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Toplam Atama</p>
                <p class="text-2xl font-bold text-gray-900">{{ statistics.assignments }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white shadow rounded-lg p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Efsanevi Rozet</p>
                <p class="text-2xl font-bold text-gray-900">{{ statistics.legendary }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Badges Grid -->
        <div class="bg-white shadow rounded-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900">Mevcut Rozetler</h2>
            <div class="flex space-x-2">
              <select [(ngModel)]="filters.category" (change)="applyFilters()" class="px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Tüm Kategoriler</option>
                <option value="ACHIEVEMENT">Başarım</option>
                <option value="SKILL">Yetkinlik</option>
                <option value="PARTICIPATION">Katılım</option>
                <option value="SPECIAL">Özel</option>
                <option value="MILESTONE">Kilometre Taşı</option>
              </select>
              <select [(ngModel)]="filters.rarity" (change)="applyFilters()" class="px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Tüm Nadirlikler</option>
                <option value="COMMON">Yaygın</option>
                <option value="UNCOMMON">Nadir</option>
                <option value="RARE">Çok Nadir</option>
                <option value="EPIC">Efsanevi</option>
                <option value="LEGENDARY">Destansı</option>
              </select>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (badge of filteredBadges; track badge.id) {
              <div class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div class="flex items-start justify-between mb-4">
                  <div class="text-3xl">{{ badge.icon }}</div>
                  <div class="flex space-x-2">
                    <button 
                      (click)="editBadge(badge)" 
                      class="text-blue-600 hover:text-blue-800"
                      title="Düzenle"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      (click)="duplicateBadge(badge)" 
                      class="text-green-600 hover:text-green-800"
                      title="Kopyala"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button 
                      (click)="deleteBadge(badge.id)" 
                      class="text-red-600 hover:text-red-800"
                      title="Sil"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ badge.name }}</h3>
                <p class="text-gray-600 text-sm mb-4">{{ badge.description }}</p>
                
                <div class="space-y-2 mb-4">
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-500">Kategori:</span>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {{ getCategoryLabel(badge.category) }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-500">Seviye:</span>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {{ getLevelLabel(badge.level) }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-500">Nadirlik:</span>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {{ getRarityLabel(badge.rarity) }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-500">Puan:</span>
                    <span class="text-sm font-medium text-gray-900">+{{ badge.points }}</span>
                  </div>
                </div>
                
                <div class="border-t border-gray-200 pt-4">
                  <h4 class="text-sm font-medium text-gray-900 mb-2">Kazanma Kriteri:</h4>
                  <p class="text-xs text-gray-600">{{ badge.criteria.description }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      </main>

      <!-- Create/Edit Badge Modal -->
      @if (showBadgeModal) {
        <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3">
              <h3 class="text-lg font-medium text-gray-900 mb-4">{{ editingBadge ? 'Rozeti Düzenle' : 'Yeni Rozet Oluştur' }}</h3>
              <form (ngSubmit)="saveBadge()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">İkon</label>
                  <input 
                    type="text" 
                    [(ngModel)]="badgeForm.icon" 
                    name="icon"
                    placeholder="🏆"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Ad</label>
                  <input 
                    type="text" 
                    [(ngModel)]="badgeForm.name" 
                    name="name"
                    placeholder="Rozet adı"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
                  <textarea 
                    [(ngModel)]="badgeForm.description" 
                    name="description"
                    rows="3"
                    placeholder="Rozet açıklaması"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  ></textarea>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                    <select [(ngModel)]="badgeForm.category" name="category" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option value="ACHIEVEMENT">Başarım</option>
                      <option value="SKILL">Yetkinlik</option>
                      <option value="PARTICIPATION">Katılım</option>
                      <option value="SPECIAL">Özel</option>
                      <option value="MILESTONE">Kilometre Taşı</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Seviye</label>
                    <select [(ngModel)]="badgeForm.level" name="level" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option value="BRONZE">Bronz</option>
                      <option value="SILVER">Gümüş</option>
                      <option value="GOLD">Altın</option>
                      <option value="PLATINUM">Platin</option>
                      <option value="DIAMOND">Elmas</option>
                    </select>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Nadirlik</label>
                    <select [(ngModel)]="badgeForm.rarity" name="rarity" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option value="COMMON">Yaygın</option>
                      <option value="UNCOMMON">Nadir</option>
                      <option value="RARE">Çok Nadir</option>
                      <option value="EPIC">Efsanevi</option>
                      <option value="LEGENDARY">Destansı</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Puan</label>
                    <input 
                      type="number" 
                      [(ngModel)]="badgeForm.points" 
                      name="points"
                      min="1"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Kazanma Kriteri</label>
                  <textarea 
                    [(ngModel)]="badgeForm.criteriaDescription" 
                    name="criteriaDescription"
                    rows="2"
                    placeholder="Örn: 10 görev tamamlayınca bu rozeti kazanın"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  ></textarea>
                </div>
                <div class="flex justify-end space-x-3">
                  <button type="button" (click)="closeBadgeModal()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                    İptal
                  </button>
                  <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    {{ editingBadge ? 'Güncelle' : 'Oluştur' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }

      <!-- Assign Badge Modal -->
      @if (showAssignModal) {
        <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Manuel Rozet Ata</h3>
              <form (ngSubmit)="assignBadge()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Rozet</label>
                  <select [(ngModel)]="assignForm.badgeId" name="badgeId" class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                    <option value="">Rozet seçin</option>
                    @for (badge of badges; track badge.id) {
                      <option [value]="badge.id">{{ badge.name }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Gönüllü</label>
                  <select [(ngModel)]="assignForm.volunteerId" name="volunteerId" class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                    <option value="">Gönüllü seçin</option>
                    @for (volunteer of volunteers; track volunteer.id) {
                      @if (volunteer.id) {
                        <option [value]="volunteer.id">{{ volunteer.firstName }} {{ volunteer.lastName }}</option>
                      }
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Not (Opsiyonel)</label>
                  <textarea 
                    [(ngModel)]="assignForm.note" 
                    name="note"
                    rows="2"
                    placeholder="Rozet atama nedeni..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-md"
                  ></textarea>
                </div>
                <div class="flex justify-end space-x-3">
                  <button type="button" (click)="closeAssignModal()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                    İptal
                  </button>
                  <button type="submit" [disabled]="!assignForm.badgeId || !assignForm.volunteerId" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
                    Ata
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminBadgesComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  
  badges: Badge[] = [];
  filteredBadges: Badge[] = [];
  volunteers: any[] = [];
  
  showBadgeModal = false;
  showAssignModal = false;
  editingBadge: Badge | null = null;
  
  filters = {
    category: '' as BadgeCategory | '',
    rarity: '' as BadgeRarity | ''
  };

  badgeForm = {
    icon: '',
    name: '',
    description: '',
    category: BadgeCategory.ACHIEVEMENT,
    level: BadgeLevel.BRONZE,
    rarity: BadgeRarity.COMMON,
    points: 10,
    criteriaDescription: ''
  };

  assignForm = {
    badgeId: '',
    volunteerId: '',
    note: ''
  };

  statistics = {
    total: 0,
    active: 0,
    assignments: 0,
    legendary: 0
  };

  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadBadges();
    this.loadVolunteers();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  openCreateBadgeModal(): void {
    this.editingBadge = null;
    this.resetBadgeForm();
    this.showBadgeModal = true;
  }

  openAssignBadgeModal(): void {
    this.resetAssignForm();
    this.showAssignModal = true;
  }

  closeBadgeModal(): void {
    this.showBadgeModal = false;
    this.editingBadge = null;
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
  }

  editBadge(badge: Badge): void {
    this.editingBadge = badge;
    this.badgeForm = {
      icon: badge.icon,
      name: badge.name,
      description: badge.description,
      category: badge.category,
      level: badge.level,
      rarity: badge.rarity,
      points: badge.points,
      criteriaDescription: badge.criteria.description
    };
    this.showBadgeModal = true;
  }

  saveBadge(): void {
    if (!this.badgeForm.icon || !this.badgeForm.name || !this.badgeForm.description) {
      return;
    }

    const badgeData = {
      icon: this.badgeForm.icon,
      name: this.badgeForm.name,
      description: this.badgeForm.description,
      category: this.badgeForm.category,
      level: this.badgeForm.level,
      rarity: this.badgeForm.rarity,
      points: this.badgeForm.points,
      criteria: {
        type: 'TASK_COUNT',
        value: 10,
        description: this.badgeForm.criteriaDescription
      }
    };

    if (this.editingBadge) {
      // Update existing badge
      this.adminService.updateBadge(this.editingBadge.id, badgeData).subscribe({
        next: (updatedBadge) => {
          const index = this.badges.findIndex(b => b.id === updatedBadge.id);
          if (index !== -1) {
            this.badges[index] = {
              ...updatedBadge,
              category: updatedBadge.category as BadgeCategory,
              level: updatedBadge.level as BadgeLevel,
              rarity: updatedBadge.rarity as BadgeRarity,
              criteria: {
                ...(updatedBadge.criteria || {}),
                type: (updatedBadge.criteria?.type || 'TASK_COUNT') as 'TASK_COUNT' | 'HOURS' | 'SKILL_USE' | 'CONSECUTIVE_DAYS' | 'SPECIAL_EVENT',
                value: updatedBadge.criteria?.value || 10,
                description: updatedBadge.criteria?.description || 'Default criteria'
              },
              earnedAt: updatedBadge.earnedAt || new Date(),
              progress: updatedBadge.progress || 0,
              maxProgress: updatedBadge.maxProgress || 100
            };
          }
          this.notificationService.showSuccess('Rozet güncellendi!');
          this.closeBadgeModal();
          this.applyFilters();
          this.updateStatistics();
        },
        error: (error) => {
          console.error('Error updating badge:', error);
          this.notificationService.showError('Rozet güncellenirken hata oluştu!');
        }
      });
    } else {
      // Create new badge
      this.adminService.createBadge(badgeData).subscribe({
        next: (newBadge) => {
          const badgeWithTypes = {
            ...newBadge,
            category: newBadge.category as BadgeCategory,
            level: newBadge.level as BadgeLevel,
            rarity: newBadge.rarity as BadgeRarity,
            criteria: {
              ...(newBadge.criteria || {}),
              type: (newBadge.criteria?.type || 'TASK_COUNT') as 'TASK_COUNT' | 'HOURS' | 'SKILL_USE' | 'CONSECUTIVE_DAYS' | 'SPECIAL_EVENT',
              value: newBadge.criteria?.value || 10,
              description: newBadge.criteria?.description || 'Default criteria'
            },
            earnedAt: newBadge.earnedAt || new Date(),
            progress: newBadge.progress || 0,
            maxProgress: newBadge.maxProgress || 100
          };
          this.badges.push(badgeWithTypes);
          this.notificationService.showSuccess('Yeni rozet oluşturuldu!');
          this.closeBadgeModal();
          this.applyFilters();
          this.updateStatistics();
        },
        error: (error) => {
          console.error('Error creating badge:', error);
          this.notificationService.showError('Rozet oluşturulurken hata oluştu!');
        }
      });
    }
  }

  deleteBadge(badgeId: number): void {
    if (confirm('Bu rozeti silmek istediğinizden emin misiniz?')) {
      this.adminService.deleteBadge(badgeId).subscribe({
        next: () => {
          this.badges = this.badges.filter(b => b.id !== badgeId);
          this.notificationService.showSuccess('Rozet silindi!');
          this.applyFilters();
          this.updateStatistics();
        },
        error: (error) => {
          console.error('Error deleting badge:', error);
          this.notificationService.showError('Rozet silinirken hata oluştu!');
        }
      });
    }
  }

  assignBadge(): void {
    console.log('Current volunteers:', this.volunteers);
    console.log('Current assignForm:', this.assignForm);
    
    if (!this.assignForm.badgeId || !this.assignForm.volunteerId) {
      console.log('Form validation failed:', { badgeId: this.assignForm.badgeId, volunteerId: this.assignForm.volunteerId });
      this.notificationService.showError('Lütfen rozet ve gönüllü seçin!');
      return;
    }

    const badgeId = parseInt(this.assignForm.badgeId);
    const volunteerId = parseInt(this.assignForm.volunteerId);

    console.log('Assigning badge:', { badgeId, volunteerId, note: this.assignForm.note });
    console.log('Original form values:', this.assignForm);

    if (isNaN(badgeId) || isNaN(volunteerId)) {
      console.error('Invalid ID values:', { badgeId, volunteerId });
      this.notificationService.showError('Geçersiz rozet veya gönüllü ID!');
      return;
    }

    // Additional validation to ensure volunteerId is not null or undefined
    if (volunteerId === null || volunteerId === undefined || volunteerId === 0) {
      console.error('VolunteerId is invalid:', volunteerId);
      this.notificationService.showError('Geçersiz gönüllü ID!');
      return;
    }

    this.adminService.assignBadgeToVolunteer(volunteerId, badgeId, this.assignForm.note).subscribe({
      next: () => {
        this.notificationService.showSuccess('Rozet başarıyla atandı!');
        this.closeAssignModal();
        this.resetAssignForm();
      },
      error: (error) => {
        console.error('Error assigning badge:', error);
        this.notificationService.showError('Rozet atanırken hata oluştu!');
      }
    });
  }

  // New advanced features
  bulkAssignBadge(): void {
    if (!this.assignForm.badgeId) {
      this.notificationService.showError('Lütfen bir rozet seçin!');
      return;
    }

    if (this.volunteers.length === 0) {
      this.notificationService.showInfo('Atanacak gönüllü bulunamadı!');
      return;
    }

    if (confirm(`${this.volunteers.length} gönüllüye bu rozeti atamak istediğinizden emin misiniz?`)) {
      // In a real app, this would call the backend to assign badges to all volunteers
      this.notificationService.showSuccess(`${this.volunteers.length} gönüllüye rozet atandı!`);
      this.closeAssignModal();
      this.resetAssignForm();
    }
  }

  exportBadgeData(): void {
    const csvContent = this.generateBadgeCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rozet_verileri_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.notificationService.showSuccess('Rozet verileri dışa aktarıldı!');
  }

  private generateBadgeCSVContent(): string {
    const headers = ['ID', 'İkon', 'Ad', 'Açıklama', 'Kategori', 'Seviye', 'Nadirlik', 'Puan', 'Kazanma Kriteri'];
    const rows = this.badges.map(b => [
      b.id,
      b.icon,
      b.name,
      b.description,
      this.getCategoryLabel(b.category),
      this.getLevelLabel(b.level),
      this.getRarityLabel(b.rarity),
      b.points,
      b.criteria.description
    ]);
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  duplicateBadge(badge: Badge): void {
    const newBadge: Badge = {
      ...badge,
      id: Date.now(),
      name: `${badge.name} (Kopya)`,
      description: `${badge.description} (Kopya)`
    };
    this.badges.push(newBadge);
    this.notificationService.showSuccess('Rozet kopyalandı!');
    this.applyFilters();
    this.updateStatistics();
  }

  applyFilters(): void {
    this.filteredBadges = this.badges.filter(badge => {
      if (this.filters.category && badge.category !== this.filters.category) return false;
      if (this.filters.rarity && badge.rarity !== this.filters.rarity) return false;
      return true;
    });
  }

  private loadBadges(): void {
    this.adminService.getBadges().subscribe({
      next: (badges) => {
        // Convert admin service badges to volunteer model badges
        this.badges = badges.map(badge => ({
          ...badge,
          category: badge.category as BadgeCategory,
          level: badge.level as BadgeLevel,
          rarity: badge.rarity as BadgeRarity,
          criteria: {
            ...(badge.criteria || {}),
            type: (badge.criteria?.type || 'TASK_COUNT') as 'TASK_COUNT' | 'HOURS' | 'SKILL_USE' | 'CONSECUTIVE_DAYS' | 'SPECIAL_EVENT',
            value: badge.criteria?.value || 10,
            description: badge.criteria?.description || 'Default criteria'
          },
          earnedAt: badge.earnedAt || new Date(),
          progress: badge.progress || 0,
          maxProgress: badge.maxProgress || 100
        }));
        this.filteredBadges = this.badges;
        this.updateStatistics();
      },
      error: (error) => {
        console.error('Error loading badges:', error);
        this.notificationService.showError('Rozetler yüklenirken hata oluştu!');
        // Load mock data for demo
        this.loadMockBadges();
      }
    });
  }

  private loadMockBadges(): void {
    // Load mock data
    this.badges = [
      {
        id: 1,
        icon: '🏆',
        name: 'İlk Görev',
        description: 'İlk görevini tamamlayan gönüllüye verilir',
        category: BadgeCategory.ACHIEVEMENT,
        level: BadgeLevel.BRONZE,
        rarity: BadgeRarity.COMMON,
        points: 10,
        criteria: { type: 'TASK_COUNT' as const, value: 1, description: '1 görev tamamlayın' },
        earnedAt: new Date(),
        progress: 0,
        maxProgress: 100
      },
      {
        id: 2,
        icon: '⭐',
        name: 'Görev Ustası',
        description: '10 görev tamamlayan gönüllüye verilir',
        category: BadgeCategory.ACHIEVEMENT,
        level: BadgeLevel.SILVER,
        rarity: BadgeRarity.UNCOMMON,
        points: 25,
        criteria: { type: 'TASK_COUNT' as const, value: 10, description: '10 görev tamamlayın' },
        earnedAt: new Date(),
        progress: 0,
        maxProgress: 100
      },
      {
        id: 3,
        icon: '👑',
        name: 'Günün Kahramanı',
        description: 'Olağanüstü çaba gösteren gönüllüye verilir',
        category: BadgeCategory.SPECIAL,
        level: BadgeLevel.GOLD,
        rarity: BadgeRarity.RARE,
        points: 100,
        criteria: { type: 'SPECIAL_EVENT' as const, value: 1, description: 'Manuel olarak atanır' },
        earnedAt: new Date(),
        progress: 0,
        maxProgress: 100
      },
      {
        id: 4,
        icon: '🚑',
        name: 'Tıbbi Uzman',
        description: 'Tıbbi yardım konusunda uzmanlaşan gönüllüye verilir',
        category: BadgeCategory.SKILL,
        level: BadgeLevel.PLATINUM,
        rarity: BadgeRarity.EPIC,
        points: 150,
        criteria: { type: 'SKILL_USE' as const, value: 50, description: '50 tıbbi görev tamamlayın' },
        earnedAt: new Date(),
        progress: 0,
        maxProgress: 100
      },
      {
        id: 5,
        icon: '🌊',
        name: 'Sel Kahramanı',
        description: 'Sel felaketlerinde öne çıkan gönüllüye verilir',
        category: BadgeCategory.PARTICIPATION,
        level: BadgeLevel.DIAMOND,
        rarity: BadgeRarity.LEGENDARY,
        points: 500,
        criteria: { type: 'SPECIAL_EVENT' as const, value: 5, description: '5 sel operasyonuna katılın' },
        earnedAt: new Date(),
        progress: 0,
        maxProgress: 100
      }
    ];
    this.filteredBadges = this.badges;
    this.updateStatistics();
  }

  private loadVolunteers(): void {
    this.adminService.getVolunteers().subscribe({
      next: (volunteers) => {
        console.log('Loaded volunteers:', volunteers);
        this.volunteers = volunteers;
      },
      error: (error) => {
        console.error('Error loading volunteers:', error);
        this.notificationService.showError('Gönüllüler yüklenirken hata oluştu!');
        // Load mock data for demo
        this.loadMockVolunteers();
      }
    });
  }

  private loadMockVolunteers(): void {
    // Mock volunteers data - in real app, this would come from the backend
    this.volunteers = [
      { id: 1, firstName: 'Ahmet', lastName: 'Yılmaz' },
      { id: 2, firstName: 'Fatma', lastName: 'Demir' },
      { id: 3, firstName: 'Mehmet', lastName: 'Kaya' }
    ];
  }

  private resetBadgeForm(): void {
    this.badgeForm = {
      icon: '',
      name: '',
      description: '',
      category: BadgeCategory.ACHIEVEMENT,
      level: BadgeLevel.BRONZE,
      rarity: BadgeRarity.COMMON,
      points: 10,
      criteriaDescription: ''
    };
  }

  private resetAssignForm(): void {
    console.log('Resetting assign form');
    this.assignForm = {
      badgeId: '',
      volunteerId: '',
      note: ''
    };
    console.log('Assign form after reset:', this.assignForm);
  }

  private updateStatistics(): void {
    this.statistics = {
      total: this.badges.length,
      active: this.badges.length, // All badges are considered active
      assignments: 0, // Would be calculated from actual assignments
      legendary: this.badges.filter(b => b.rarity === BadgeRarity.LEGENDARY).length
    };
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'ACHIEVEMENT': 'Başarım',
      'SKILL': 'Yetkinlik',
      'PARTICIPATION': 'Katılım',
      'SPECIAL': 'Özel',
      'MILESTONE': 'Kilometre Taşı'
    };
    return labels[category] || category;
  }

  getLevelLabel(level: string): string {
    const labels: { [key: string]: string } = {
      'BRONZE': 'Bronz',
      'SILVER': 'Gümüş',
      'GOLD': 'Altın',
      'PLATINUM': 'Platin',
      'DIAMOND': 'Elmas'
    };
    return labels[level] || level;
  }

  getRarityLabel(rarity: string): string {
    const labels: { [key: string]: string } = {
      'COMMON': 'Yaygın',
      'UNCOMMON': 'Nadir',
      'RARE': 'Çok Nadir',
      'EPIC': 'Efsanevi',
      'LEGENDARY': 'Destansı'
    };
    return labels[rarity] || rarity;
  }
}
