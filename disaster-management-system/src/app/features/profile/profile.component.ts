import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { User, UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="py-6">
            <h1 class="text-3xl font-bold text-gray-900">Profil</h1>
          </div>
        </div>
      </header>



      <main class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        @if (currentUser) {
          <div class="bg-white shadow rounded-lg overflow-hidden">
            <!-- Profile Header -->
            <div class="px-6 py-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div class="flex items-center space-x-4">
                <div class="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
                  {{ currentUser.fullName.charAt(0) }}
                </div>
                <div>
                  <h2 class="text-2xl font-bold">{{ currentUser.fullName }}</h2>
                  <p class="text-blue-100">{{ currentUser.email }}</p>
                  <span class="inline-block px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm mt-2">
                    {{ getRoleLabel(currentUser.role) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Profile Details -->
            <div class="px-6 py-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Personal Information -->
                <div class="space-y-4">
                  <h3 class="text-lg font-medium text-gray-900">Kişisel Bilgiler</h3>
                  
                  <div class="space-y-3 text-sm">
                    <div class="flex justify-between">
                      <span class="font-medium text-gray-700">Ad Soyad:</span>
                      <span class="text-gray-600">{{ currentUser.fullName }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="font-medium text-gray-700">E-posta:</span>
                      <span class="text-gray-600">{{ currentUser.email }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="font-medium text-gray-700">Telefon:</span>
                      <span class="text-gray-600">{{ currentUser.phone_number || 'Belirtilmemiş' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="font-medium text-gray-700">Üyelik Tarihi:</span>
                      <span class="text-gray-600">{{ currentUser.created_at | date:'dd/MM/yyyy' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Role Information -->
                <div class="space-y-4">
                  <h3 class="text-lg font-medium text-gray-900">Rol Bilgileri</h3>
                  
                  <div class="space-y-3 text-sm">
                    <div class="flex justify-between">
                      <span class="font-medium text-gray-700">Rol:</span>
                      <span class="text-gray-600">{{ getRoleLabel(currentUser.role) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="font-medium text-gray-700">Kullanıcı ID:</span>
                      <span class="text-gray-600">{{ currentUser.id }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }

        @if (!currentUser) {
          <div class="text-center py-12">
            <p class="text-gray-500 text-lg">Profil bilgileri yüklenemedi.</p>
          </div>
        }
      </main>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  isAdmin(): boolean {
    return this.currentUser?.role === UserRole.YONETICI;
  }

  getRoleLabel(role: UserRole): string {
    const labels: { [key in UserRole]: string } = {
      [UserRole.VATANDAS]: 'Vatandaş',
      [UserRole.GONULLU]: 'Gönüllü',
      [UserRole.YONETICI]: 'Yönetici'
    };
    return labels[role] || role;
  }
}
