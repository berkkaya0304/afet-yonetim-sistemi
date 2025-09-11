import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HelpRequestsService } from '../../core/services/help-requests.service';
import { AssignmentsService } from '../../core/services/assignments.service';
import { User, UserRole } from '../../core/models/user.model';
import { HelpRequest, RequestStatus } from '../../core/models/help-request.model';
import { Assignment, AssignmentStatus } from '../../core/models/assignment.model';
import { NotificationService } from '../../core/services/notification.service';
import { RealTimeMapComponent } from '../../shared/components/real-time-map.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RealTimeMapComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="container-responsive">
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div>
              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Dashboard</h1>
              <p class="text-gray-600 mt-1">Hoş geldin, {{ currentUser?.fullName }}</p>
            </div>

          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="container-responsive section-padding">
        <!-- Stats Cards -->
        <div class="grid-responsive-3 mb-8">
          <div class="card-hover p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4 flex-1">
                <p class="text-sm font-medium text-gray-600">Toplam Yardım Talebi</p>
                <p class="text-2xl font-bold text-gray-900">{{ helpRequests.length }}</p>
              </div>
            </div>
          </div>

          <div class="card-hover p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-success-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4 flex-1">
                <p class="text-sm font-medium text-gray-600">Aktif Görevler</p>
                <p class="text-2xl font-bold text-gray-900">{{ activeAssignments.length }}</p>
              </div>
            </div>
          </div>

          <div class="card-hover p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-warning-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4 flex-1">
                <p class="text-sm font-medium text-gray-600">Bekleyen Talepler</p>
                <p class="text-2xl font-bold text-gray-900">{{ pendingRequests.length }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid-responsive-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <button 
            routerLink="/help-requests/create"
            class="group bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white p-6 rounded-xl text-center transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <div class="w-12 h-12 mx-auto mb-4 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-200">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"/>
              </svg>
            </div>
            <div class="font-semibold text-lg">Yardım Talebi Oluştur</div>
            <p class="text-primary-100 text-sm mt-2">Yeni bir yardım talebi oluştur</p>
          </button>

          <button 
            routerLink="/assignments"
            class="group bg-gradient-to-br from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white p-6 rounded-xl text-center transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <div class="w-12 h-12 mx-auto mb-4 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-200">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="font-semibold text-lg">Görevleri Görüntüle</div>
            <p class="text-success-100 text-sm mt-2">Mevcut görevleri incele</p>
          </button>

          <button 
            routerLink="/safezones"
            class="group bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-6 rounded-xl text-center transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <div class="w-12 h-12 mx-auto mb-4 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-200">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
              </svg>
            </div>
            <div class="font-semibold text-lg">Güvenli Bölgeler</div>
            <p class="text-purple-100 text-sm mt-2">Güvenli bölgeleri keşfet</p>
          </button>

        </div>

        <!-- Content Grid -->
        <div class="grid-responsive-2 gap-6 lg:gap-8">
          <!-- Real-time Map -->
          <div class="card p-6 col-span-full">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-bold text-gray-900">Gerçek Zamanlı Harita</h3>
              <p class="text-sm text-gray-600">Yardım talepleri, güvenli bölgeler ve görevler</p>
            </div>
            <app-real-time-map></app-real-time-map>
          </div>

          <!-- Recent Help Requests -->
          <div class="card p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-bold text-gray-900">Son Yardım Talepleri</h3>
              <a routerLink="/help-requests" class="text-primary-600 hover:text-primary-700 text-sm font-medium hover:underline">
                Tümünü Gör →
              </a>
            </div>
            
            <div class="space-y-4">
              @for (request of recentHelpRequests; track request.id) {
                <div class="border border-gray-200 rounded-lg p-4 hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-200">
                  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0">
                    <div class="flex-1">
                      <h4 class="font-semibold text-gray-900 mb-2">
                        {{ request.details?.substring(0, 60) }}{{ request.details && request.details.length > 60 ? '...' : '' }}
                      </h4>
                      <div class="flex flex-wrap gap-2 text-xs text-gray-600">
                        <span class="bg-gray-100 px-2 py-1 rounded-full">{{ request.request_type }}</span>
                        <span class="bg-gray-100 px-2 py-1 rounded-full">{{ request.urgency }}</span>
                        <span class="bg-gray-100 px-2 py-1 rounded-full">{{ request.disaster_type || 'Belirtilmemiş' }}</span>
                      </div>
                    </div>
                    <span class="status-badge"
                          [ngClass]="{
                            'status-pending': request.status === RequestStatus.BEKLEMEDE,
                            'status-approved': request.status === RequestStatus.ONAYLANDI,
                            'status-completed': request.status === RequestStatus.TAMAMLANDI,
                            'status-rejected': request.status === RequestStatus.REDDEDILDI
                          }">
                      {{ getStatusLabel(request.status) }}
                    </span>
                  </div>
                </div>
              }
              
              @if (recentHelpRequests.length === 0) {
                <div class="text-center py-8 text-gray-500">
                  <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p class="text-gray-600">Henüz yardım talebi bulunmuyor.</p>
                </div>
              }
            </div>
          </div>

          <!-- Recent Assignments -->
          <div class="card p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-bold text-gray-900">Son Görevler</h3>
              <a routerLink="/assignments" class="text-primary-600 hover:text-primary-700 text-sm font-medium hover:underline">
                Tümünü Gör →
              </a>
            </div>
            
            @if (assignments.length === 0) {
              <div class="text-center py-8 text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p class="text-gray-600">Henüz görev bulunmuyor.</p>
              </div>
            }
            
            @if (assignments.length > 0) {
              <div class="space-y-4">
                @for (assignment of assignments.slice(0, 5); track assignment.id) {
                  <div class="border border-gray-200 rounded-lg p-4 hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-200">
                    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0">
                      <div class="flex-1">
                        <h4 class="font-semibold text-gray-900 mb-2">Görev #{{ assignment.id }}</h4>
                        <div class="space-y-1 text-sm text-gray-600">
                          <p>Yardım Talebi: {{ assignment.request_id }}</p>
                          <p>Gönüllü: {{ assignment.volunteer_id }}</p>
                        </div>
                        <div class="flex flex-wrap gap-2 mt-3 text-xs text-gray-500">
                          <span class="bg-gray-100 px-2 py-1 rounded-full">
                            Atanma: {{ assignment.assigned_at | date:'short' }}
                          </span>
                          @if (assignment.completed_at) {
                            <span class="bg-gray-100 px-2 py-1 rounded-full">
                              Tamamlanma: {{ assignment.completed_at | date:'short' }}
                            </span>
                          }
                        </div>
                      </div>
                      <span class="status-badge"
                            [ngClass]="{
                              'status-pending': assignment.status === AssignmentStatus.ATANMIS,
                              'status-approved': assignment.status === AssignmentStatus.YOLDA,
                              'status-completed': assignment.status === AssignmentStatus.TAMAMLANDI,
                              'status-rejected': assignment.status === AssignmentStatus.IPTAL_EDILDI
                            }">
                        {{ getAssignmentStatusLabel(assignment.status) }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </main>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  helpRequests: HelpRequest[] = [];
  assignments: Assignment[] = [];
  recentHelpRequests: HelpRequest[] = [];
  RequestStatus = RequestStatus;
  AssignmentStatus = AssignmentStatus;

  constructor(
    private authService: AuthService,
    private helpRequestsService: HelpRequestsService,
    private assignmentsService: AssignmentsService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    console.log('Dashboard - Loading help requests...');
    this.helpRequestsService.getHelpRequests().subscribe({
      next: (requests) => {
        console.log('Dashboard - Help requests loaded successfully:', requests);
        this.helpRequests = requests;
        this.recentHelpRequests = requests.slice(0, 5);
      },
      error: (error) => {
        console.error('Yardım talepleri yüklenirken hata oluştu:', error);
        this.notificationService.showError('Yardım talepleri yüklenirken hata oluştu.');
      }
    });

    // Load assignments for all users
    console.log('Dashboard - Loading assignments for all users...');
    this.loadAssignments();
  }

  private loadAssignments(): void {
    this.assignmentsService.getAssignments().subscribe({
      next: (assignments) => {
        console.log('Dashboard - Assignments loaded successfully:', assignments);
        this.assignments = assignments;
      },
      error: (error) => {
        console.error('Görevler yüklenirken hata oluştu:', error);
        if (error.status === 403) {
          console.log('Dashboard - 403 Forbidden: User does not have permission to view assignments');
          this.notificationService.showError('Görevleri görüntüleme yetkiniz bulunmuyor. Lütfen admin ile iletişime geçin.');
        } else if (error.status === 401) {
          console.log('Dashboard - 403 Forbidden: Authentication required');
          this.notificationService.showError('Görevleri görüntülemek için giriş yapmanız gerekiyor.');
        } else {
          this.notificationService.showError('Görevler yüklenirken hata oluştu: ' + error.message);
        }
      }
    });
  }

  get pendingRequests(): HelpRequest[] {
    return this.helpRequests.filter(r => r.status === RequestStatus.BEKLEMEDE);
  }

  get activeAssignments(): Assignment[] {
    return this.assignments.filter(a => a.status === AssignmentStatus.ATANMIS || a.status === AssignmentStatus.YOLDA);
  }

  isAdmin(): boolean {
    return this.currentUser?.role === UserRole.YONETICI;
  }

  getStatusLabel(status: RequestStatus): string {
    const labels: { [key in RequestStatus]: string } = {
      [RequestStatus.BEKLEMEDE]: 'Bekliyor',
      [RequestStatus.ONAYLANDI]: 'Onaylandı',
      [RequestStatus.ATANMIS]: 'Atandı',
      [RequestStatus.TAMAMLANDI]: 'Tamamlandı',
      [RequestStatus.REDDEDILDI]: 'Reddedildi'
    };
    return labels[status] || status;
  }

  getAssignmentStatusLabel(status: AssignmentStatus): string {
    const labels: { [key in AssignmentStatus]: string } = {
      [AssignmentStatus.ATANMIS]: 'Atandı',
      [AssignmentStatus.YOLDA]: 'Yolda',
      [AssignmentStatus.TAMAMLANDI]: 'Tamamlandı',
      [AssignmentStatus.IPTAL_EDILDI]: 'İptal Edildi'
    };
    return labels[status] || status;
  }


}
