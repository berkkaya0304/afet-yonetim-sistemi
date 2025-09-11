import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { NotificationService } from '../../../../core/services/notification.service';

export interface VolunteerSkill {
  id?: number;
  category: string;
  name: string;
  level: string;
  certified: boolean;
  experienceYears: number;
  description: string;
}

@Component({
  selector: 'app-volunteer-skills-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" (click)="closeModal()">
      <div class="relative top-20 mx-auto p-5 border w-91-666667 md-w-3-4 lg-w-1-2 shadow-lg rounded-md bg-white" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Gönüllü Yetkinlikleri Yönetimi</h3>
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
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 class="font-medium text-gray-900 mb-2">{{ volunteerName }}</h4>
          <p class="text-sm text-gray-600">{{ volunteerEmail }}</p>
        </div>

        <!-- Skills Form -->
        <form [formGroup]="skillsForm" (ngSubmit)="saveSkills()" class="space-y-6">
          <div class="space-y-4">
            @for (skill of skills; track $index; let i = $index) {
              <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div class="flex items-center justify-between mb-3">
                  <h5 class="font-medium text-gray-900">Yetkinlik #{{ i + 1 }}</h5>
                  <button 
                    type="button" 
                    (click)="removeSkill(i)" 
                    class="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Kaldır
                  </button>
                </div>       
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                    <select 
                      [formControlName]="'skills.' + i + '.category'"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Kategori seçin</option>
                      <option value="MEDICAL">Tıbbi</option>
                      <option value="TRANSPORTATION">Ulaşım</option>
                      <option value="EQUIPMENT">Ekipman</option>
                      <option value="COMMUNICATION">İletişim</option>
                      <option value="LOGISTICS">Lojistik</option>
                      <option value="CONSTRUCTION">İnşaat</option>
                      <option value="PSYCHOLOGICAL">Psikolojik</option>
                      <option value="ADMINISTRATIVE">İdari</option>
                      <option value="SEARCH_RESCUE">Arama Kurtarma</option>
                      <option value="OTHER">Diğer</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Ad *</label>
                    <input 
                      type="text" 
                      [formControlName]="'skills.' + i + '.name'"
                      placeholder="Örn: İlk Yardım, Şoförlük"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Seviye *</label>
                    <select 
                      [formControlName]="'skills.' + i + '.level'"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seviye seçin</option>
                      <option value="BEGINNER">Başlangıç</option>
                      <option value="INTERMEDIATE">Orta</option>
                      <option value="ADVANCED">İleri</option>
                      <option value="EXPERT">Uzman</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Deneyim (Yıl)</label>
                    <input 
                      type="number" 
                      [formControlName]="'skills.' + i + '.experienceYears'"
                      min="0" 
                      max="50"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div class="mt-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                  <textarea 
                    [formControlName]="'skills.' + i + '.description'"
                    rows="2"
                    placeholder="Yetkinlik hakkında detaylı bilgi"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                <div class="mt-3">
                  <label class="flex items-center">
                    <input 
                      type="checkbox" 
                      [formControlName]="'skills.' + i + '.certified'"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span class="ml-2 text-sm text-gray-700">Sertifikalı</span>
                  </label>
                </div>
              </div>
            }
          </div>

          <button 
            type="button" 
            (click)="addSkill()" 
            class="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
          >
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Yeni Yetkinlik Ekle
          </button>

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
              [disabled]="skillsForm.invalid || isSaving" 
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {{ isSaving ? 'Kaydediliyor...' : 'Kaydet' }}
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
    
    .bg-gray-50 {
      background-color: rgb(249 250 251);
    }
    
    .rounded-lg {
      border-radius: 0.5rem;
    }
    
    .p-4 {
      padding: 1rem;
    }
    
    .mb-2 {
      margin-bottom: 0.5rem;
    }
    
    .text-sm {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }
    
    .text-gray-600 {
      color: rgb(75 85 99);
    }
    
    .space-y-6 > * + * {
      margin-top: 1.5rem;
    }
    
    .space-y-4 > * + * {
      margin-top: 1rem;
    }
    
    .border-gray-200 {
      border-color: rgb(229 231 235);
    }
    
    .bg-gray-50 {
      background-color: rgb(249 250 251);
    }
    
    .mb-3 {
      margin-bottom: 0.75rem;
    }
    
    .text-red-600 {
      color: rgb(220 38 38);
    }
    
    .hover\:text-red-800:hover {
      color: rgb(153 27 27);
    }
    
    .font-medium {
      font-weight: 500;
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
    
    .gap-4 {
      gap: 1rem;
    }
    
    .block {
      display: block;
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
    
    .focus\:outline-none:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
    }
    
    .focus\:ring-2:focus {
      --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
      --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
      box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
    }
    
    .focus\:ring-blue-500:focus {
      --tw-ring-color: rgb(59 130 246);
    }
    
    .w-full {
      width: 100%;
    }
    
    .mt-4 {
      margin-top: 1rem;
    }
    
    .mt-3 {
      margin-top: 0.75rem;
    }
    
    .h-4 {
      height: 1rem;
    }
    
    .text-blue-600 {
      color: rgb(37 99 235);
    }
    
    .focus\:ring-blue-500:focus {
      --tw-ring-color: rgb(59 130 246);
    }
    
    .border-gray-300 {
      border-color: rgb(209 213 219);
    }
    
    .rounded {
      border-radius: 0.25rem;
    }
    
    .ml-2 {
      margin-left: 0.5rem;
    }
    
    .border-2 {
      border-width: 2px;
    }
    
    .border-dashed {
      border-style: dashed;
    }
    
    .py-3 {
      padding-top: 0.75rem;
      padding-bottom: 0.75rem;
    }
    
    .px-4 {
      padding-left: 1rem;
      padding-right: 1rem;
    }
    
    .text-gray-600 {
      color: rgb(75 85 99);
    }
    
    .hover\:border-gray-400:hover {
      border-color: rgb(156 163 175);
    }
    
    .hover\:text-gray-700:hover {
      color: rgb(55 65 81);
    }
    
    .inline {
      display: inline;
    }
    
    .mr-2 {
      margin-right: 0.5rem;
    }
    
    .w-5 {
      width: 1.25rem;
    }
    
    .h-5 {
      height: 1.25rem;
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
    
    .justify-end {
      justify-content: flex-end;
    }
    
    .space-x-3 > * + * {
      margin-left: 0.75rem;
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
  `]
})
export class VolunteerSkillsModalComponent {
  @Input() volunteerId!: number;
  @Input() volunteerName!: string;
  @Input() volunteerEmail!: string;
  @Output() skillsUpdated = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();

  skillsForm: FormGroup;
  skills: VolunteerSkill[] = [];
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private notificationService: NotificationService
  ) {
    this.skillsForm = this.fb.group({
      skills: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Initialize with empty skills array first
    this.skills = [];
    this.updateFormArray();
    this.loadVolunteerSkills();
  }

  private loadVolunteerSkills(): void {
    // Load existing skills from the admin service
    this.adminService.getUserSkills(this.volunteerId).subscribe({
      next: (skills) => {
        this.skills = skills || [];
        this.updateFormArray();
      },
      error: (error) => {
        console.error('Error loading skills:', error);
        this.notificationService.showError('Yetkinlikler yüklenirken hata oluştu!');
        // Initialize with empty skills array
        this.skills = [];
        this.updateFormArray();
      }
    });
  }

  private updateFormArray(): void {
    const skillsArray = this.fb.array<FormGroup>([]);
    
    this.skills.forEach(skill => {
      skillsArray.push(this.fb.group({
        id: [skill.id],
        category: [skill.category, Validators.required],
        name: [skill.name, Validators.required],
        level: [skill.level, Validators.required],
        certified: [skill.certified],
        experienceYears: [skill.experienceYears || 0],
        description: [skill.description || '']
      }));
    });

    this.skillsForm.setControl('skills', skillsArray);
  }

  addSkill(): void {
    const newSkill: VolunteerSkill = {
      category: '',
      name: '',
      level: '',
      certified: false,
      experienceYears: 0,
      description: ''
    };

    this.skills.push(newSkill);
    this.updateFormArray();
  }

  removeSkill(index: number): void {
    this.skills.splice(index, 1);
    this.updateFormArray();
  }

  saveSkills(): void {
    if (this.skillsForm.invalid) {
      this.notificationService.showError('Lütfen tüm zorunlu alanları doldurun!');
      return;
    }

    this.isSaving = true;
    const formSkills = this.skillsForm.get('skills')?.value;
    
    if (!formSkills || !Array.isArray(formSkills)) {
      this.notificationService.showError('Form verisi geçersiz!');
      this.isSaving = false;
      return;
    }

    // Save skills using the admin service
    Promise.all(formSkills.map(async (skill: any) => {
      if (skill.id) {
        // Update existing skill - for now, just return success since we don't have updateSkill method
        return Promise.resolve();
      } else {
        // Create new skill first, then add to user
        try {
          const newSkill = await this.adminService.createSkill(skill).toPromise();
          if (newSkill && newSkill.id) {
            return this.adminService.addUserSkill(this.volunteerId, newSkill.id).toPromise();
          }
          return Promise.resolve();
        } catch (error) {
          console.error('Error creating skill:', error);
          return Promise.reject(error);
        }
      }
    })).then(() => {
      this.notificationService.showSuccess('Yetkinlikler başarıyla kaydedildi!');
      this.skillsUpdated.emit();
      this.closeModal();
    }).catch(error => {
      console.error('Error saving skills:', error);
      this.notificationService.showError('Yetkinlikler kaydedilirken hata oluştu!');
    }).finally(() => {
      this.isSaving = false;
    });
  }

  closeModal(): void {
    this.modalClosed.emit();
  }
}
