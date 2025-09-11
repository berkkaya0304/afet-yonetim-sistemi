import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NavigationGuardService } from '../../core/services/navigation-guard.service';
import { SafezonesService } from '../../core/services/safezones.service';
import { HelpRequestsService } from '../../core/services/help-requests.service';
import { NotificationService } from '../../core/services/notification.service';
import { User, UserRole } from '../../core/models/user.model';
import { Safezone, ZoneType } from '../../core/models/safezone.model';
import { HelpRequest, RequestType, UrgencyLevel, DisasterType } from '../../core/models/help-request.model';
import { Announcement } from '../../core/models/announcement.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="container-responsive">
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div>
              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Vatandaş Paneli</h1>
              <p class="text-gray-600 mt-1">Hoş geldin, {{ currentUser?.fullName }}</p>
            </div>
            <div class="flex items-center space-x-4">
              <div class="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                {{ getRoleLabel(currentUser?.role) }}
              </div>

            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="container-responsive section-padding">
        <!-- User Info Cards -->
        <div class="grid-responsive-2 lg:grid-cols-3 gap-6 mb-8">
          <!-- Personal Info Card -->
          <div class="card-hover p-6">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 ml-3">Kişisel Bilgiler</h3>
            </div>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Ad Soyad:</span>
                <span class="font-medium">{{ currentUser?.fullName || 'Belirtilmemiş' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">E-posta:</span>
                <span class="font-medium">{{ currentUser?.email || 'Belirtilmemiş' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Telefon:</span>
                <span class="font-medium">{{ currentUser?.phone_number || currentUser?.phone || 'Belirtilmemiş' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Rol:</span>
                <span class="font-medium">{{ getRoleLabel(currentUser?.role) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Üyelik Tarihi:</span>
                <span class="font-medium">{{ getFormattedDate(currentUser?.created_at || currentUser?.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions Card -->
          <div class="card-hover p-6">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-success-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 ml-3">Hızlı İşlemler</h3>
            </div>
            <div class="space-y-3">
              <!-- I'm Safe Button -->
              <button 
                (click)="showImSafeModalFunc()"
                class="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Güvendeyim
              </button>
              
              <button 
                (click)="showHelpRequestModalFunc()"
                class="w-full bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Yardım Talebi Oluştur
              </button>
              
              <button 
                routerLink="/help-requests"
                class="w-full bg-success-500 hover:bg-success-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Yardım Taleplerini Görüntüle
              </button>
              
              <button 
                routerLink="/safezones"
                class="w-full bg-warning-500 hover:bg-warning-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                Güvenli Bölgeleri Görüntüle
              </button>
            </div>
          </div>

          <!-- Stats Card -->
          <div class="card-hover p-6">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-info-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 ml-3">İstatistikler</h3>
            </div>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Güvenli Bölge Sayısı:</span>
                <span class="font-medium text-lg text-primary-600">{{ safezones.length }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Toplanma Alanları:</span>
                <span class="font-medium">{{ getSafezoneCountByType('toplanma_alani') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Yardım Dağıtım:</span>
                <span class="font-medium">{{ getSafezoneCountByType('yardim_dagitim') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Safezones Map Section -->
        <div class="card-hover p-6 mb-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Güvenli Bölgeler Haritası</h2>
              <p class="text-gray-600 mt-1">Yakınınızdaki güvenli bölgeleri harita üzerinde görüntüleyin</p>
            </div>
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2">
                <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span class="text-sm text-gray-600">Toplanma Alanı</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-4 h-4 bg-green-500 rounded-full"></div>
                <span class="text-sm text-gray-600">Yardım Dağıtım</span>
              </div>
              <button 
                (click)="toggleHeatMap()"
                [class]="showHeatMap ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 hover:bg-gray-600'"
                class="text-white px-3 py-1 rounded-lg text-sm transition-colors duration-200">
                {{ showHeatMap ? 'Isı Haritasını Kapat' : 'Isı Haritasını Göster' }}
              </button>
            </div>
          </div>
          
          <!-- Map Container -->
          <div class="relative">
            <div #mapContainer class="w-full h-96 rounded-lg border border-gray-200"></div>
            
            <!-- Loading Overlay -->
            @if (isLoadingSafezones) {
              <div class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                <div class="text-center">
                  <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                  <p class="mt-2 text-gray-600">Güvenli bölgeler yükleniyor...</p>
                </div>
              </div>
            }
          </div>

          <!-- Safezones List -->
          @if (safezones.length > 0) {
            <div class="mt-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Yakındaki Güvenli Bölgeler</h3>
              <div class="grid-responsive-2 lg:grid-cols-3 gap-4">
                @for (safezone of safezones; track safezone.id) {
                  <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div class="flex items-center justify-between mb-2">
                      <h4 class="font-medium text-gray-900">{{ safezone.name }}</h4>
                      <span class="px-2 py-1 text-xs rounded-full" 
                            [class]="getSafezoneTypeClass(safezone.zone_type)">
                        {{ getSafezoneTypeLabel(safezone.zone_type) }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-600 mb-2">
                      {{ getSafezoneTypeDescription(safezone.zone_type) }}
                    </p>
                    @if (safezone.latitude && safezone.longitude) {
                      <div class="text-xs text-gray-500">
                        📍 {{ safezone.latitude.toFixed(4) }}, {{ safezone.longitude.toFixed(4) }}
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <!-- Announcements Section -->
        <div class="card-hover p-6 mb-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Resmî Duyurular & Bildirimler</h2>
              <p class="text-gray-600 mt-1">Güncel afet ve acil durum bilgileri</p>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span class="text-sm text-gray-600">Canlı</span>
            </div>
          </div>
          
          @if (isLoadingAnnouncements) {
            <div class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              <p class="mt-2 text-gray-600">Duyurular yükleniyor...</p>
            </div>
          } @else if (announcements.length > 0) {
            <div class="space-y-4">
              @for (announcement of announcements; track announcement.id) {
                <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h3 class="font-semibold text-blue-900 mb-2">{{ announcement.title }}</h3>
                      <p class="text-blue-800 text-sm mb-2">{{ announcement.content }}</p>
                      <div class="text-xs text-blue-600">
                        📅 {{ getFormattedDate(announcement.created_at) }}
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="text-center py-8 text-gray-500">
              <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
              </svg>
              <p>Henüz duyuru bulunmuyor</p>
            </div>
          }
        </div>

        <!-- Emergency Information -->
        <div class="card-hover p-6 bg-red-50 border border-red-200">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-red-900 ml-3">Acil Durum Bilgileri</h3>
          </div>
          <div class="text-red-800 space-y-2">
            <p><strong>112 Acil Çağrı Merkezi:</strong> Acil durumlarda ilk olarak 112'yi arayın</p>
            <p><strong>AFAD:</strong> Afet ve Acil Durum Yönetimi Başkanlığı ile iletişime geçin</p>
            <p><strong>Güvenli Bölgeler:</strong> En yakın toplanma alanına gidin</p>
            <p><strong>Yardım Talebi:</strong> Acil yardıma ihtiyacınız varsa yardım talebi oluşturun</p>
          </div>
        </div>
      </main>

      <!-- I'm Safe Modal -->
      @if (showImSafeModal) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-xl p-6 w-full max-w-md">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Güvenlik Mesajı Gönder</h3>
              <button 
                (click)="hideImSafeModal()"
                class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Mesajınız</label>
                <textarea 
                  [(ngModel)]="imSafeForm.message"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Durumunuzu belirtin..."></textarea>
              </div>
              
              <div class="text-sm text-gray-600">
                <p>📍 Konum: {{ imSafeForm.latitude.toFixed(4) }}, {{ imSafeForm.longitude.toFixed(4) }}</p>
              </div>
              
              <div class="flex space-x-3">
                <button 
                  (click)="hideImSafeModal()"
                  class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  İptal
                </button>
                <button 
                  (click)="sendImSafeMessage()"
                  class="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">
                  Gönder
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Help Request Modal -->
      @if (showHelpRequestModal) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-xl p-6 w-full max-w-lg">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Yardım Talebi Oluştur</h3>
              <button 
                (click)="hideHelpRequestModal()"
                class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">İhtiyaç Türü</label>
                  <select 
                    [(ngModel)]="helpRequestForm.requestType"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option [value]="RequestType.GIDA">Gıda</option>
                    <option [value]="RequestType.SU">Su</option>
                    <option [value]="RequestType.TIBSI">Tıbbi</option>
                    <option [value]="RequestType.ENKAZ">Enkaz</option>
                    <option [value]="RequestType.BARINMA">Barınma</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Aciliyet</label>
                  <select 
                    [(ngModel)]="helpRequestForm.urgency"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option [value]="UrgencyLevel.DUSUK">Düşük</option>
                    <option [value]="UrgencyLevel.ORTA">Orta</option>
                    <option [value]="UrgencyLevel.YUKSEK">Yüksek</option>
                  </select>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Afet Türü</label>
                  <select 
                    [(ngModel)]="helpRequestForm.disasterType"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option [value]="DisasterType.DEPREM">Deprem</option>
                    <option [value]="DisasterType.SEL">Sel</option>
                    <option [value]="DisasterType.CIG">Çığ</option>
                    <option [value]="DisasterType.FIRTINA">Fırtına</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Kişi Sayısı</label>
                  <input 
                    type="number"
                    [(ngModel)]="helpRequestForm.personCount"
                    min="1"
                    max="100"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Detaylar</label>
                <textarea 
                  [(ngModel)]="helpRequestForm.details"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Yardım talebinizin detaylarını belirtin..."></textarea>
              </div>
              
              <div class="text-sm text-gray-600">
                <p>📍 Konum: {{ helpRequestForm.latitude.toFixed(4) }}, {{ helpRequestForm.longitude.toFixed(4) }}</p>
              </div>
              
              <div class="flex space-x-3">
                <button 
                  (click)="hideHelpRequestModal()"
                  class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  İptal
                </button>
                <button 
                  (click)="createHelpRequest()"
                  class="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg">
                  Oluştur
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .container-responsive {
      @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
    }
    
    .section-padding {
      @apply py-8;
    }
    
    .grid-responsive-2 {
      @apply grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6;
    }
    
    .grid-responsive-3 {
      @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6;
    }
    
    .card-hover {
      @apply bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200;
    }
    
    .bg-primary-500 { background-color: rgb(59 130 246); }
    .bg-primary-600 { background-color: rgb(37 99 235); }
    .bg-primary-100 { background-color: rgb(219 234 254); }
    .bg-primary-800 { background-color: rgb(30 64 175); }
    .text-primary-100 { color: rgb(219 234 254); }
    .text-primary-600 { color: rgb(37 99 235); }
    
    .bg-success-500 { background-color: rgb(34 197 94); }
    .bg-success-600 { background-color: rgb(22 163 74); }
    
    .bg-warning-500 { background-color: rgb(234 179 8); }
    .bg-warning-600 { background-color: rgb(202 138 4); }
    
    .bg-info-500 { background-color: rgb(6 182 212); }
    
    .bg-red-200 { background-color: rgb(254 202 202); }
    .bg-red-500 { background-color: rgb(239 68 68); }
    .text-red-800 { color: rgb(153 27 27); }
    .text-red-900 { color: rgb(127 29 29); }
    
    .border-red-200 { border-color: rgb(254 202 202); }
    
    .bg-green-500 { background-color: rgb(34 197 94); }
    .bg-green-600 { background-color: rgb(22 163 74); }
    
    .bg-blue-50 { background-color: rgb(239 246 255); }
    .bg-blue-200 { background-color: rgb(191 219 254); }
    .text-blue-600 { color: rgb(37 99 235); }
    .text-blue-800 { color: rgb(30 64 175); }
    .text-blue-900 { color: rgb(30 58 138); }
    
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .5; }
    }
  `]
})
export class UserComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  
  // Make enums available to template
  RequestType = RequestType;
  UrgencyLevel = UrgencyLevel;
  DisasterType = DisasterType;
  
  currentUser: User | null = null;
  safezones: Safezone[] = [];
  helpRequests: HelpRequest[] = [];
  announcements: Announcement[] = [];
  isLoadingSafezones = false;
  isLoadingHelpRequests = false;
  isLoadingAnnouncements = false;
  showImSafeModal = false;
  showHelpRequestModal = false;
  showHeatMap = false;
  
  // Help request form data
  helpRequestForm = {
    requestType: RequestType.GIDA,
    details: '',
    urgency: UrgencyLevel.ORTA,
    disasterType: DisasterType.DEPREM,
    personCount: 1,
    latitude: 0,
    longitude: 0
  };
  
  // I'm Safe form data
  imSafeForm = {
    message: 'Güvendeyim, yardıma ihtiyacım yok.',
    latitude: 0,
    longitude: 0
  };
  
  private map: L.Map | null = null;
  private safezoneMarkers: (L.Marker | L.CircleMarker)[] = [];
  private helpRequestMarkers: L.Marker[] = [];
  private heatMapLayer: L.LayerGroup | null = null;
  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private navigationGuardService: NavigationGuardService,
    private safezonesService: SafezonesService,
    private helpRequestsService: HelpRequestsService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadSafezones();
    this.loadHelpRequests();
    this.loadAnnouncements();
    this.getCurrentLocation();
    this.startDataRefresh();
    
    // Ensure navigation guard is active for this component
    this.navigationGuardService.preventBackNavigation();
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.map) {
      this.map.remove();
    }
  }

  private loadCurrentUser(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  private loadSafezones(): void {
    this.isLoadingSafezones = true;
    this.cdr.detectChanges();

    this.subscriptions.add(
      this.safezonesService.getSafezones().subscribe({
        next: (safezones) => {
          this.safezones = safezones;
          this.isLoadingSafezones = false;
          this.cdr.detectChanges();
          this.addSafezoneMarkers();
        },
        error: (error) => {
          console.error('Error loading safezones:', error);
          this.isLoadingSafezones = false;
          this.cdr.detectChanges();
        }
      })
    );
  }

  private initializeMap(): void {
    if (!this.mapContainer) return;

    // Initialize Leaflet map
    this.map = L.map(this.mapContainer.nativeElement).setView([39.9334, 32.8597], 6); // Turkey center

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Add safezone markers after map is initialized
    setTimeout(() => {
      this.addSafezoneMarkers();
    }, 100);
  }

  private addSafezoneMarkers(): void {
    if (!this.map || this.safezones.length === 0) return;

    // Clear existing markers
    this.safezoneMarkers.forEach(marker => marker.remove());
    this.safezoneMarkers = [];

    this.safezones.forEach(safezone => {
      if (safezone.latitude && safezone.longitude) {
        const markerColor = safezone.zone_type === ZoneType.TOPLANMA_ALANI ? '#3B82F6' : '#10B981';
        
        const marker = L.circleMarker([safezone.latitude, safezone.longitude], {
          radius: 8,
          fillColor: markerColor,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(this.map!);

        const popupContent = `
          <div class="p-2">
            <h4 class="font-semibold text-sm">${safezone.name}</h4>
            <p class="text-xs text-gray-600">${this.getSafezoneTypeLabel(safezone.zone_type)}</p>
            <p class="text-xs text-gray-500">${this.getSafezoneTypeDescription(safezone.zone_type)}</p>
          </div>
        `;
        
        marker.bindPopup(popupContent);
        this.safezoneMarkers.push(marker);
      }
    });

    // Fit map to show all markers
    if (this.safezoneMarkers.length > 0) {
      const group = new L.FeatureGroup(this.safezoneMarkers);
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  getRoleLabel(role?: UserRole): string {
    switch (role) {
      case UserRole.VATANDAS:
        return 'Vatandaş';
      case UserRole.GONULLU:
        return 'Gönüllü';
      case UserRole.YONETICI:
        return 'Yönetici';
      default:
        return 'Bilinmeyen';
    }
  }

  getSafezoneTypeLabel(zoneType: ZoneType): string {
    switch (zoneType) {
      case ZoneType.TOPLANMA_ALANI:
        return 'Toplanma Alanı';
      case ZoneType.YARDIM_DAGITIM:
        return 'Yardım Dağıtım';
      default:
        return 'Bilinmeyen';
    }
  }

  getSafezoneTypeDescription(zoneType: ZoneType): string {
    switch (zoneType) {
      case ZoneType.TOPLANMA_ALANI:
        return 'Acil durumlarda toplanma noktası';
      case ZoneType.YARDIM_DAGITIM:
        return 'Yardım malzemeleri dağıtım merkezi';
      default:
        return 'Güvenli bölge';
    }
  }

  getSafezoneTypeClass(zoneType: ZoneType): string {
    switch (zoneType) {
      case ZoneType.TOPLANMA_ALANI:
        return 'bg-blue-100 text-blue-800';
      case ZoneType.YARDIM_DAGITIM:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getSafezoneCountByType(zoneType: string): number {
    return this.safezones.filter(s => s.zone_type === zoneType).length;
  }

  getFormattedDate(date?: Date | string): string {
    if (!date) return 'Belirtilmemiş';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Belirtilmemiş';
    }
  }

  private loadHelpRequests(): void {
    this.isLoadingHelpRequests = true;
    this.cdr.detectChanges();

    this.subscriptions.add(
      this.helpRequestsService.getNearbyHelpRequests(39.9334, 32.8597, 50).subscribe({
        next: (requests) => {
          this.helpRequests = requests;
          this.isLoadingHelpRequests = false;
          this.cdr.detectChanges();
          this.addHelpRequestMarkers();
        },
        error: (error) => {
          console.error('Error loading help requests:', error);
          this.isLoadingHelpRequests = false;
          this.cdr.detectChanges();
        }
      })
    );
  }

  private loadAnnouncements(): void {
    this.isLoadingAnnouncements = true;
    this.cdr.detectChanges();

    // For now, we'll create sample announcements since the service might not be fully implemented
    this.announcements = [
      {
        id: 1,
        admin_id: 1,
        title: 'Acil Durum Duyurusu',
        content: 'Bölgenizde meydana gelen afet sonrası güvenlik önlemleri alınmıştır. Lütfen resmi açıklamaları takip edin.',
        created_at: new Date()
      },
      {
        id: 2,
        admin_id: 1,
        title: 'Yardım Merkezi Açıldı',
        content: 'Merkez mahallesinde yeni yardım dağıtım merkezi açılmıştır. Acil ihtiyacı olan vatandaşlar başvurabilir.',
        created_at: new Date(Date.now() - 3600000) // 1 hour ago
      }
    ];
    this.isLoadingAnnouncements = false;
    this.cdr.detectChanges();
  }

  private getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.helpRequestForm.latitude = position.coords.latitude;
          this.helpRequestForm.longitude = position.coords.longitude;
          this.imSafeForm.latitude = position.coords.latitude;
          this.imSafeForm.longitude = position.coords.longitude;
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Turkey center
          this.helpRequestForm.latitude = 39.9334;
          this.helpRequestForm.longitude = 32.8597;
          this.imSafeForm.latitude = 39.9334;
          this.imSafeForm.longitude = 32.8597;
        }
      );
    }
  }

  // I'm Safe functionality
  showImSafeModalFunc(): void {
    this.showImSafeModal = true;
    this.cdr.detectChanges();
  }

  hideImSafeModal(): void {
    this.showImSafeModal = false;
    this.cdr.detectChanges();
  }

  sendImSafeMessage(): void {
    // This would typically send a message to the system
    this.notificationService.showSuccess('Güvenlik mesajınız gönderildi!');
    this.hideImSafeModal();
  }

  // Help Request functionality
  showHelpRequestModalFunc(): void {
    this.showHelpRequestModal = true;
    this.cdr.detectChanges();
  }

  hideHelpRequestModal(): void {
    this.showHelpRequestModal = false;
    this.cdr.detectChanges();
  }

  createHelpRequest(): void {
    const request = {
      request_type: this.helpRequestForm.requestType,
      details: this.helpRequestForm.details,
      urgency: this.helpRequestForm.urgency,
      disaster_type: this.helpRequestForm.disasterType,
      latitude: this.helpRequestForm.latitude,
      longitude: this.helpRequestForm.longitude
    };

    this.subscriptions.add(
      this.helpRequestsService.createHelpRequest(request).subscribe({
        next: (response) => {
          this.notificationService.showSuccess('Yardım talebiniz başarıyla oluşturuldu!');
          this.hideHelpRequestModal();
          this.loadHelpRequests(); // Reload to show new request
        },
        error: (error) => {
          console.error('Error creating help request:', error);
          this.notificationService.showError('Yardım talebi oluşturulurken hata oluştu!');
        }
      })
    );
  }

  // Heat map functionality
  toggleHeatMap(): void {
    this.showHeatMap = !this.showHeatMap;
    if (this.showHeatMap) {
      this.addHeatMap();
    } else {
      this.removeHeatMap();
    }
    this.cdr.detectChanges();
  }

  private addHeatMap(): void {
    if (!this.map || this.helpRequests.length === 0) return;

    this.removeHeatMap();
    this.heatMapLayer = L.layerGroup();

    // Create heat map data from help requests
    const heatData = this.helpRequests.map(request => {
      // For now, we'll use default coordinates since location_id needs to be resolved
      // In a real implementation, you'd fetch the location details
      const lat = 39.9334; // Default Turkey center
      const lng = 32.8597;
      return [lat, lng, this.getUrgencyWeight(request.urgency)];
    }).filter(point => point !== null);

    if (heatData.length > 0) {
      // Simple heat map using circle markers with different sizes based on urgency
      heatData.forEach((point: any) => {
        const [lat, lng, weight] = point;
        const radius = Math.max(8, weight * 5); // Base radius on urgency
        const opacity = Math.min(0.8, weight * 0.3);
        
        const heatMarker = L.circleMarker([lat, lng], {
          radius: radius,
          fillColor: '#ff4444',
          color: '#cc0000',
          weight: 1,
          opacity: opacity,
          fillOpacity: opacity
        }).addTo(this.heatMapLayer!);

        heatMarker.bindPopup(`
          <div class="p-2">
            <h4 class="font-semibold text-sm">Yardım Talebi</h4>
            <p class="text-xs text-gray-600">Yardım talebi</p>
            <p class="text-xs text-gray-500">Aciliyet: ${this.getUrgencyLabel(UrgencyLevel.ORTA)}</p>
          </div>
        `);
      });

      this.heatMapLayer!.addTo(this.map);
    }
  }

  private removeHeatMap(): void {
    if (this.heatMapLayer && this.map) {
      this.map.removeLayer(this.heatMapLayer);
      this.heatMapLayer = null;
    }
  }

  private addHelpRequestMarkers(): void {
    if (!this.map || this.helpRequests.length === 0) return;

    // Clear existing markers
    this.helpRequestMarkers.forEach(marker => marker.remove());
    this.helpRequestMarkers = [];

    this.helpRequests.forEach(request => {
      // For now, we'll use default coordinates since location_id needs to be resolved
      // In a real implementation, you'd fetch the location details
      const lat = 39.9334; // Default Turkey center
      const lng = 32.8597;
      const markerColor = this.getUrgencyColor(request.urgency);
      
      const marker = L.circleMarker([lat, lng], {
        radius: 6,
        fillColor: markerColor,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(this.map!);

      const popupContent = `
        <div class="p-2">
          <h4 class="font-semibold text-sm">Yardım Talebi</h4>
          <p class="text-xs text-gray-600">${this.getRequestTypeLabel(request.request_type)}</p>
          <p class="text-xs text-gray-500">Aciliyet: ${this.getUrgencyLabel(request.urgency)}</p>
          <p class="text-xs text-gray-500">${request.details || 'Detay belirtilmemiş'}</p>
        </div>
      `;
      
      marker.bindPopup(popupContent);
      this.helpRequestMarkers.push(marker as any); // Type assertion to fix type mismatch
    });
  }

  // Utility methods for labels and colors
  getRequestTypeLabel(type: RequestType): string {
    switch (type) {
      case RequestType.GIDA: return 'Gıda';
      case RequestType.SU: return 'Su';
      case RequestType.TIBSI: return 'Tıbbi';
      case RequestType.ENKAZ: return 'Enkaz';
      case RequestType.BARINMA: return 'Barınma';
      default: return 'Bilinmeyen';
    }
  }

  getUrgencyLabel(urgency: UrgencyLevel): string {
    switch (urgency) {
      case UrgencyLevel.DUSUK: return 'Düşük';
      case UrgencyLevel.ORTA: return 'Orta';
      case UrgencyLevel.YUKSEK: return 'Yüksek';
      default: return 'Bilinmeyen';
    }
  }

  getUrgencyWeight(urgency: UrgencyLevel): number {
    switch (urgency) {
      case UrgencyLevel.DUSUK: return 1;
      case UrgencyLevel.ORTA: return 2;
      case UrgencyLevel.YUKSEK: return 3;
      default: return 1;
    }
  }

  getUrgencyColor(urgency: UrgencyLevel): string {
    switch (urgency) {
      case UrgencyLevel.DUSUK: return '#10B981';
      case UrgencyLevel.ORTA: return '#F59E0B';
      case UrgencyLevel.YUKSEK: return '#EF4444';
      default: return '#6B7280';
    }
  }

  getDisasterTypeLabel(type: DisasterType): string {
    switch (type) {
      case DisasterType.DEPREM: return 'Deprem';
      case DisasterType.SEL: return 'Sel';
      case DisasterType.CIG: return 'Çığ';
      case DisasterType.FIRTINA: return 'Fırtına';
      default: return 'Bilinmeyen';
    }
  }

  // Update map to show help request markers when they're loaded
  private updateMapWithHelpRequests(): void {
    if (this.map && this.helpRequests.length > 0) {
      this.addHelpRequestMarkers();
    }
  }

  // Refresh data periodically
  private startDataRefresh(): void {
    // Refresh help requests every 30 seconds
    setInterval(() => {
      if (this.currentUser) {
        this.loadHelpRequests();
      }
    }, 30000);

    // Refresh announcements every 60 seconds
    setInterval(() => {
      if (this.currentUser) {
        this.loadAnnouncements();
      }
    }, 60000);
  }

  // Logout functionality
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
