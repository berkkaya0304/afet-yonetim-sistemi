import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AssignmentsService } from '../../../core/services/assignments.service';
import { Assignment, AssignmentStatus } from '../../../core/models/assignment.model';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole } from '../../../core/models/user.model';
import { WebSocketService } from '../../../core/services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-assignments-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="container-responsive">
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div>
              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Görev Atamaları</h1>
              <p class="text-gray-600 mt-1">Görev atamalarını görüntüle ve yönet</p>
            </div>
            <div class="flex items-center space-x-3">
              <!-- WebSocket Status -->
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 rounded-full" 
                     [ngClass]="isWebSocketConnected ? 'bg-green-500' : 'bg-red-500'"></div>
                <span class="text-sm text-gray-600">
                  {{ isWebSocketConnected ? 'Bağlı' : 'Bağlantı Yok' }}
                </span>
              </div>
              
              @if (isAdmin()) {
                <button 
                  routerLink="/assignments/create"
                  class="btn-primary text-sm px-4 py-2.5"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Yeni Görev Ata
                </button>
              }
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="container-responsive section-padding">
        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          <div class="card p-4">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Toplam Görev</p>
                <p class="text-2xl font-bold text-gray-900">{{ assignments.length }}</p>
              </div>
            </div>
          </div>

          <div class="card p-4">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Bekleyen</p>
                <p class="text-2xl font-bold text-gray-900">{{ getAssignmentsByStatus(AssignmentStatus.ATANMIS).length }}</p>
              </div>
            </div>
          </div>

          <div class="card p-4">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Tamamlanan</p>
                <p class="text-2xl font-bold text-gray-900">{{ getAssignmentsByStatus(AssignmentStatus.TAMAMLANDI).length }}</p>
              </div>
            </div>
          </div>

          <div class="card p-4">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">İptal Edilen</p>
                <p class="text-2xl font-bold text-gray-900">{{ getAssignmentsByStatus(AssignmentStatus.IPTAL_EDILDI).length }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="card p-4 sm:p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Filtreler</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="form-group">
              <label class="form-label">Durum</label>
              <select 
                [(ngModel)]="selectedStatus" 
                (change)="filterAssignments()"
                class="form-input"
              >
                <option value="">Tüm Durumlar</option>
                <option [value]="AssignmentStatus.ATANMIS">Atanmış</option>
                <option [value]="AssignmentStatus.YOLDA">Yolda</option>
                <option [value]="AssignmentStatus.TAMAMLANDI">Tamamlandı</option>
                <option [value]="AssignmentStatus.IPTAL_EDILDI">İptal Edildi</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Sıralama</label>
              <select 
                [(ngModel)]="sortBy" 
                (change)="sortAssignments()"
                class="form-input"
              >
                <option value="assigned_at">Atanma Tarihi</option>
                <option value="status">Durum</option>
                <option value="completed_at">Tamamlanma Tarihi</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Arama</label>
              <input 
                type="text" 
                [(ngModel)]="searchTerm" 
                (input)="filterAssignments()"
                placeholder="Görev ID veya açıklama ara..."
                class="form-input"
              >
            </div>
          </div>

          <!-- Active Filters Display -->
          @if (hasActiveFilters()) {
            <div class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-sm font-medium text-blue-800">Aktif Filtreler:</span>
                @if (selectedStatus) {
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Durum: {{ getStatusLabel(selectedStatus) }}
                    <button (click)="clearStatusFilter()" class="ml-1 text-blue-600 hover:text-blue-800">×</button>
                  </span>
                }
                @if (searchTerm) {
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Arama: "{{ searchTerm }}"
                    <button (click)="clearSearchFilter()" class="ml-1 text-green-600 hover:text-green-800">×</button>
                  </span>
                }
                <button 
                  (click)="clearFilters()"
                  class="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Tümünü Temizle
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Results Summary -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
          <div class="mb-4 sm:mb-0">
            <p class="text-gray-600">
              <span class="font-semibold text-gray-900">{{ filteredAssignments.length }}</span> görev bulundu
              @if (selectedStatus || searchTerm) {
                <span class="text-sm text-gray-500">
                  (filtrelenmiş)
                </span>
              }
            </p>
          </div>
          
          <div class="flex items-center space-x-3">
            @if (selectedStatus || searchTerm) {
              <button 
                (click)="clearFilters()"
                class="btn-secondary text-sm px-3 py-2"
              >
                Filtreleri Temizle
              </button>
            }
          </div>
        </div>

        <!-- Assignments Grid -->
        @if (filteredAssignments.length > 0) {
          <div class="grid-responsive-2 xl:grid-cols-3 gap-4 sm:gap-6">
            @for (assignment of filteredAssignments; track assignment.id) {
              <div class="card-hover p-6">
                <!-- Assignment Header -->
                <div class="flex justify-between items-start mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <h3 class="font-semibold text-gray-900">Görev #{{ assignment.id }}</h3>
                      <p class="text-sm text-gray-500">{{ assignment.assigned_at | date:'short' }}</p>
                    </div>
                  </div>
                  
                  <span class="status-badge"
                        [ngClass]="{
                          'status-pending': assignment.status === AssignmentStatus.ATANMIS,
                          'status-progress': assignment.status === AssignmentStatus.YOLDA,
                          'status-completed': assignment.status === AssignmentStatus.TAMAMLANDI,
                          'status-cancelled': assignment.status === AssignmentStatus.IPTAL_EDILDI
                        }">
                    {{ getStatusLabel(assignment.status) }}
                  </span>
                </div>

                <!-- Assignment Details -->
                <div class="mb-4">
                  @if (assignment.volunteer_id) {
                    <p class="text-sm text-gray-600 mb-2">
                      <span class="font-medium">Gönüllü ID:</span> {{ assignment.volunteer_id }}
                    </p>
                  }
                  
                  @if (assignment.request_id) {
                    <p class="text-sm text-gray-600 mb-2">
                      <span class="font-medium">Talep ID:</span> {{ assignment.request_id }}
                    </p>
                  }
                  
                  @if (assignment.completed_at) {
                    <p class="text-sm text-gray-600 mb-2">
                      <span class="font-medium">Tamamlanma:</span> {{ assignment.completed_at | date:'short' }}
                    </p>
                  }
                </div>

                <!-- Assignment Footer -->
                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                  <div class="text-sm text-gray-500">
                    <span class="font-medium">Atanma:</span> {{ assignment.assigned_at | date:'dd/MM/yyyy HH:mm' }}
                  </div>
                  
                  <div class="flex space-x-2">
                    <button 
                      [routerLink]="['/assignments', assignment.id]"
                      class="btn-outline text-sm px-3 py-2"
                    >
                      Detayları Gör
                    </button>
                    
                    @if (isAdmin() && assignment.status === AssignmentStatus.ATANMIS) {
                      <button 
                        (click)="updateAssignmentStatus(assignment.id, AssignmentStatus.YOLDA)"
                        class="btn-warning text-sm px-3 py-2"
                      >
                        Yolda
                      </button>
                    }
                    
                    @if (assignment.status === AssignmentStatus.YOLDA) {
                      <button 
                        (click)="updateAssignmentStatus(assignment.id, AssignmentStatus.TAMAMLANDI)"
                        class="btn-success text-sm px-3 py-2"
                      >
                        Tamamla
                      </button>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Empty State -->
        @if (filteredAssignments.length === 0) {
          <div class="text-center py-12">
            <div class="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Görev bulunamadı</h3>
            <p class="text-gray-600 mb-6">
              {{ selectedStatus || searchTerm 
                 ? 'Seçilen filtrelere uygun görev bulunamadı. Filtreleri değiştirmeyi deneyin.' 
                 : 'Henüz görev atanmamış.' }}
            </p>
            @if (isAdmin()) {
              <button 
                routerLink="/assignments/create"
                class="btn-primary"
              >
                İlk Görevi Ata
              </button>
            }
          </div>
        }

        <!-- Loading State -->
        @if (isLoading) {
          <div class="text-center py-12">
            <div class="w-16 h-16 mx-auto mb-4 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            <p class="text-gray-600">Görevler yükleniyor...</p>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .status-badge {
      @apply px-2 py-1 text-xs font-medium rounded-full;
    }
    
    .status-pending {
      @apply bg-yellow-100 text-yellow-800;
    }
    
    .status-progress {
      @apply bg-blue-100 text-blue-800;
    }
    
    .status-completed {
      @apply bg-green-100 text-green-800;
    }
    
    .status-cancelled {
      @apply bg-red-100 text-red-800;
    }
  `]
})
export class AssignmentsListComponent implements OnInit, OnDestroy {
  assignments: Assignment[] = [];
  filteredAssignments: Assignment[] = [];
  isLoading = false;
  isWebSocketConnected = false;
  
  // Filters
  selectedStatus: AssignmentStatus | '' = '';
  searchTerm = '';
  
  // Sorting
  sortBy = 'assigned_at';
  
  // Enums
  AssignmentStatus = AssignmentStatus;
  
  // Subscriptions
  private webSocketSubscriptions: Subscription[] = [];

  constructor(
    private assignmentsService: AssignmentsService,
    private authService: AuthService,
    private webSocketService: WebSocketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAssignments();
    this.setupWebSocket();
  }

  ngOnDestroy(): void {
    this.webSocketSubscriptions.forEach(sub => sub.unsubscribe());
  }

  setupWebSocket(): void {
    this.webSocketService.connect();
    
    const connectionSub = this.webSocketService.isConnected$.subscribe(
      connected => this.isWebSocketConnected = connected
    );
    
    const assignmentUpdatesSub = this.webSocketService.messages$.subscribe(
      message => {
        if (message.type === 'assignment_update') {
          this.handleAssignmentUpdate(message.data);
        }
      }
    );
    
    this.webSocketSubscriptions.push(connectionSub, assignmentUpdatesSub);
  }

  handleAssignmentUpdate(update: any): void {
    // Update the assignment in the local array
    const index = this.assignments.findIndex(a => a.id === update.id);
    if (index !== -1) {
      this.assignments[index] = { ...this.assignments[index], ...update };
      this.filterAssignments();
    }
  }

  loadAssignments(): void {
    this.isLoading = true;
    this.assignmentsService.getAssignments().subscribe({
      next: (assignments) => {
        this.assignments = assignments;
        this.filteredAssignments = assignments;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Görevler yüklenirken hata oluştu:', error);
        this.isLoading = false;
      }
    });
  }

  filterAssignments(): void {
    this.filteredAssignments = this.assignments.filter(assignment => {
      const statusMatch = !this.selectedStatus || assignment.status === this.selectedStatus;
      
      const searchMatch = !this.searchTerm || 
        assignment.id.toString().includes(this.searchTerm) ||
        (assignment.volunteer_id && assignment.volunteer_id.toString().includes(this.searchTerm)) ||
        (assignment.request_id && assignment.request_id.toString().includes(this.searchTerm));
      
      return statusMatch && searchMatch;
    });
    
    this.sortAssignments();
  }

  sortAssignments(): void {
    if (!this.filteredAssignments || this.filteredAssignments.length === 0) return;
    
    this.filteredAssignments.sort((a, b) => {
      switch (this.sortBy) {
        case 'assigned_at':
          return new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime();
        
        case 'status':
          const statusOrder = { 
            [AssignmentStatus.ATANMIS]: 1, 
            [AssignmentStatus.YOLDA]: 2, 
            [AssignmentStatus.TAMAMLANDI]: 3, 
            [AssignmentStatus.IPTAL_EDILDI]: 4 
          };
          return statusOrder[a.status] - statusOrder[b.status];
        
        case 'completed_at':
          if (!a.completed_at && !b.completed_at) return 0;
          if (!a.completed_at) return 1;
          if (!b.completed_at) return -1;
          return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime();
        
        default:
          return 0;
      }
    });
  }

  clearFilters(): void {
    this.selectedStatus = '';
    this.searchTerm = '';
    this.filterAssignments();
  }

  clearStatusFilter(): void {
    this.selectedStatus = '';
    this.filterAssignments();
  }

  clearSearchFilter(): void {
    this.searchTerm = '';
    this.filterAssignments();
  }

  hasActiveFilters(): boolean {
    return !!(this.selectedStatus || this.searchTerm);
  }

  getAssignmentsByStatus(status: AssignmentStatus): Assignment[] {
    return this.assignments.filter(a => a.status === status);
  }

  updateAssignmentStatus(assignmentId: number, newStatus: AssignmentStatus): void {
    // This would typically call a service method to update the status
    console.log(`Görev ${assignmentId} durumu ${newStatus} olarak güncelleniyor`);
    
    // For now, just update locally
    const assignment = this.assignments.find(a => a.id === assignmentId);
    if (assignment) {
      assignment.status = newStatus;
      if (newStatus === AssignmentStatus.TAMAMLANDI) {
        assignment.completed_at = new Date();
      }
      this.filterAssignments();
    }
  }

  getStatusLabel(status: AssignmentStatus): string {
    const labels: { [key in AssignmentStatus]: string } = {
      [AssignmentStatus.ATANMIS]: 'Atanmış',
      [AssignmentStatus.YOLDA]: 'Yolda',
      [AssignmentStatus.TAMAMLANDI]: 'Tamamlandı',
      [AssignmentStatus.IPTAL_EDILDI]: 'İptal Edildi'
    };
    return labels[status] || status;
  }

  isAdmin(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role === UserRole.YONETICI;
  }
}
