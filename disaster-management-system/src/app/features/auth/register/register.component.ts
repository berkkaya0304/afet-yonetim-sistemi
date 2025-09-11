import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterRequest } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Yeni Hesap Oluştur
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Afet Yönetim Sistemine katılın
          </p>
        </div>
        <form class="mt-8 space-y-6" [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="space-y-4">
            <div>
              <label for="fullName" class="block text-sm font-medium text-gray-700">Ad Soyad</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Ad ve soyadınız"
                formControlName="fullName"
              />
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">E-posta</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="E-posta adresiniz"
                formControlName="email"
              />
            </div>
            <div>
              <label for="phone_number" class="block text-sm font-medium text-gray-700">Telefon</label>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Telefon numaranız (opsiyonel)"
                formControlName="phone_number"
              />
            </div>
            <div>
              <label for="role" class="block text-sm font-medium text-gray-700">Rol</label>
              <select
                id="role"
                name="role"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                formControlName="role"
              >
                <option value="">Rol seçin</option>
                <option [value]="UserRole.VATANDAS">Vatandaş</option>
                <option [value]="UserRole.GONULLU">Gönüllü</option>
              </select>
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Şifre</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Şifreniz"
                formControlName="password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              [disabled]="registerForm.invalid || isLoading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {{ isLoading ? 'Kayıt olunuyor...' : 'Kayıt Ol' }}
            </button>
          </div>

          <div class="text-center">
            <a routerLink="/auth/login" class="font-medium text-indigo-600 hover:text-indigo-500">
              Zaten hesabınız var mı? Giriş yapın
            </a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  UserRole = UserRole;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone_number: [''],
      role: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const userData: RegisterRequest = this.registerForm.value;

      this.authService.register(userData).subscribe({
        next: (response) => {
          console.log('Başarıyla kayıt olundu!');
          // Show success message and redirect to login
          this.notificationService.showSuccess('Başarıyla kayıt olundu! Şimdi giriş yapabilirsiniz.');
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          console.error('Kayıt başarısız:', error);
          this.notificationService.showError('Kayıt işlemi başarısız oldu. Lütfen tekrar deneyin.');
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}
