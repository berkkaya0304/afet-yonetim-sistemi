import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HelpRequestsService } from '../../../core/services/help-requests.service';
import { HelpRequest, RequestStatus, RequestType, UrgencyLevel, DisasterType } from '../../../core/models/help-request.model';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-help-request-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <!-- Header -->
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div class="flex items-center space-x-4">
              <button 
                (click)="goBack()"
                class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
              >
                ← Geri Dön
              </button>
              <h1 class="text-3xl font-bold text-gray-900">Yardım Talebi Detayı</h1>
            </div>
            <div class="flex space-x-2">
              @if (helpRequest?.status === RequestStatus.BEKLEMEDE) {
                <button 
                  (click)="updateStatus(RequestStatus.ONAYLANDI)"
                  class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                >
                  Onayla
                </button>
                <button 
                  (click)="updateStatus(RequestStatus.REDDEDILDI)"
                  class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                >
                  Reddet
                </button>
              }
            </div>
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        @if (helpRequest) {
          <div class="bg-white shadow rounded-lg overflow-hidden">
          <!-- Header Section -->
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex justify-between items-start">
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Yardım Talebi #{{ helpRequest.id }}</h2>
                <p class="text-gray-600 mt-1">{{ helpRequest.details }}</p>
              </div>
              <div class="text-right">
                <span class="px-3 py-1 text-sm font-medium rounded-full"
                      [ngClass]="{
                        'bg-yellow-100 text-yellow-800': helpRequest.status === RequestStatus.BEKLEMEDE,
                        'bg-blue-100 text-blue-800': helpRequest.status === RequestStatus.ONAYLANDI,
                        'bg-purple-100 text-purple-800': helpRequest.status === RequestStatus.ATANMIS,
                        'bg-green-100 text-green-800': helpRequest.status === RequestStatus.TAMAMLANDI,
                        'bg-red-100 text-red-800': helpRequest.status === RequestStatus.REDDEDILDI
                      }">
                  {{ getStatusLabel(helpRequest.status) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Details Grid -->
          <div class="px-6 py-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Request Details -->
              <div class="space-y-4">
                <h3 class="text-lg font-medium text-gray-900">Talep Detayları</h3>
                
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="font-medium text-gray-700">Tür:</span>
                    <span class="ml-2 text-gray-600">{{ getRequestTypeLabel(helpRequest.request_type) }}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700">Aciliyet:</span>
                    <span class="ml-2 px-2 py-1 text-xs rounded-full"
                          [ngClass]="{
                            'bg-green-100 text-green-800': helpRequest.urgency === UrgencyLevel.DUSUK,
                            'bg-yellow-100 text-yellow-800': helpRequest.urgency === UrgencyLevel.ORTA,
                            'bg-red-100 text-red-800': helpRequest.urgency === UrgencyLevel.YUKSEK
                          }">
                      {{ getUrgencyLabel(helpRequest.urgency) }}
                    </span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700">Afet Türü:</span>
                    <span class="ml-2 text-gray-600">{{ getDisasterTypeLabel(helpRequest.disaster_type) }}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700">Talep Eden ID:</span>
                    <span class="ml-2 text-gray-600">{{ helpRequest.requester_id || 'Belirtilmemiş' }}</span>
                  </div>
                </div>
              </div>

              <!-- Location Details -->
              <div class="space-y-4">
                <h3 class="text-lg font-medium text-gray-900">Konum Bilgileri</h3>
                
                <div class="space-y-2 text-sm">
                  <div>
                    <span class="font-medium text-gray-700">Konum ID:</span>
                    <span class="ml-2 text-gray-600">{{ helpRequest.location_id || 'Belirtilmemiş' }}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700">Detaylar:</span>
                    <span class="ml-2 text-gray-600">{{ helpRequest.details || 'Belirtilmemiş' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Timeline -->
            <div class="mt-8">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Zaman Çizelgesi</h3>
              <div class="space-y-4">
                <div class="flex items-center space-x-3">
                  <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div class="text-sm text-gray-600">
                    <span class="font-medium">Oluşturuldu:</span>
                    {{ helpRequest.created_at | date:'dd/MM/yyyy HH:mm' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Requester Info -->
            <div class="mt-8 pt-6 border-t border-gray-200">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Talep Eden Bilgileri</h3>
              <div class="text-sm text-gray-600">
                <p><span class="font-medium">Talep Eden ID:</span> {{ helpRequest.requester_id || 'Belirtilmemiş' }}</p>
                <p><span class="font-medium">Yardım Talebi ID:</span> {{ helpRequest.id }}</p>
              </div>
            </div>
          </div>
        </div>
        }

        @if (!helpRequest && !isLoading) {
          <div class="text-center py-12">
            <p class="text-gray-500 text-lg">Yardım talebi bulunamadı.</p>
          </div>
        }

        @if (isLoading) {
          <div class="text-center py-12">
            <p class="text-gray-500 text-lg">Yükleniyor...</p>
          </div>
        }
      </main>
    </div>
  `
})
export class HelpRequestDetailComponent implements OnInit {
  helpRequest: HelpRequest | null = null;
  isLoading = false;
  currentUser: User | null = null;
  RequestStatus = RequestStatus;
  RequestType = RequestType;
  UrgencyLevel = UrgencyLevel;
  DisasterType = DisasterType;

  constructor(
    private helpRequestsService: HelpRequestsService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadHelpRequest();
  }

  loadHelpRequest(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isLoading = true;
      this.helpRequestsService.getHelpRequestById(parseInt(id)).subscribe({
        next: (request) => {
          this.helpRequest = request;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Yardım talebi yüklenemedi:', error);
          this.isLoading = false;
        }
      });
    }
  }

  updateStatus(status: RequestStatus): void {
    if (this.helpRequest) {
      this.helpRequestsService.updateHelpRequestStatus(this.helpRequest.id, status).subscribe({
        next: (updatedRequest) => {
          this.helpRequest = updatedRequest;
          console.log('Durum güncellendi:', status);
        },
        error: (error) => {
          console.error('Durum güncellenemedi:', error);
        }
      });
    }
  }

  isAdmin(): boolean {
    return this.currentUser?.role === UserRole.YONETICI;
  }

  getRequestTypeLabel(type: RequestType | string): string {
    const typeStr = type.toString().toLowerCase();
    const labels: { [key: string]: string } = {
      'gida': 'Gıda',
      'su': 'Su',
      'tibsi': 'Tıbbi',
      'enkaz': 'Enkaz',
      'barinma': 'Barınma'
    };
    return labels[typeStr] || type.toString();
  }

  getUrgencyLabel(urgency: UrgencyLevel | string): string {
    const urgencyStr = urgency.toString().toLowerCase();
    const labels: { [key: string]: string } = {
      'dusuk': 'Düşük',
      'orta': 'Orta',
      'yuksek': 'Yüksek'
    };
    return labels[urgencyStr] || urgency.toString();
  }

  getDisasterTypeLabel(disasterType?: DisasterType | string): string {
    if (!disasterType) return 'Belirtilmemiş';
    
    const disasterStr = disasterType.toString().toLowerCase();
    const labels: { [key: string]: string } = {
      'deprem': 'Deprem',
      'sel': 'Sel',
      'cig': 'Çığ',
      'firtina': 'Fırtına'
    };
    return labels[disasterStr] || disasterType.toString();
  }

  getStatusLabel(status: RequestStatus | string): string {
    const statusStr = status.toString().toLowerCase();
    const labels: { [key: string]: string } = {
      'beklemede': 'Bekliyor',
      'onaylandi': 'Onaylandı',
      'atanmis': 'Atandı',
      'tamamlandi': 'Tamamlandı',
      'reddedildi': 'Reddedildi'
    };
    return labels[statusStr] || status.toString();
  }

  goBack(): void {
    this.router.navigate(['/help-requests']);
  }
}
