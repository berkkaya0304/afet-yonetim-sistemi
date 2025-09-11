import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HelpRequestsService, CreateHelpRequestRequest, CreateHelpRequestRequestAlt } from '../../../core/services/help-requests.service';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole } from '../../../core/models/user.model';
import { RequestType, UrgencyLevel, DisasterType } from '../../../core/models/help-request.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-help-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <!-- Header -->
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <h1 class="text-3xl font-bold text-gray-900">Yeni Yardım Talebi Oluştur</h1>
            <button 
              (click)="goBack()"
              class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
            >
              Geri Dön
            </button>
          </div>
        </div>
      </header>



      <!-- Form -->
      <main class="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="bg-white shadow rounded-lg p-6">
          <form [formGroup]="helpRequestForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Details -->
            <div>
              <label for="details" class="block text-sm font-medium text-gray-700">Detaylar</label>
              <textarea
                id="details"
                formControlName="details"
                rows="4"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Detaylı açıklama"
              ></textarea>
              @if (helpRequestForm.get('details')?.invalid && helpRequestForm.get('details')?.touched) {
                <div class="text-red-600 text-sm mt-1">
                  @if (helpRequestForm.get('details')?.errors?.['required']) {
                    Detaylar gereklidir
                  } @else if (helpRequestForm.get('details')?.errors?.['minlength']) {
                    Detaylar en az 20 karakter olmalıdır
                  }
                </div>
              }
            </div>

            <!-- Request Type -->
            <div>
              <label for="request_type" class="block text-sm font-medium text-gray-700">Talep Türü</label>
              <select
                id="request_type"
                formControlName="request_type"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Tür seçin</option>
                <option [value]="RequestType.GIDA">Gıda</option>
                <option [value]="RequestType.SU">Su</option>
                <option [value]="RequestType.TIBSI">Tıbbi</option>
                <option [value]="RequestType.ENKAZ">Enkaz</option>
                <option [value]="RequestType.BARINMA">Barınma</option>
              </select>
              @if (helpRequestForm.get('request_type')?.invalid && helpRequestForm.get('request_type')?.touched) {
                <div class="text-red-600 text-sm mt-1">
                  Talep türü gereklidir
                </div>
              }
            </div>

            <!-- Disaster Type -->
            <div>
              <label for="disaster_type" class="block text-sm font-medium text-gray-700">Afet Türü</label>
              <select
                id="disaster_type"
                formControlName="disaster_type"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Afet türü seçin (opsiyonel)</option>
                <option [value]="DisasterType.DEPREM">Deprem</option>
                <option [value]="DisasterType.SEL">Sel</option>
                <option [value]="DisasterType.CIG">Çığ</option>
                <option [value]="DisasterType.FIRTINA">Fırtına</option>
              </select>
            </div>

            <!-- Urgency -->
            <div>
              <label for="urgency" class="block text-sm font-medium text-gray-700">Aciliyet</label>
              <select
                id="urgency"
                formControlName="urgency"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Aciliyet seviyesi seçin</option>
                <option [value]="UrgencyLevel.DUSUK">Düşük</option>
                <option [value]="UrgencyLevel.ORTA">Orta</option>
                <option [value]="UrgencyLevel.YUKSEK">Yüksek</option>
              </select>
              @if (helpRequestForm.get('urgency')?.invalid && helpRequestForm.get('urgency')?.touched) {
                <div class="text-red-600 text-sm mt-1">
                  Aciliyet seviyesi gereklidir
                </div>
              }
            </div>

            <!-- Coordinates -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="latitude" class="block text-sm font-medium text-gray-700">Enlem</label>
                <input
                  type="number"
                  id="latitude"
                  formControlName="latitude"
                  step="0.000001"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enlem koordinatı"
                />
                @if (helpRequestForm.get('latitude')?.invalid && helpRequestForm.get('latitude')?.touched) {
                  <div class="text-red-600 text-sm mt-1">
                    @if (helpRequestForm.get('latitude')?.errors?.['required']) {
                      Enlem gereklidir
                    } @else if (helpRequestForm.get('latitude')?.errors?.['min'] || helpRequestForm.get('latitude')?.errors?.['max']) {
                      Enlem -90 ile 90 arasında olmalıdır
                    }
                  </div>
                }
              </div>
              <div>
                <label for="longitude" class="block text-sm font-medium text-gray-700">Boylam</label>
                <input
                  type="number"
                  id="longitude"
                  formControlName="longitude"
                  step="0.000001"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Boylam koordinatı"
                />
                @if (helpRequestForm.get('longitude')?.invalid && helpRequestForm.get('longitude')?.touched) {
                  <div class="text-red-600 text-sm mt-1">
                    @if (helpRequestForm.get('longitude')?.errors?.['required']) {
                      Boylam gereklidir
                    } @else if (helpRequestForm.get('longitude')?.errors?.['min'] || helpRequestForm.get('longitude')?.errors?.['max']) {
                      Boylam -180 ile 180 arasında olmalıdır
                    }
                  </div>
                }
              </div>
            </div>
            
            <!-- Current Location Button -->
            <div class="flex justify-center">
              <button
                type="button"
                (click)="getCurrentLocation()"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Mevcut Konumu Kullan
              </button>
            </div>

            <!-- Error Message -->
            @if (errorMessage) {
              <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {{ errorMessage }}
              </div>
            }

            <!-- Submit Button -->
            <div class="flex justify-end">
              <button
                type="submit"
                [disabled]="helpRequestForm.invalid || isLoading"
                class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium"
              >
                {{ isLoading ? 'Oluşturuluyor...' : 'Yardım Talebi Oluştur' }}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  `
})
export class CreateHelpRequestComponent implements OnDestroy {
  helpRequestForm: FormGroup;
  isLoading = false;
  currentUser: User | null = null;
  RequestType = RequestType;
  UrgencyLevel = UrgencyLevel;
  DisasterType = DisasterType;
  errorMessage = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private helpRequestsService: HelpRequestsService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.helpRequestForm = this.fb.group({
      details: ['', [Validators.required, Validators.minLength(20)]],
      request_type: ['', [Validators.required]],
      disaster_type: [''],
      urgency: ['', [Validators.required]],
      latitude: [null, [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: [null, [Validators.required, Validators.min(-180), Validators.max(180)]]
    });

    // Clear error message when form values change
    const valueChangesSub = this.helpRequestForm.valueChanges.subscribe(() => {
      if (this.errorMessage) {
        this.errorMessage = '';
      }
    });

    this.subscriptions.push(valueChangesSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onSubmit(): void {
    // Mark all fields as touched to trigger validation display
    Object.keys(this.helpRequestForm.controls).forEach(key => {
      const control = this.helpRequestForm.get(key);
      control?.markAsTouched();
    });

    if (this.helpRequestForm.valid) {
      this.isLoading = true;
      const formValue = this.helpRequestForm.value;

      // Ensure coordinates are valid numbers
      const latitude = parseFloat(formValue.latitude);
      const longitude = parseFloat(formValue.longitude);

      if (isNaN(latitude) || isNaN(longitude)) {
        console.error('Geçersiz koordinat değerleri');
        this.errorMessage = 'Geçersiz koordinat değerleri. Lütfen geçerli sayısal değerler girin.';
        this.isLoading = false;
        return;
      }

      const request: CreateHelpRequestRequest = {
        request_type: formValue.request_type,
        details: formValue.details,
        disaster_type: formValue.disaster_type || undefined,
        urgency: formValue.urgency,
        latitude: latitude,
        longitude: longitude
      };

      console.log('Form values:', formValue);
      console.log('Request payload:', request);
      console.log('Request type enum value:', formValue.request_type);
      console.log('Urgency enum value:', formValue.urgency);
      console.log('Disaster type enum value:', formValue.disaster_type);

      const subscription = this.helpRequestsService.createHelpRequest(request).subscribe({
        next: (response) => {
          console.log('Yardım talebi başarıyla oluşturuldu:', response);
          this.errorMessage = '';
          this.helpRequestForm.reset();
          this.router.navigate(['/help-requests']);
        },
        error: (error) => {
          console.error('Yardım talebi oluşturulamadı:', error);
          console.error('Error details:', error.error);
          
          // Try alternative format with lat/lng instead of latitude/longitude
          if (error.status === 400) {
            console.log('Trying alternative field names...');
            this.tryAlternativeFormat(latitude, longitude);
            return;
          }
          
          // Set error message for user
          if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else if (error.error && typeof error.error === 'string') {
            this.errorMessage = error.error;
          } else {
            this.errorMessage = 'Yardım talebi oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.';
          }
          
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });

      this.subscriptions.push(subscription);
    } else {
      console.log('Form is invalid:', this.helpRequestForm.errors);
      console.log('Form controls:', this.helpRequestForm.controls);
      this.errorMessage = 'Lütfen tüm gerekli alanları doldurun ve geçerli değerler girin.';
    }
  }

  isAdmin(): boolean {
    return this.currentUser?.role === UserRole.YONETICI;
  }

  goBack(): void {
    this.helpRequestForm.reset();
    this.errorMessage = '';
    this.router.navigate(['/help-requests']);
  }

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.helpRequestForm.patchValue({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Konum alınamadı:', error);
        }
      );
    } else {
      console.error('Geolocation desteklenmiyor');
    }
  }

  private tryAlternativeFormat(latitude: number, longitude: number): void {
    const formValue = this.helpRequestForm.value;
    
    const altRequest: CreateHelpRequestRequestAlt = {
      request_type: formValue.request_type,
      details: formValue.details,
      disaster_type: formValue.disaster_type || undefined,
      urgency: formValue.urgency,
      lat: latitude,
      lng: longitude
    };

    console.log('Trying alternative format:', altRequest);

    const subscription = this.helpRequestsService.createHelpRequestWithAltFields(altRequest).subscribe({
      next: (response) => {
        console.log('Yardım talebi alternatif format ile başarıyla oluşturuldu:', response);
        this.errorMessage = '';
        this.router.navigate(['/help-requests']);
      },
      error: (error) => {
        console.error('Alternatif format da başarısız:', error);
        this.errorMessage = 'Yardım talebi oluşturulamadı. Lütfen tüm alanları kontrol edin ve tekrar deneyin.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });

    this.subscriptions.push(subscription);
  }
}
