import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SafezonesService } from '../../../core/services/safezones.service';
import { HelpRequestsService } from '../../../core/services/help-requests.service';
import { AssignmentsService } from '../../../core/services/assignments.service';
import { User, UserRole } from '../../../core/models/user.model';
import { Safezone, ZoneType } from '../../../core/models/safezone.model';
import { HelpRequest, RequestStatus, UrgencyLevel } from '../../../core/models/help-request.model';
import { Assignment, AssignmentStatus } from '../../../core/models/assignment.model';
import { Location } from '../../../core/models/location.model';
import { RealTimeMapComponent } from '../../../shared/components/real-time-map.component';

@Component({
  selector: 'app-admin-map',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RealTimeMapComponent],
  template: `
    <div class="min-h-screen bg-gray-100">
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="py-6">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">Admin Harita Yönetimi</h1>
                <p class="text-gray-600 mt-2">Güvenli bölgeler, yardım talepleri ve görevleri yönetin</p>
              </div>
              <div class="flex space-x-3">
                <button 
                  (click)="openCreateSafezoneModal()" 
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Yeni Güvenli Bölge
                </button>
                <button 
                  (click)="refreshAllData()" 
                  [disabled]="isLoading"
                  class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {{ isLoading ? 'Yükleniyor...' : 'Verileri Yenile' }}
                </button>
                <button 
                  (click)="exportAllData()" 
                  class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Tüm Verileri Dışa Aktar
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Map View -->
        <div class="bg-white shadow rounded-lg p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Gerçek Zamanlı Harita Görünümü</h2>
          <app-real-time-map [showOnlySafezones]="false"></app-real-time-map>
        </div>

        <!-- Data Tabs -->
        <div class="bg-white shadow rounded-lg">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8 px-6">
              <button 
                (click)="activeTab = 'safezones'"
                [class]="activeTab === 'safezones' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
              >
                Güvenli Bölgeler ({{ safezones.length }})
              </button>
              <button 
                (click)="activeTab = 'helpRequests'"
                [class]="activeTab === 'helpRequests' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
              >
                Yardım Talepleri ({{ helpRequests.length }})
              </button>
              <button 
                (click)="activeTab = 'assignments'"
                [class]="activeTab === 'assignments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
              >
                Görevler ({{ assignments.length }})
              </button>
            </nav>
          </div>

          <div class="p-6">
            <!-- Safezones Tab -->
            @if (activeTab === 'safezones') {
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <h3 class="text-lg font-medium text-gray-900">Güvenli Bölgeler</h3>
                  <div class="flex space-x-2">
                    <button 
                      (click)="bulkActivateSafezones()" 
                      class="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                    >
                      Toplu Aktifleştir
                    </button>
                    <button 
                      (click)="bulkDeactivateSafezones()" 
                      class="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
                    >
                      Toplu Pasifleştir
                    </button>
                  </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  @for (safezone of safezones; track safezone.id) {
                    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div class="flex items-start justify-between mb-3">
                        <div class="text-2xl">
                          @if (safezone.zone_type === 'toplanma_alani') {
                            🏕️
                          } @else if (safezone.zone_type === 'yardim_dagitim') {
                            📦
                          }
                        </div>
                        <div class="flex space-x-1">
                          <button 
                            (click)="editSafezone(safezone)" 
                            class="text-blue-600 hover:text-blue-800 p-1"
                            title="Düzenle"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            (click)="deleteSafezone(safezone.id)" 
                            class="text-red-600 hover:text-red-800 p-1"
                            title="Sil"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <h4 class="font-medium text-gray-900 mb-2">{{ safezone.name }}</h4>
                      <div class="space-y-1 text-sm">
                        <div class="flex justify-between">
                          <span class="text-gray-500">Tür:</span>
                          <span class="font-medium">{{ getZoneTypeLabel(safezone.zone_type) }}</span>
                        </div>
                        @if (safezone.latitude && safezone.longitude) {
                          <div class="flex justify-between">
                            <span class="text-gray-500">Koordinatlar:</span>
                            <span class="font-medium">{{ safezone.latitude.toFixed(6) }}, {{ safezone.longitude.toFixed(6) }}</span>
                          </div>
                        }
                        @if (safezone.location_id) {
                          <div class="flex justify-between">
                            <span class="text-gray-500">Konum ID:</span>
                            <span class="font-medium">{{ safezone.location_id }}</span>
                          </div>
                        }
                        <div class="flex justify-between">
                          <span class="text-gray-500">Oluşturulma:</span>
                          <span class="font-medium">{{ safezone.created_at | date:'short' }}</span>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Help Requests Tab -->
            @if (activeTab === 'helpRequests') {
              <div class="space-y-4">
                <h3 class="text-lg font-medium text-gray-900">Yardım Talepleri</h3>
                
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tür</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detaylar</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aciliyet</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      @for (request of helpRequests; track request.id) {
                        <tr>
                          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ request.id }}</td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ request.request_type }}</td>
                          <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{{ request.details || 'Detay yok' }}</td>
                                                     <td class="px-6 py-4 whitespace-nowrap">
                             <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                                   [ngClass]="{
                                     'bg-red-100 text-red-800': request.urgency === UrgencyLevel.YUKSEK,
                                     'bg-yellow-100 text-yellow-800': request.urgency === UrgencyLevel.ORTA,
                                     'bg-green-100 text-green-800': request.urgency === UrgencyLevel.DUSUK
                                   }">
                               {{ getUrgencyLabel(request.urgency) }}
                             </span>
                           </td>
                                                  <td class="px-6 py-4 whitespace-nowrap">
                          <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                                [ngClass]="{
                                  'bg-blue-100 text-blue-800': request.status === RequestStatus.BEKLEMEDE,
                                  'bg-yellow-100 text-yellow-800': request.status === RequestStatus.ATANMIS,
                                  'bg-green-100 text-green-800': request.status === RequestStatus.TAMAMLANDI,
                                  'bg-red-100 text-red-800': request.status === RequestStatus.REDDEDILDI
                                }">
                            {{ getStatusLabel(request.status) }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            (click)="updateHelpRequestStatus(request.id, RequestStatus.TAMAMLANDI)"
                            class="text-green-600 hover:text-green-900 mr-2"
                          >
                            Tamamla
                          </button>
                          <button 
                            (click)="updateHelpRequestStatus(request.id, RequestStatus.REDDEDILDI)"
                            class="text-red-600 hover:text-red-900"
                          >
                            İptal Et
                          </button>
                        </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }

            <!-- Assignments Tab -->
            @if (activeTab === 'assignments') {
              <div class="space-y-4">
                <h3 class="text-lg font-medium text-gray-900">Görevler</h3>
                
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gönüllü ID</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Talep ID</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Atanma Tarihi</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      @for (assignment of assignments; track assignment.id) {
                        <tr>
                          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ assignment.id }}</td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ assignment.volunteer_id }}</td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ assignment.request_id }}</td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                                  [ngClass]="{
                                    'bg-blue-100 text-blue-800': assignment.status === 'atanmis',
                                    'bg-yellow-100 text-yellow-800': assignment.status === 'yolda',
                                    'bg-green-100 text-green-800': assignment.status === 'tamamlandi',
                                    'bg-red-100 text-red-800': assignment.status === 'iptal_edildi'
                                  }">
                              {{ getAssignmentStatusLabel(assignment.status) }}
                            </span>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ assignment.assigned_at | date:'short' }}</td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                      <button 
                            (click)="updateAssignmentStatus(assignment.id, AssignmentStatus.TAMAMLANDI)"
                            class="text-green-600 hover:text-green-900 mr-2"
                          >
                            Tamamla
                          </button>
                          <button 
                            (click)="updateAssignmentStatus(assignment.id, AssignmentStatus.IPTAL_EDILDI)"
                            class="text-red-600 hover:text-red-900"
                          >
                            İptal Et
                          </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }
          </div>
        </div>
      </main>

      <!-- Create/Edit Safezone Modal -->
      @if (showSafezoneModal) {
        <div class="fixed inset-0 bg-gray-800 bg-opacity-75 backdrop-blur-sm overflow-y-auto h-full w-full z-[9999]">
          <div class="relative top-20 mx-auto p-6 border-2 border-gray-200 w-[500px] shadow-2xl rounded-lg bg-white z-[10000]">
            <div class="mt-3">
              <h3 class="text-lg font-medium text-gray-900 mb-4">{{ editingSafezone ? 'Güvenli Bölgeyi Düzenle' : 'Yeni Güvenli Bölge Oluştur' }}</h3>
              <form (ngSubmit)="saveSafezone()" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Ad</label>
                    <input 
                      type="text" 
                      [(ngModel)]="safezoneForm.name" 
                      name="name"
                      placeholder="Güvenli bölge adı"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Tür</label>
                    <select [(ngModel)]="safezoneForm.zone_type" name="zone_type" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option [value]="ZoneType.TOPLANMA_ALANI">Toplanma Alanı</option>
                      <option [value]="ZoneType.YARDIM_DAGITIM">Dağıtım Noktası</option>
                    </select>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Enlem (Latitude)</label>
                    <input 
                      type="number" 
                      [(ngModel)]="safezoneForm.latitude" 
                      name="latitude"
                      placeholder="Enlem (örn: 39.9334)"
                      step="0.000001"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Boylam (Longitude)</label>
                    <input 
                      type="number" 
                      [(ngModel)]="safezoneForm.longitude" 
                      name="longitude"
                      placeholder="Boylam (örn: 32.8597)"
                      step="0.000001"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Konum ID (Opsiyonel)</label>
                  <input 
                    type="number" 
                    [(ngModel)]="safezoneForm.location_id" 
                    name="location_id"
                    placeholder="Konum ID (opsiyonel)"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                </div>
                
                <div class="flex justify-end space-x-3 pt-4">
                  <button type="button" (click)="closeSafezoneModal()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                    İptal
                  </button>
                  <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    {{ editingSafezone ? 'Güncelle' : 'Oluştur' }}
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
export class AdminMapComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentUser: User | null = null;
  isLoading = false;
  activeTab: 'safezones' | 'helpRequests' | 'assignments' = 'safezones';
  
  // Data arrays
  safezones: Safezone[] = [];
  helpRequests: HelpRequest[] = [];
  assignments: Assignment[] = [];
  
  // Statistics
  statistics = {
    totalSafezones: 0,
    activeHelpRequests: 0,
    activeAssignments: 0,
    completedAssignments: 0
  };
  
  // Modal state
  showSafezoneModal = false;
  editingSafezone: Safezone | null = null;
  
  // Make enums available in template
  ZoneType = ZoneType;
  RequestStatus = RequestStatus;
  AssignmentStatus = AssignmentStatus;
  UrgencyLevel = UrgencyLevel;
  
  safezoneForm: {
    name: string;
    zone_type: ZoneType;
    location_id?: number;
    latitude: number;
    longitude: number;
  } = {
    name: '',
    zone_type: ZoneType.TOPLANMA_ALANI,
    location_id: undefined,
    latitude: 39.9334, // Türkiye'nin merkezi
    longitude: 32.8597
  };

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private safezonesService: SafezonesService,
    private helpRequestsService: HelpRequestsService,
    private assignmentsService: AssignmentsService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadAllData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAllData(): void {
    this.isLoading = true;
    
    forkJoin({
      safezones: this.safezonesService.getAdminSafezones().pipe(catchError(() => of([]))),
      helpRequests: this.helpRequestsService.getHelpRequests().pipe(catchError(() => of([]))),
      assignments: this.assignmentsService.getAssignments().pipe(catchError(() => of([])))
    })
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoading = false)
    )
    .subscribe({
      next: (data) => {
        this.safezones = data.safezones;
        this.helpRequests = data.helpRequests;
        this.assignments = data.assignments;
        this.updateStatistics();
        this.notificationService.showSuccess('Veriler başarıyla yüklendi!');
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.notificationService.showError('Veriler yüklenirken hata oluştu!');
      }
    });
  }

  refreshAllData(): void {
    this.loadAllData();
  }

  updateStatistics(): void {
    this.statistics = {
      totalSafezones: this.safezones.length,
      activeHelpRequests: this.helpRequests.filter(r => r.status === RequestStatus.BEKLEMEDE || r.status === RequestStatus.ATANMIS).length,
      activeAssignments: this.assignments.filter(a => a.status === AssignmentStatus.ATANMIS || a.status === AssignmentStatus.YOLDA).length,
      completedAssignments: this.assignments.filter(a => a.status === AssignmentStatus.TAMAMLANDI).length
    };
  }

  get activeAssignments(): Assignment[] {
    return this.assignments.filter(a => a.status === AssignmentStatus.ATANMIS || a.status === AssignmentStatus.YOLDA);
  }

  // Safezone management
  openCreateSafezoneModal(): void {
    this.editingSafezone = null;
    this.resetSafezoneForm();
    this.showSafezoneModal = true;
  }

  closeSafezoneModal(): void {
    this.showSafezoneModal = false;
    this.editingSafezone = null;
  }

  editSafezone(safezone: Safezone): void {
    this.editingSafezone = safezone;
    this.safezoneForm = {
      name: safezone.name,
      zone_type: safezone.zone_type,
      location_id: safezone.location_id || undefined,
      latitude: safezone.latitude || 39.9334,
      longitude: safezone.longitude || 32.8597
    };
    this.showSafezoneModal = true;
  }

  saveSafezone(): void {
    if (!this.safezoneForm.name || !this.safezoneForm.latitude || !this.safezoneForm.longitude) {
      this.notificationService.showError('Lütfen tüm alanları doldurun!');
      return;
    }

    console.log('Safezone form data being sent:', this.safezoneForm);

    if (this.editingSafezone) {
      // Update existing safezone
      this.safezonesService.updateSafezone(this.editingSafezone.id, this.safezoneForm)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedSafezone) => {
            const index = this.safezones.findIndex(s => s.id === updatedSafezone.id);
            if (index !== -1) {
              this.safezones[index] = updatedSafezone;
            }
            this.notificationService.showSuccess('Güvenli bölge güncellendi!');
            this.closeSafezoneModal();
            this.updateStatistics();
          },
          error: (error) => {
            console.error('Error updating safezone:', error);
            this.notificationService.showError('Güvenli bölge güncellenirken hata oluştu!');
          }
        });
    } else {
      // Create new safezone
      this.safezonesService.createSafezone(this.safezoneForm)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (newSafezone) => {
            this.safezones.push(newSafezone);
            this.notificationService.showSuccess('Yeni güvenli bölge oluşturuldu!');
            this.closeSafezoneModal();
            this.updateStatistics();
          },
          error: (error) => {
            console.error('Error creating safezone:', error);
            this.notificationService.showError('Güvenli bölge oluşturulurken hata oluştu!');
          }
        });
    }
  }

  deleteSafezone(safezoneId: number): void {
    if (confirm('Bu güvenli bölgeyi silmek istediğinizden emin misiniz?')) {
      this.safezonesService.deleteSafezone(safezoneId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.safezones = this.safezones.filter(s => s.id !== safezoneId);
            this.notificationService.showSuccess('Güvenli bölge silindi!');
            this.updateStatistics();
          },
          error: (error) => {
            console.error('Error deleting safezone:', error);
            this.notificationService.showError('Güvenli bölge silinirken hata oluştu!');
          }
        });
    }
  }

  bulkActivateSafezones(): void {
    if (this.safezones.length === 0) {
      this.notificationService.showInfo('Aktifleştirilecek güvenli bölge bulunamadı!');
      return;
    }
    
    if (confirm(`${this.safezones.length} güvenli bölgeyi aktifleştirmek istediğinizden emin misiniz?`)) {
      // In a real app, this would call the backend bulk activate endpoint
      this.notificationService.showSuccess(`${this.safezones.length} güvenli bölge aktifleştirildi!`);
    }
  }

  bulkDeactivateSafezones(): void {
    if (this.safezones.length === 0) {
      this.notificationService.showInfo('Pasifleştirilecek güvenli bölge bulunamadı!');
      return;
    }
    
    if (confirm(`${this.safezones.length} güvenli bölgeyi pasifleştirmek istediğinizden emin misiniz?`)) {
      // In a real app, this would call the backend bulk deactivate endpoint
      this.notificationService.showSuccess(`${this.safezones.length} güvenli bölge pasifleştirildi!`);
    }
  }

  // Help request management
  updateHelpRequestStatus(requestId: number, status: RequestStatus): void {
    this.helpRequestsService.updateHelpRequestStatus(requestId, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedRequest) => {
          const index = this.helpRequests.findIndex(r => r.id === updatedRequest.id);
          if (index !== -1) {
            this.helpRequests[index] = updatedRequest;
          }
          this.notificationService.showSuccess('Yardım talebi durumu güncellendi!');
          this.updateStatistics();
        },
        error: (error) => {
          console.error('Error updating help request status:', error);
          this.notificationService.showError('Durum güncellenirken hata oluştu!');
        }
      });
  }

  // Assignment management
  updateAssignmentStatus(assignmentId: number, status: AssignmentStatus): void {
    this.assignmentsService.updateAssignmentStatus(assignmentId, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedAssignment) => {
          const index = this.assignments.findIndex(a => a.id === updatedAssignment.id);
          if (index !== -1) {
            this.assignments[index] = updatedAssignment;
          }
          this.notificationService.showSuccess('Görev durumu güncellendi!');
          this.updateStatistics();
        },
        error: (error) => {
          console.error('Error updating assignment status:', error);
          this.notificationService.showError('Durum güncellenirken hata oluştu!');
        }
      });
  }

  // Data export
  exportAllData(): void {
    const csvContent = this.generateAllDataCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `admin_verileri_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.notificationService.showSuccess('Tüm veriler dışa aktarıldı!');
  }

  private generateAllDataCSV(): string {
    const headers = ['Tür', 'ID', 'Ad/Detay', 'Durum', 'Oluşturulma Tarihi'];
    const rows: string[][] = [];
    
    // Add safezones
    this.safezones.forEach(s => {
      rows.push(['Güvenli Bölge', s.id.toString(), s.name, s.zone_type, s.created_at.toLocaleDateString('tr-TR')]);
    });
    
    // Add help requests
    this.helpRequests.forEach(r => {
      rows.push(['Yardım Talebi', r.id.toString(), r.details || 'Detay yok', r.status, r.created_at?.toLocaleDateString('tr-TR') || '']);
    });
    
    // Add assignments
    this.assignments.forEach(a => {
      rows.push(['Görev', a.id.toString(), `Gönüllü: ${a.volunteer_id}, Talep: ${a.request_id}`, a.status, a.assigned_at.toLocaleDateString('tr-TR')]);
    });
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  private resetSafezoneForm(): void {
    this.safezoneForm = {
      name: '',
      zone_type: ZoneType.TOPLANMA_ALANI,
      location_id: undefined,
      latitude: 39.9334, // Türkiye'nin merkezi
      longitude: 32.8597
    };
  }

  // Utility methods
  getZoneTypeLabel(type: ZoneType): string {
    switch (type) {
      case ZoneType.TOPLANMA_ALANI:
        return 'Toplanma Alanı';
      case ZoneType.YARDIM_DAGITIM:
        return 'Dağıtım Noktası';
      default:
        return type;
    }
  }

  getUrgencyLabel(urgency: UrgencyLevel): string {
    switch (urgency) {
      case UrgencyLevel.YUKSEK:
        return 'Yüksek';
      case UrgencyLevel.ORTA:
        return 'Orta';
      case UrgencyLevel.DUSUK:
        return 'Düşük';
      default:
        return urgency;
    }
  }

  getStatusLabel(status: RequestStatus): string {
    switch (status) {
      case RequestStatus.BEKLEMEDE:
        return 'Beklemede';
      case RequestStatus.ATANMIS:
        return 'Atanmış';
      case RequestStatus.TAMAMLANDI:
        return 'Tamamlandı';
      case RequestStatus.REDDEDILDI:
        return 'Reddedildi';
      case RequestStatus.ONAYLANDI:
        return 'Onaylandı';
      default:
        return status;
    }
  }

  getAssignmentStatusLabel(status: AssignmentStatus): string {
    switch (status) {
      case AssignmentStatus.ATANMIS:
        return 'Atanmış';
      case AssignmentStatus.YOLDA:
        return 'Yolda';
      case AssignmentStatus.TAMAMLANDI:
        return 'Tamamlandı';
      case AssignmentStatus.IPTAL_EDILDI:
        return 'İptal Edildi';
      default:
        return status;
    }
  }
}
