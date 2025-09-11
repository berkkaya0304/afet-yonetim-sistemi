import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-volunteer-details-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" (click)="closeModal()">
      <div class="relative top-10 mx-auto p-5 border w-91-666667 md-w-4-5 lg-w-3-4 shadow-lg rounded-md bg-white" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-gray-900">Gönüllü Detayları</h3>
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
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h4 class="text-xl font-bold text-gray-900">{{ volunteer?.fullName }}</h4>
              <p class="text-blue-600 font-medium">{{ volunteer?.email }}</p>
              <p class="text-sm text-gray-600">{{ volunteer?.phone }}</p>
            </div>
            <div class="ml-auto">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                    [ngClass]="{
                      'bg-green-100 text-green-800': volunteer?.isActive,
                      'bg-yellow-100 text-yellow-800': !volunteer?.isActive
                    }">
                {{ getStatusLabel(volunteer?.isActive ? 'ACTIVE' : 'INACTIVE') }}
              </span>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200 mb-6">
          <nav class="-mb-px flex space-x-8">
            <button 
              (click)="activeTab = 'personal'"
              [class]="activeTab === 'personal' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
            >
              Kişisel Bilgiler
            </button>
            <button 
              (click)="activeTab = 'skills'"
              [class]="activeTab === 'skills' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
            >
              Yetkinlikler
            </button>
            <button 
              (click)="activeTab = 'location'"
              [class]="activeTab === 'location' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
            >
              Konum Bilgileri
            </button>
            <button 
              (click)="activeTab = 'activity'"
              [class]="activeTab === 'activity' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
            >
              Aktivite Geçmişi
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="min-h-96">
          <!-- Personal Information Tab -->
          @if (activeTab === 'personal') {
            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
                  <input 
                    type="text" 
                    [formControl]="fullNameControl"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                  <input 
                    type="email" 
                    [formControl]="emailControl"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                  <input 
                    type="tel" 
                    [formControl]="phoneControl"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Durum</label>
                  <select 
                    [formControl]="isActiveControl"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option [value]="true">Aktif</option>
                    <option [value]="false">Pasif</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Konum</label>
                <input 
                  type="text" 
                  [formControl]="locationControl"
                  placeholder="Konum bilgisi yoksa Ankara, Türkiye merkezi kullanılacak"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p class="text-xs text-gray-500 mt-1">Konum belirtilmemişse varsayılan olarak Ankara, Türkiye merkezi kullanılır</p>
              </div>

              <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button 
                  type="button" 
                  (click)="resetForm()" 
                  class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Sıfırla
                </button>
                <button 
                  type="button" 
                  (click)="saveDetails()" 
                  [disabled]="detailsForm.invalid || isSaving" 
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {{ isSaving ? 'Kaydediliyor...' : 'Kaydet' }}
                </button>
              </div>
            </div>
          }

          <!-- Skills Tab -->
          @if (activeTab === 'skills') {
            <div class="space-y-4">
                         @if (volunteer?.skills && volunteer?.skills!.length > 0) {
             <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               @for (skill of volunteer?.skills!; track skill) {
                    <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div class="flex items-center justify-between mb-2">
                        <h5 class="font-medium text-gray-900">{{ skill }}</h5>
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Yetkinlik
                        </span>
                      </div>
                      <p class="text-sm text-gray-600">Kategori: Genel</p>
                      <p class="text-sm text-gray-600">Seviye: Belirtilmemiş</p>
                    </div>
                  }
                </div>
              } @else {
                <div class="text-center py-8">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <h3 class="mt-2 text-sm font-medium text-gray-900">Henüz yetkinlik eklenmemiş</h3>
                  <p class="mt-1 text-sm text-gray-500">Bu gönüllü için henüz yetkinlik tanımlanmamış.</p>
                </div>
              }
            </div>
          }

          <!-- Location Tab -->
          @if (activeTab === 'location') {
            <div class="space-y-6">
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-yellow-800">Konum Bilgisi</h3>
                    <div class="mt-2 text-sm text-yellow-700">
                      <p>Mevcut konum: <strong>{{ volunteer?.location || 'Belirtilmemiş' }}</strong></p>
                      <p class="mt-1">Konum bilgisi yoksa varsayılan olarak <strong>Ankara, Türkiye merkezi</strong> kullanılır.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Enlem</label>
                  <input 
                    type="number" 
                    [formControl]="latitudeControl"
                    step="0.000001"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="39.9334 (Ankara merkez)"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Boylam</label>
                                     <input 
                     type="number" 
                     [formControl]="longitudeControl"
                     step="0.000001"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="32.8597 (Ankara merkez)"
                   />
                </div>
              </div>

              <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button 
                  type="button" 
                  (click)="setDefaultLocation()" 
                  class="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                >
                  Ankara Merkez Olarak Ayarla
                </button>
                <button 
                  type="button" 
                  (click)="saveLocation()" 
                  [disabled]="locationForm.invalid || isSavingLocation" 
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {{ isSavingLocation ? 'Kaydediliyor...' : 'Konumu Kaydet' }}
                </button>
              </div>
            </div>
          }

          <!-- Activity Tab -->
          @if (activeTab === 'activity') {
            <div class="space-y-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="font-medium text-gray-900 mb-3">Aktivite Özeti</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="text-center">
                    <div class="text-2xl font-bold text-blue-600">-</div>
                    <div class="text-sm text-gray-600">Tamamlanan Görev</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-green-600">-</div>
                    <div class="text-sm text-gray-600">Toplam Saat</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-purple-600">-</div>
                    <div class="text-sm text-gray-600">Puan</div>
                  </div>
                </div>
              </div>

              <div class="text-center py-8">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">Henüz aktivite verisi yok</h3>
                <p class="mt-1 text-sm text-gray-500">Bu gönüllü için henüz aktivite kaydı bulunmuyor.</p>
              </div>
            </div>
          }
        </div>
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
    
    .top-10 {
      top: 2.5rem;
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
     
     .md-w-4-5 {
       width: 80%;
     }
     
     .lg-w-3-4 {
       width: 75%;
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
    
    .text-xl {
      font-size: 1.25rem;
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
    
    .w-16 {
      width: 4rem;
    }
    
    .h-16 {
      height: 4rem;
    }
    
    .bg-blue-100 {
      background-color: rgb(219 234 254);
    }
    
    .rounded-full {
      border-radius: 9999px;
    }
    
    .w-8 {
      width: 2rem;
    }
    
    .h-8 {
      height: 2rem;
    }
    
    .text-blue-600 {
      color: rgb(37 99 235);
    }
    
    .text-2xl {
      font-size: 1.5rem;
      line-height: 2rem;
    }
    
    .font-bold {
      font-weight: 700;
    }
    
    .font-medium {
      font-weight: 500;
    }
    
    .text-sm {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }
    
    .text-gray-600 {
      color: rgb(75 85 99);
    }
    
    .ml-auto {
      margin-left: auto;
    }
    
    .inline-flex {
      display: inline-flex;
    }
    
    .px-3 {
      padding-left: 0.75rem;
      padding-right: 0.75rem;
    }
    
    .py-1 {
      padding-top: 0.25rem;
      padding-bottom: 0.25rem;
    }
    
    .rounded-full {
      border-radius: 9999px;
    }
    
    .text-sm {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }
    
    .font-medium {
      font-weight: 500;
    }
    
    .bg-green-100 {
      background-color: rgb(220 252 231);
    }
    
    .text-green-800 {
      color: rgb(22 101 52);
    }
    
    .bg-yellow-100 {
      background-color: rgb(254 249 195);
    }
    
    .text-yellow-800 {
      color: rgb(133 77 14);
    }
    
    .border-b {
      border-bottom-width: 1px;
    }
    
    .border-gray-200 {
      border-color: rgb(229 231 235);
    }
    
    .nav {
      display: flex;
    }
    
    .-mb-px {
      margin-bottom: -1px;
    }
    
    .space-x-8 > :not([hidden]) ~ :not([hidden]) {
      margin-left: 2rem;
    }
    
    .border-blue-500 {
      border-color: rgb(59 130 246);
    }
    
    .text-blue-600 {
      color: rgb(37 99 235);
    }
    
    .border-transparent {
      border-color: transparent;
    }
    
    .text-gray-500 {
      color: rgb(107 114 128);
    }
    
    .hover\:text-gray-700:hover {
      color: rgb(55 65 81);
    }
    
    .hover\:border-gray-300:hover {
      border-color: rgb(209 213 219);
    }
    
    .whitespace-nowrap {
      white-space: nowrap;
    }
    
    .py-2 {
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }
    
    .px-1 {
      padding-left: 0.25rem;
      padding-right: 0.25rem;
    }
    
    .border-b-2 {
      border-bottom-width: 2px;
    }
    
    .min-h-96 {
      min-height: 24rem;
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
    
    .placeholder\:Konum\:bilgisi\:yoksa\:Ankara\,\:Türkiye\:merkezi\:kullanılacak::placeholder {
      color: rgb(156 163 175);
      content: "Konum bilgisi yoksa Ankara, Türkiye merkezi kullanılacak";
    }
    
    .text-xs {
      font-size: 0.75rem;
      line-height: 1rem;
    }
    
    .text-gray-500 {
      color: rgb(107 114 128);
    }
    
    .mt-1 {
      margin-top: 0.25rem;
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
    
    .px-4 {
      padding-left: 1rem;
      padding-right: 1rem;
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
    
    .bg-blue-600 {
      background-color: rgb(37 99 235);
    }
    
    .text-white {
      color: rgb(255 255 255);
    }
    
    .hover\:bg-blue-700:hover {
      background-color: rgb(29 78 216);
    }
    
    .disabled\:bg-gray-400:disabled {
      background-color: rgb(156 163 175);
    }
    
    .disabled\:cursor-not-allowed:disabled {
      cursor: not-allowed;
    }
    
    .space-y-4 > :not([hidden]) ~ :not([hidden]) {
      margin-top: 1rem;
    }
    
    .md\:grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    
    .lg\:grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    
    .gap-4 {
      gap: 1rem;
    }
    
    .bg-gray-50 {
      background-color: rgb(249 250 251);
    }
    
    .border-gray-200 {
      border-color: rgb(229 231 235);
    }
    
    .text-center {
      text-align: center;
    }
    
    .py-8 {
      padding-top: 2rem;
      padding-bottom: 2rem;
    }
    
    .mx-auto {
      margin-left: auto;
      margin-right: auto;
    }
    
    .h-12 {
      height: 3rem;
    }
    
    .w-12 {
      width: 3rem;
    }
    
    .text-gray-400 {
      color: rgb(156 163 175);
    }
    
    .mt-2 {
      margin-top: 0.5rem;
    }
    
    .mt-1 {
      margin-top: 0.25rem;
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
    
    .bg-green-600 {
      background-color: rgb(22 163 74);
    }
    
    .hover\:bg-green-700:hover {
      background-color: rgb(21 128 61);
    }
    
    .min-h-96 {
      min-height: 24rem;
    }
  `]
})
export class VolunteerDetailsModalComponent {
  @Input() volunteer: User | null = null;
  @Output() volunteerUpdated = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();

  activeTab: 'personal' | 'skills' | 'location' | 'activity' = 'personal';
  detailsForm: FormGroup;
  locationForm: FormGroup;
  isSaving = false;
  isSavingLocation = false;

  // Getter methods for properly typed form controls
  get fullNameControl() { 
    const control = this.detailsForm.get('fullName') as FormControl;
    console.log('VolunteerDetailsModal - fullNameControl value:', control?.value);
    return control;
  }
  get emailControl() { 
    const control = this.detailsForm.get('email') as FormControl;
    console.log('VolunteerDetailsModal - emailControl value:', control?.value);
    return control;
  }
  get phoneControl() { 
    const control = this.detailsForm.get('phone') as FormControl;
    console.log('VolunteerDetailsModal - phoneControl value:', control?.value);
    return control;
  }
  get locationControl() { 
    const control = this.detailsForm.get('location') as FormControl;
    console.log('VolunteerDetailsModal - locationControl value:', control?.value);
    return control;
  }
  get isActiveControl() { 
    const control = this.detailsForm.get('isActive') as FormControl;
    console.log('VolunteerDetailsModal - isActiveControl value:', control?.value);
    return control;
  }
  get latitudeControl() { return this.locationForm.get('latitude') as FormControl; }
  get longitudeControl() { return this.locationForm.get('longitude') as FormControl; }

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private notificationService: NotificationService
  ) {
    this.detailsForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      location: [''],
      isActive: [true]
    });

    this.locationForm = this.fb.group({
      latitude: [null, [Validators.min(-90), Validators.max(90)]],
      longitude: [null, [Validators.min(-180), Validators.max(180)]]
    });
  }

  ngOnInit(): void {
    console.log('VolunteerDetailsModal - ngOnInit called');
    console.log('VolunteerDetailsModal - volunteer object:', this.volunteer);
    
    if (this.volunteer) {
      console.log('VolunteerDetailsModal - Setting form values');
      console.log('VolunteerDetailsModal - fullName:', this.volunteer.fullName);
      console.log('VolunteerDetailsModal - email:', this.volunteer.email);
      console.log('VolunteerDetailsModal - phone:', this.volunteer.phone);
      console.log('VolunteerDetailsModal - location:', this.volunteer.location);
      console.log('VolunteerDetailsModal - isActive:', this.volunteer.isActive);
      
      this.detailsForm.patchValue({
        fullName: this.volunteer.fullName || '',
        email: this.volunteer.email || '',
        phone: this.volunteer.phone || '',
        location: this.volunteer.location || '',
        isActive: this.volunteer.isActive
      });

      console.log('VolunteerDetailsModal - Form values after patchValue:', this.detailsForm.value);

      // Set default location if none exists
      if (!this.volunteer.location) {
        this.setDefaultLocation();
      }
    } else {
      console.warn('VolunteerDetailsModal - No volunteer object provided');
    }
  }

  saveDetails(): void {
    if (this.detailsForm.invalid) {
      this.notificationService.showError('Lütfen tüm zorunlu alanları doldurun!');
      return;
    }

    this.isSaving = true;
    const formData = this.detailsForm.value;

    // Ensure location is set to default if empty
    if (!formData.location) {
      formData.location = 'Ankara, Türkiye Merkezi';
    }

    if (this.volunteer?.id) {
      this.adminService.updateUser(this.volunteer.id, formData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Gönüllü bilgileri güncellendi!');
          this.volunteerUpdated.emit();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating volunteer:', error);
          this.notificationService.showError('Gönüllü bilgileri güncellenirken hata oluştu!');
        },
        complete: () => {
          this.isSaving = false;
        }
      });
    }
  }

  saveLocation(): void {
    if (this.locationForm.invalid) {
      this.notificationService.showError('Lütfen geçerli koordinatlar girin!');
      return;
    }

    this.isSavingLocation = true;
    const locationData = this.locationForm.value;

    if (this.volunteer?.id) {
      this.adminService.updateUser(this.volunteer.id, {
        location: `Koordinat: ${locationData.latitude}, ${locationData.longitude}`
      }).subscribe({
        next: () => {
          this.notificationService.showSuccess('Konum bilgileri güncellendi!');
          this.volunteerUpdated.emit();
        },
        error: (error) => {
          console.error('Error updating location:', error);
          this.notificationService.showError('Konum bilgileri güncellenirken hata oluştu!');
        },
        complete: () => {
          this.isSavingLocation = false;
        }
      });
    }
  }

  setDefaultLocation(): void {
    // Ankara, Türkiye coordinates
    const ankaraLat = 39.9334;
    const ankaraLng = 32.8597;

    this.locationForm.patchValue({
      latitude: ankaraLat,
      longitude: ankaraLng
    });

    this.notificationService.showInfo('Varsayılan konum Ankara, Türkiye merkezi olarak ayarlandı!');
  }

  resetForm(): void {
    if (this.volunteer) {
      this.detailsForm.patchValue({
        fullName: this.volunteer.fullName || '',
        email: this.volunteer.email || '',
        phone: this.volunteer.phone || '',
        location: this.volunteer.location || '',
        isActive: this.volunteer.isActive
      });
    }
  }

  closeModal(): void {
    this.modalClosed.emit();
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'ACTIVE': 'Aktif',
      'INACTIVE': 'Pasif',
      'SUSPENDED': 'Askıya Alınmış'
    };
    return labels[status] || status;
  }
}
