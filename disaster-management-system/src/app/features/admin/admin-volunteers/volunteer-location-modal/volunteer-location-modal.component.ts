import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-volunteer-location-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" (click)="closeModal()">
      <div class="relative top-20 mx-auto p-5 border w-91-666667 md-w-3-4 lg-w-1-2 shadow-lg rounded-md bg-white" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Gönüllü Konum Bilgileri</h3>
          <button 
            (click)="closeModal()" 
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Volunteer Info -->
        <div class="bg-blue-50 rounded-lg p-4 mb-6">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h4 class="font-medium text-gray-900">{{ volunteer?.fullName }}</h4>
              <p class="text-sm text-blue-600">{{ volunteer?.email }}</p>
            </div>
          </div>
        </div>

        <!-- Current Location Status -->
        <div class="mb-6">
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-yellow-800">Mevcut Konum</h3>
                <div class="mt-2 text-sm text-yellow-700">
                  <p><strong>{{ volunteer?.location || 'Belirtilmemiş' }}</strong></p>
                  @if (!volunteer?.location) {
                    <p class="mt-1">Konum bilgisi yoksa varsayılan olarak <strong>Ankara, Türkiye merkezi</strong> kullanılır.</p>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Location Form -->
        <form [formGroup]="locationForm" (ngSubmit)="saveLocation()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Enlem *</label>
              <input 
                type="number" 
                formControlName="latitude"
                step="0.000001"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="39.9334 (Ankara merkez)"
              />
              @if (locationForm.get('latitude')?.invalid && locationForm.get('latitude')?.touched) {
                <div class="text-red-600 text-sm mt-1">
                  @if (locationForm.get('latitude')?.errors?.['required']) {
                    Enlem gereklidir
                  } @else if (locationForm.get('latitude')?.errors?.['min'] || locationForm.get('latitude')?.errors?.['max']) {
                    Enlem -90 ile 90 arasında olmalıdır
                  }
                </div>
              }
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Boylam *</label>
              <input 
                type="number" 
                formControlName="longitude"
                step="0.000001"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="32.8597 (Ankara merkez)"
              />
              @if (locationForm.get('longitude')?.invalid && locationForm.get('longitude')?.touched) {
                <div class="text-red-600 text-sm mt-1">
                  @if (locationForm.get('longitude')?.errors?.['required']) {
                    Boylam gereklidir
                  } @else if (locationForm.get('longitude')?.errors?.['min'] || locationForm.get('longitude')?.errors?.['max']) {
                    Boylam -180 ile 180 arasında olmalıdır
                  }
                </div>
              }
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Konum Açıklaması</label>
            <input 
              type="text" 
              formControlName="locationDescription"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örn: Ankara, Kızılay Meydanı"
            />
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3">
            <button 
              type="button" 
              (click)="setDefaultLocation()" 
              class="flex-1 px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors flex items-center justify-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Ankara Merkez Olarak Ayarla
            </button>
            <button 
              type="button" 
              (click)="getCurrentLocation()" 
              class="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center justify-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Mevcut Konumu Al
            </button>
          </div>

          <!-- Map Preview Placeholder -->
          <div class="bg-gray-100 rounded-lg p-4 text-center">
            <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <p class="mt-2 text-sm text-gray-600">Harita önizlemesi burada görünecek</p>
            <p class="text-xs text-gray-500">Koordinatlar: {{ locationForm.get('latitude')?.value || '?' }}, {{ locationForm.get('longitude')?.value || '?' }}</p>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button 
              type="button" 
              (click)="closeModal()" 
              class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              İptal
            </button>
            <button 
              type="submit" 
              [disabled]="locationForm.invalid || isSaving" 
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {{ isSaving ? 'Kaydediliyor...' : 'Konumu Kaydet' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .fixed {
      position: fixed;
    }
    
    .inset-0 {
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
    }
    
    .bg-gray-600 {
      background-color: rgb(75 85 99);
    }
    
    .bg-opacity-50 {
      background-color: rgb(75 85 99 / 0.5);
    }
    
    .overflow-y-auto {
      overflow-y: auto;
    }
    
    .h-full {
      height: 100%;
    }
    
    .w-full {
      width: 100%;
    }
    
    .z-50 {
      z-index: 50;
    }
    
    .relative {
      position: relative;
    }
    
    .top-20 {
      top: 5rem;
    }
    
    .mx-auto {
      margin-left: auto;
      margin-right: auto;
    }
    
    .p-5 {
      padding: 1.25rem;
    }
    
    .border {
      border-width: 1px;
    }
    
         .w-91-666667 {
       width: 91.666667%;
     }
     
     .md-w-3-4 {
       width: 75%;
     }
     
     .lg-w-1-2 {
       width: 50%;
     }
    
    .shadow-lg {
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    }
    
    .rounded-md {
      border-radius: 0.375rem;
    }
    
    .bg-white {
      background-color: rgb(255 255 255);
    }
    
    .flex {
      display: flex;
    }
    
    .items-center {
      align-items: center;
    }
    
    .justify-between {
      justify-content: space-between;
    }
    
    .mb-6 {
      margin-bottom: 1.5rem;
    }
    
    .text-lg {
      font-size: 1.125rem;
      line-height: 1.75rem;
    }
    
    .font-semibold {
      font-weight: 600;
    }
    
    .text-gray-900 {
      color: rgb(17 24 39);
    }
    
    .text-gray-400 {
      color: rgb(156 163 175);
    }
    
    .hover\:text-gray-600:hover {
      color: rgb(75 85 99);
    }
    
    .transition-colors {
      transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }
    
    .w-6 {
      width: 1.5rem;
    }
    
    .h-6 {
      height: 1.5rem;
    }
    
    .bg-blue-50 {
      background-color: rgb(239 246 255);
    }
    
    .rounded-lg {
      border-radius: 0.5rem;
    }
    
    .p-4 {
      padding: 1rem;
    }
    
    .space-x-4 > :not([hidden]) ~ :not([hidden]) {
      margin-left: 1rem;
    }
    
    .w-12 {
      width: 3rem;
    }
    
    .h-12 {
      height: 3rem;
    }
    
    .bg-blue-100 {
      background-color: rgb(219 234 254);
    }
    
    .rounded-full {
      border-radius: 9999px;
    }
    
    .font-medium {
      font-weight: 500;
    }
    
    .text-blue-600 {
      color: rgb(37 99 235);
    }
    
    .text-sm {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }
    
    .bg-yellow-50 {
      background-color: rgb(254 252 232);
    }
    
    .border-yellow-200 {
      border-color: rgb(254 243 199);
    }
    
    .flex-shrink-0 {
      flex-shrink: 0;
    }
    
    .h-5 {
      height: 1.25rem;
    }
    
    .w-5 {
      width: 1.25rem;
    }
    
    .text-yellow-400 {
      color: rgb(250 204 21);
    }
    
    .ml-3 {
      margin-left: 0.75rem;
    }
    
    .text-yellow-800 {
      color: rgb(133 77 14);
    }
    
    .text-yellow-700 {
      color: rgb(161 98 7);
    }
    
    .strong {
      font-weight: 700;
    }
    
    .space-y-6 > :not([hidden]) ~ :not([hidden]) {
      margin-top: 1.5rem;
    }
    
    .grid {
      display: grid;
    }
    
    .grid-cols-1 {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
    
    .md\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    
    .gap-6 {
      gap: 1.5rem;
    }
    
    .block {
      display: block;
    }
    
    .mb-2 {
      margin-bottom: 0.5rem;
    }
    
    .w-full {
      width: 100%;
    }
    
    .px-3 {
      padding-left: 0.75rem;
      padding-right: 0.75rem;
    }
    
    .py-2 {
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }
    
    .border-gray-300 {
      border-color: rgb(209 213 219);
    }
    
    .rounded-md {
      border-radius: 0.375rem;
    }
    
    .focus\:outline-none:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
    }
    
    .focus\:ring-2:focus {
      box-shadow: 0 0 0 2px rgb(59 130 246);
    }
    
    .focus\:ring-blue-500:focus {
      box-shadow: 0 0 0 2px rgb(59 130 246);
    }
    
    .placeholder-ankara-lat {
       color: rgb(156 163 175);
     }
    
    .text-red-600 {
      color: rgb(220 38 38);
    }
    
    .mt-1 {
      margin-top: 0.25rem;
    }
    
    .placeholder-ankara-lng {
       color: rgb(156 163 175);
     }
    
    .flex-col {
      flex-direction: column;
    }
    
    .sm\:flex-row {
      flex-direction: row;
    }
    
    .gap-3 {
      gap: 0.75rem;
    }
    
    .flex-1 {
      flex: 1 1 0%;
    }
    
    .px-4 {
      padding-left: 1rem;
      padding-right: 1rem;
    }
    
    .py-2 {
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }
    
    .text-white {
      color: rgb(255 255 255);
    }
    
    .bg-green-600 {
      background-color: rgb(22 163 74);
    }
    
    .hover\:bg-green-700:hover {
      background-color: rgb(21 128 61);
    }
    
    .bg-blue-600 {
      background-color: rgb(37 99 235);
    }
    
    .hover\:bg-blue-700:hover {
      background-color: rgb(29 78 216);
    }
    
    .mr-2 {
      margin-right: 0.5rem;
    }
    
    .w-4 {
      width: 1rem;
    }
    
    .h-4 {
      height: 1rem;
    }
    
    .bg-gray-100 {
      background-color: rgb(243 244 246);
    }
    
    .text-center {
      text-align: center;
    }
    
    .mx-auto {
      margin-left: auto;
      margin-right: auto;
    }
    
    .h-16 {
      height: 4rem;
    }
    
    .w-16 {
      width: 4rem;
    }
    
    .text-gray-400 {
      color: rgb(156 163 175);
    }
    
    .mt-2 {
      margin-top: 0.5rem;
    }
    
    .text-gray-600 {
      color: rgb(75 85 99);
    }
    
    .text-xs {
      font-size: 0.75rem;
      line-height: 1rem;
    }
    
    .text-gray-500 {
      color: rgb(107 114 128);
    }
    
    .justify-end {
      justify-content: flex-end;
    }
    
    .space-x-3 > :not([hidden]) ~ :not([hidden]) {
      margin-left: 0.75rem;
    }
    
    .pt-4 {
      padding-top: 1rem;
    }
    
    .border-t {
      border-top-width: 1px;
    }
    
    .border-gray-200 {
      border-color: rgb(229 231 235);
    }
    
    .text-gray-700 {
      color: rgb(55 65 81);
    }
    
    .bg-gray-100 {
      background-color: rgb(243 244 246);
    }
    
    .hover\:bg-gray-200:hover {
      background-color: rgb(229 231 235);
    }
    
    .disabled\:bg-gray-400:disabled {
      background-color: rgb(156 163 175);
    }
    
    .disabled\:cursor-not-allowed:disabled {
      cursor: not-allowed;
    }
  `]
})
export class VolunteerLocationModalComponent {
  @Input() volunteer: User | null = null;
  @Output() locationUpdated = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();

  locationForm: FormGroup;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private notificationService: NotificationService
  ) {
    this.locationForm = this.fb.group({
      latitude: [null, [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: [null, [Validators.required, Validators.min(-180), Validators.max(180)]],
      locationDescription: ['']
    });
  }

  ngOnInit(): void {
    if (this.volunteer) {
      // Set default location if none exists
      if (!this.volunteer.location) {
        this.setDefaultLocation();
      } else {
        // Try to parse existing coordinates
        this.parseExistingLocation();
      }
    }
  }

  private parseExistingLocation(): void {
    if (this.volunteer?.location) {
      // Try to extract coordinates from location string
      const coordMatch = this.volunteer.location.match(/Koordinat:\s*([-\d.]+),\s*([-\d.]+)/);
      if (coordMatch) {
        this.locationForm.patchValue({
          latitude: parseFloat(coordMatch[1]),
          longitude: parseFloat(coordMatch[2]),
          locationDescription: this.volunteer.location
        });
      } else {
        // Set description if no coordinates found
        this.locationForm.patchValue({
          locationDescription: this.volunteer.location
        });
      }
    }
  }

  setDefaultLocation(): void {
    // Ankara, Türkiye coordinates
    const ankaraLat = 39.9334;
    const ankaraLng = 32.8597;

    this.locationForm.patchValue({
      latitude: ankaraLat,
      longitude: ankaraLng,
      locationDescription: 'Ankara, Türkiye Merkezi'
    });

    this.notificationService.showInfo('Varsayılan konum Ankara, Türkiye merkezi olarak ayarlandı!');
  }

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.locationForm.patchValue({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            locationDescription: 'Mevcut konum'
          });
          this.notificationService.showSuccess('Mevcut konum alındı!');
        },
        (error) => {
          console.error('Geolocation error:', error);
          this.notificationService.showError('Konum alınamadı. Lütfen manuel olarak girin.');
        }
      );
    } else {
      this.notificationService.showError('Tarayıcınız konum özelliğini desteklemiyor.');
    }
  }

  saveLocation(): void {
    if (this.locationForm.invalid) {
      this.notificationService.showError('Lütfen geçerli koordinatlar girin!');
      return;
    }

    this.isSaving = true;
    const locationData = this.locationForm.value;

    if (this.volunteer?.id) {
      const updateData = {
        location: locationData.locationDescription || `Koordinat: ${locationData.latitude}, ${locationData.longitude}`,
        latitude: locationData.latitude,
        longitude: locationData.longitude
      };

      this.adminService.updateUser(this.volunteer.id, updateData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Konum bilgileri güncellendi!');
          this.locationUpdated.emit();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating location:', error);
          this.notificationService.showError('Konum bilgileri güncellenirken hata oluştu!');
        },
        complete: () => {
          this.isSaving = false;
        }
      });
    }
  }

  closeModal(): void {
    this.modalClosed.emit();
  }
}
