import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AdminService } from '../../../core/services/admin.service';
import { User, UserRole } from '../../../core/models/user.model';
import { Subscription } from 'rxjs';
import { VolunteerSkillsModalComponent } from './volunteer-skills-modal/volunteer-skills-modal.component';
import { VolunteerDetailsModalComponent } from './volunteer-details-modal/volunteer-details-modal.component';
import { VolunteerLocationModalComponent } from './volunteer-location-modal/volunteer-location-modal.component';

@Component({
  selector: 'app-admin-volunteers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, VolunteerSkillsModalComponent, VolunteerDetailsModalComponent, VolunteerLocationModalComponent],
  template: `
    <div class="min-h-screen bg-gray-100">
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="py-6">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">Gönüllü Yönetimi</h1>
                <p class="text-gray-600 mt-2">Gönüllülerin yetkinliklerini ve konumlarını takip edin</p>
              </div>
              <div class="flex space-x-3">
                <button 
                  (click)="refreshVolunteers()" 
                  class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Yenile
                </button>
                <button 
                  (click)="bulkActivateVolunteers()" 
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Toplu Aktifleştir
                </button>
                <button 
                  (click)="bulkDeactivateVolunteers()" 
                  class="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Toplu Pasifleştir
                </button>
                <button 
                  (click)="exportVolunteerData()" 
                  class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Veri Dışa Aktar
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Filters and Search -->
        <div class="bg-white shadow rounded-lg p-6 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Durum</label>
              <select [(ngModel)]="filters.status" (change)="applyFilters()" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Tümü</option>
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Pasif</option>
                <option value="SUSPENDED">Askıya Alınmış</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Yetkinlik Seviyesi</label>
              <select [(ngModel)]="filters.skillLevel" (change)="applyFilters()" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Tümü</option>
                <option value="BEGINNER">Başlangıç</option>
                <option value="INTERMEDIATE">Orta</option>
                <option value="ADVANCED">İleri</option>
                <option value="EXPERT">Uzman</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Yetkinlik Kategorisi</label>
              <select [(ngModel)]="filters.skillCategory" (change)="applyFilters()" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Tümü</option>
                <option value="MEDICAL">Tıbbi</option>
                <option value="RESCUE">Kurtarma</option>
                <option value="LOGISTICS">Lojistik</option>
                <option value="COMMUNICATION">İletişim</option>
                <option value="TECHNICAL">Teknik</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Arama</label>
              <input 
                type="text" 
                [(ngModel)]="filters.search" 
                (input)="applyFilters()"
                placeholder="Ad, e-posta veya yetkinlik ara..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div class="bg-white shadow rounded-lg p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Toplam Gönüllü</p>
                <p class="text-2xl font-bold text-gray-900">{{ statistics.total }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white shadow rounded-lg p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Aktif</p>
                <p class="text-2xl font-bold text-gray-900">{{ statistics.active }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white shadow rounded-lg p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Uzman Seviye</p>
                <p class="text-2xl font-bold text-gray-900">{{ statistics.expert }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white shadow rounded-lg p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Konum Takibi</p>
                <p class="text-2xl font-bold text-gray-900">{{ statistics.tracked }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Volunteers List -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Gönüllüler</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gönüllü</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yetkinlikler</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Konum</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Görev Sayısı</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @for (volunteer of filteredVolunteers; track volunteer.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                                                 <div class="ml-4">
                           <div class="text-sm font-medium text-gray-900">{{ volunteer.fullName }}</div>
                           <div class="text-sm text-gray-500">{{ volunteer.email }}</div>
                         </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            [ngClass]="{
                              'bg-green-100 text-green-800': volunteer.isActive,
                              'bg-yellow-100 text-yellow-800': !volunteer.isActive
                            }">
                        {{ getStatusLabel(volunteer.isActive ? 'ACTIVE' : 'INACTIVE') }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex flex-wrap gap-1">
                        @for (skill of volunteer.skills?.slice(0, 3) || []; track skill) {
                          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {{ skill }}
                          </span>
                        }
                        @if ((volunteer.skills?.length || 0) > 3) {
                          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{{ (volunteer.skills?.length || 0) - 3 }}
                          </span>
                        }
                      </div>
                    </td>
                                         <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {{ volunteer.location || 'Belirtilmemiş' }}
                     </td>
                     <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       -
                     </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div class="flex space-x-2">
                        <button 
                          (click)="viewVolunteerDetails(volunteer.id)" 
                          class="text-blue-600 hover:text-blue-900"
                          title="Detayları Görüntüle"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button 
                          (click)="viewVolunteerLocation(volunteer.id)" 
                          class="text-green-600 hover:text-green-900"
                          title="Konumu Görüntüle"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        <button 
                          (click)="manageVolunteerSkills(volunteer.id)" 
                          class="text-purple-600 hover:text-purple-900"
                          title="Yetkinlikleri Yönet"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <!-- Modals -->
      @if (showSkillsModal) {
        <app-volunteer-skills-modal
          [volunteerId]="selectedVolunteerId"
          [volunteerName]="selectedVolunteerName"
          [volunteerEmail]="selectedVolunteerEmail"
          (skillsUpdated)="onSkillsUpdated()"
          (modalClosed)="closeSkillsModal()"
        />
      }

      @if (showDetailsModal) {
        <app-volunteer-details-modal
          [volunteer]="selectedVolunteer"
          (volunteerUpdated)="onVolunteerUpdated()"
          (modalClosed)="closeDetailsModal()"
        />
      }

      @if (showLocationModal) {
        <app-volunteer-location-modal
          [volunteer]="selectedVolunteer"
          (locationUpdated)="onLocationUpdated()"
          (modalClosed)="closeLocationModal()"
        />
      }
    </div>
  `
})
export class AdminVolunteersComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isLoading = false;
  
  volunteers: User[] = [];
  filteredVolunteers: User[] = [];
  
  filters = {
    status: '',
    skillLevel: '',
    skillCategory: '',
    search: ''
  };

  statistics = {
    total: 0,
    active: 0,
    expert: 0,
    tracked: 0
  };

  // Modal states
  showSkillsModal = false;
  showDetailsModal = false;
  showLocationModal = false;
  
  // Selected volunteer data
  selectedVolunteerId = 0;
  selectedVolunteerName = '';
  selectedVolunteerEmail = '';
  selectedVolunteer: User | null = null;

  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadVolunteers();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  refreshVolunteers(): void {
    this.loadVolunteers();
  }



  // New advanced features
  exportVolunteerData(): void {
    // In a real app, this would export volunteer data to CSV/Excel
    const csvContent = this.generateCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `gonullu_verileri_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.notificationService.showSuccess('Gönüllü verileri dışa aktarıldı!');
  }

  private generateCSVContent(): string {
    const headers = ['ID', 'Ad Soyad', 'E-posta', 'Telefon', 'Konum', 'Yetkinlikler', 'Durum', 'Kayıt Tarihi'];
    const rows = this.volunteers.map(v => [
      v.id || '',
      v.fullName || '',
      v.email || '',
      v.phone || '',
      v.location || '',
      (v.skills || []).join(', '),
      v.isActive ? 'Aktif' : 'Pasif',
      v.created_at ? v.created_at.toLocaleDateString('tr-TR') : 'Belirtilmemiş'
    ]);
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  // Bulk operations
  bulkActivateVolunteers(): void {
    const inactiveVolunteers = this.volunteers.filter(v => !v.isActive);
    if (inactiveVolunteers.length === 0) {
      this.notificationService.showInfo('Aktifleştirilecek gönüllü bulunamadı!');
      return;
    }
    
    if (confirm(`${inactiveVolunteers.length} gönüllüyü aktifleştirmek istediğinizden emin misiniz?`)) {
      inactiveVolunteers.forEach(v => v.isActive = true);
      this.applyFilters();
      this.updateStatistics();
      this.notificationService.showSuccess(`${inactiveVolunteers.length} gönüllü aktifleştirildi!`);
    }
  }

  bulkDeactivateVolunteers(): void {
    const activeVolunteers = this.volunteers.filter(v => v.isActive);
    if (activeVolunteers.length === 0) {
      this.notificationService.showInfo('Pasifleştirilecek gönüllü bulunamadı!');
      return;
    }
    
    if (confirm(`${activeVolunteers.length} gönüllüyü pasifleştirmek istediğinizden emin misiniz?`)) {
      activeVolunteers.forEach(v => v.isActive = false);
      this.applyFilters();
      this.updateStatistics();
      this.notificationService.showSuccess(`${activeVolunteers.length} gönüllü pasifleştirildi!`);
    }
  }

  applyFilters(): void {
    this.filteredVolunteers = this.volunteers.filter(volunteer => {
      if (this.filters.status && (volunteer.isActive ? 'ACTIVE' : 'INACTIVE') !== this.filters.status) return false;
      if (this.filters.skillLevel && !volunteer.skills?.some(s => s.includes(this.filters.skillLevel))) return false;
      if (this.filters.skillCategory && !volunteer.skills?.some(s => s.includes(this.filters.skillCategory))) return false;
             if (this.filters.search) {
         const searchTerm = this.filters.search.toLowerCase();
         const matchesName = volunteer.fullName?.toLowerCase().includes(searchTerm);
         const matchesEmail = volunteer.email?.toLowerCase().includes(searchTerm);
         const matchesSkills = volunteer.skills?.some(s => s.toLowerCase().includes(searchTerm));
         if (!matchesName && !matchesEmail && !matchesSkills) return false;
       }
      return true;
    });
    this.updateStatistics();
  }

  private loadVolunteers(): void {
    this.isLoading = true;
    const subscription = this.adminService.getAllUsers().subscribe({
      next: (users: User[]) => {
        // Filter only volunteers and ensure created_at is always available
        this.volunteers = users.filter(user => user.role === 'GONULLU').map(user => ({
          ...user,
          created_at: user.created_at || new Date()
        }));
        this.filteredVolunteers = this.volunteers;
        this.updateStatistics();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading volunteers:', error);
        this.notificationService.showError('Gönüllüler yüklenirken hata oluştu!');
        // Load mock data for demo
        this.loadMockVolunteers();
        this.isLoading = false;
      }
    });
    this.subscriptions.add(subscription);
  }

  private loadMockVolunteers(): void {
    this.volunteers = [
      {
        id: 1,
        fullName: 'Ahmet Yılmaz',
        email: 'ahmet.yilmaz@example.com',
        password_hash: 'mock_hash',
        role: UserRole.GONULLU,
        phone: '+90 555 123 4567',
        location: 'İstanbul',
        skills: ['İlk Yardım', 'Kurtarma'],
        isActive: true,
        created_at: new Date('2020-01-15')
      } as User,
      {
        id: 2,
        fullName: 'Fatma Demir',
        email: 'fatma.demir@example.com',
        password_hash: 'mock_hash',
        role: UserRole.GONULLU,
        phone: '+90 555 234 5678',
        location: 'İstanbul',
        skills: ['Lojistik', 'İletişim'],
        isActive: true,
        created_at: new Date('2019-03-10')
      } as User,
      {
        id: 3,
        fullName: 'Mehmet Kaya',
        email: 'mehmet.kaya@example.com',
        password_hash: 'mock_hash',
        role: UserRole.GONULLU,
        phone: '+90 555 345 6789',
        location: 'İstanbul',
        skills: ['Teknik Destek'],
        isActive: false,
        created_at: new Date('2023-06-20')
      } as User
    ];
    this.filteredVolunteers = this.volunteers;
    this.updateStatistics();
  }

  private updateStatistics(): void {
    this.statistics = {
      total: this.volunteers.length,
      active: this.volunteers.filter(v => v.isActive).length,
      expert: this.volunteers.filter(v => v.skills?.some(s => s.includes('EXPERT'))).length,
      tracked: this.volunteers.filter(v => v.location).length
    };
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'ACTIVE': 'Aktif',
      'INACTIVE': 'Pasif',
      'SUSPENDED': 'Askıya Alınmış'
    };
    return labels[status] || status;
  }

  getSkillCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'MEDICAL': 'Tıbbi',
      'RESCUE': 'Kurtarma',
      'LOGISTICS': 'Lojistik',
      'COMMUNICATION': 'İletişim',
      'TECHNICAL': 'Teknik'
    };
    return labels[category] || category;
  }

  // Modal methods
  viewVolunteerDetails(volunteerId: number): void {
    this.selectedVolunteer = this.volunteers.find(v => v.id === volunteerId) || null;
    this.showDetailsModal = true;
  }

  viewVolunteerLocation(volunteerId: number): void {
    this.selectedVolunteer = this.volunteers.find(v => v.id === volunteerId) || null;
    this.showLocationModal = true;
  }

  manageVolunteerSkills(volunteerId: number): void {
    const volunteer = this.volunteers.find(v => v.id === volunteerId);
    if (volunteer) {
      this.selectedVolunteerId = volunteerId;
      this.selectedVolunteerName = volunteer.fullName || '';
      this.selectedVolunteerEmail = volunteer.email || '';
      this.showSkillsModal = true;
    }
  }

  closeSkillsModal(): void {
    this.showSkillsModal = false;
    this.selectedVolunteerId = 0;
    this.selectedVolunteerName = '';
    this.selectedVolunteerEmail = '';
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedVolunteer = null;
  }

  closeLocationModal(): void {
    this.showLocationModal = false;
    this.selectedVolunteer = null;
  }

  onSkillsUpdated(): void {
    this.refreshVolunteers();
    this.notificationService.showSuccess('Gönüllü yetkinlikleri güncellendi!');
  }

  onVolunteerUpdated(): void {
    this.refreshVolunteers();
    this.notificationService.showSuccess('Gönüllü bilgileri güncellendi!');
  }

  onLocationUpdated(): void {
    this.refreshVolunteers();
    this.notificationService.showSuccess('Gönüllü konum bilgileri güncellendi!');
  }
}
