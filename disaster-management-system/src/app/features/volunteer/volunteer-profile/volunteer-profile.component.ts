import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { VolunteerService } from '../../../core/services/volunteer.service';
import { Volunteer, VolunteerSkill, SkillCategory, SkillLevel } from '../../../core/models/volunteer.model';

@Component({
  selector: 'app-volunteer-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="volunteer-profile">
      <!-- Header -->
      <div class="profile-header">
        <h1>👤 Gönüllü Profili</h1>
        <p>Kişisel bilgilerini ve yetkinliklerini güncelle</p>
      </div>

      <!-- Error and Success Messages -->
      @if (hasError) {
        <div class="error-banner">
          <span class="error-icon">⚠️</span>
          <span class="error-text">{{ errorMessage }}</span>
          <button (click)="hasError = false" class="error-close">✕</button>
        </div>
      }

      @if (hasSuccess) {
        <div class="success-banner">
          <span class="success-icon">✅</span>
          <span class="success-text">{{ successMessage }}</span>
          <button (click)="hasSuccess = false" class="success-close">✕</button>
        </div>
      }

      <!-- Loading State -->
      @if (isLoadingProfile) {
        <div class="loading-state">
          <div class="loading-spinner">⏳</div>
          <p>Profil bilgileri yükleniyor...</p>
        </div>
      } @else {
        <!-- Profile Form -->
        <div class="profile-form-container">
          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="profile-form">
            <!-- Personal Information -->
            <div class="form-section">
              <h3>📝 Kişisel Bilgiler</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label for="firstName">Ad *</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    formControlName="firstName"
                    class="form-control"
                    [class.error]="isFieldInvalid('firstName')"
                  />
                  @if (isFieldInvalid('firstName')) {
                    <span class="error-message">Ad alanı zorunludur</span>
                  }
                </div>

                <div class="form-group">
                  <label for="lastName">Soyad *</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    formControlName="lastName"
                    class="form-control"
                    [class.error]="isFieldInvalid('lastName')"
                  />
                  @if (isFieldInvalid('lastName')) {
                    <span class="error-message">Soyad alanı zorunludur</span>
                  }
                </div>

                <div class="form-group">
                  <label for="email">E-posta *</label>
                  <input 
                    type="email" 
                    id="email" 
                    formControlName="email"
                    class="form-control"
                    [class.error]="isFieldInvalid('email')"
                  />
                  @if (isFieldInvalid('email')) {
                    <span class="error-message">Geçerli bir e-posta adresi girin</span>
                  }
                </div>

                <div class="form-group">
                  <label for="phone">Telefon *</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    formControlName="phone"
                    class="form-control"
                    [class.error]="isFieldInvalid('phone')"
                  />
                  @if (isFieldInvalid('phone')) {
                    <span class="error-message">Telefon alanı zorunludur</span>
                  }
                </div>

                <div class="form-group">
                  <label for="dateOfBirth">Doğum Tarihi</label>
                  <input 
                    type="date" 
                    id="dateOfBirth" 
                    formControlName="dateOfBirth"
                    class="form-control"
                  />
                </div>

                <div class="form-group">
                  <label for="city">Şehir *</label>
                  <select 
                    id="city" 
                    formControlName="city"
                    class="form-control"
                    [class.error]="isFieldInvalid('city')"
                  >
                    <option value="">Şehir seçin</option>
                    <option value="İstanbul">İstanbul</option>
                    <option value="Ankara">Ankara</option>
                    <option value="İzmir">İzmir</option>
                    <option value="Bursa">Bursa</option>
                    <option value="Antalya">Antalya</option>
                    <option value="Adana">Adana</option>
                    <option value="Konya">Konya</option>
                    <option value="Gaziantep">Gaziantep</option>
                    <option value="Şanlıurfa">Şanlıurfa</option>
                    <option value="Kocaeli">Kocaeli</option>
                  </select>
                  @if (isFieldInvalid('city')) {
                    <span class="error-message">Şehir alanı zorunludur</span>
                  }
                </div>

                <div class="form-group full-width">
                  <label for="address">Adres</label>
                  <textarea 
                    id="address" 
                    formControlName="address"
                    class="form-control"
                    rows="3"
                    placeholder="Tam adres bilgisi..."
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Emergency Contact -->
            <div class="form-section">
              <h3>🚨 Acil Durum İletişim</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label for="emergencyName">Ad Soyad *</label>
                  <input 
                    type="text" 
                    id="emergencyName" 
                    formControlName="emergencyName"
                    class="form-control"
                    [class.error]="isFieldInvalid('emergencyName')"
                  />
                  @if (isFieldInvalid('emergencyName')) {
                    <span class="error-message">Acil durum kişisi adı zorunludur</span>
                  }
                </div>

                <div class="form-group">
                  <label for="emergencyRelationship">İlişki *</label>
                  <select 
                    id="emergencyRelationship" 
                    formControlName="emergencyRelationship"
                    class="form-control"
                    [class.error]="isFieldInvalid('emergencyRelationship')"
                  >
                    <option value="">İlişki seçin</option>
                    <option value="Eş">Eş</option>
                    <option value="Anne">Anne</option>
                    <option value="Baba">Baba</option>
                    <option value="Kardeş">Kardeş</option>
                    <option value="Çocuk">Çocuk</option>
                    <option value="Arkadaş">Arkadaş</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                  @if (isFieldInvalid('emergencyRelationship')) {
                    <span class="error-message">İlişki alanı zorunludur</span>
                  }
                </div>

                <div class="form-group">
                  <label for="emergencyPhone">Telefon *</label>
                  <input 
                    type="tel" 
                    id="emergencyPhone" 
                    formControlName="emergencyPhone"
                    class="form-control"
                    [class.error]="isFieldInvalid('emergencyPhone')"
                  />
                  @if (isFieldInvalid('emergencyPhone')) {
                    <span class="error-message">Acil durum telefonu zorunludur</span>
                  }
                </div>

                <div class="form-group">
                  <label for="emergencyEmail">E-posta</label>
                  <input 
                    type="email" 
                    id="emergencyEmail" 
                    formControlName="emergencyEmail"
                    class="form-control"
                  />
                </div>
              </div>
            </div>

            <!-- Experience & Motivation -->
            <div class="form-section">
              <h3>💼 Deneyim ve Motivasyon</h3>
              <div class="form-grid">
                <div class="form-group full-width">
                  <label for="experience">Deneyim</label>
                  <textarea 
                    id="experience" 
                    formControlName="experience"
                    class="form-control"
                    rows="4"
                    placeholder="Önceki gönüllülük deneyimleriniz, çalışma alanlarınız..."
                  ></textarea>
                </div>

                <div class="form-group full-width">
                  <label for="motivation">Motivasyon</label>
                  <textarea 
                    id="motivation" 
                    formControlName="motivation"
                    class="form-control"
                    rows="4"
                    placeholder="Gönüllü olma motivasyonunuz, hedefleriniz..."
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Skills Section -->
            <div class="form-section">
              <h3>🛠️ Yetkinlikler</h3>
              
              @if (isLoadingSkills) {
                <div class="loading-skills">
                  <div class="loading-spinner">⏳</div>
                  <p>Yetkinlikler yükleniyor...</p>
                </div>
              } @else {
                <div class="skills-container">
                  <div class="skills-header">
                    <p>Mevcut yetkinliklerinizi güncelleyin veya yeni yetkinlik ekleyin</p>
                    <button type="button" (click)="addSkill()" class="btn btn-primary">
                      <span>➕</span> Yetkinlik Ekle
                    </button>
                  </div>

                  <div formArrayName="skills" class="skills-list">
                    @for (skill of skills; track skill.id; let i = $index) {
                      <div class="skill-item">
                        <div class="skill-header">
                          <h4>Yetkinlik {{ i + 1 }}</h4>
                          <button type="button" (click)="removeSkill(i)" class="btn btn-danger btn-sm">
                            <span>🗑️</span> Kaldır
                          </button>
                        </div>

                        <div class="skill-form-grid">
                          <div class="form-group">
                            <label>Kategori *</label>
                            <select 
                              [formControlName]="'skills.' + i + '.category'"
                              class="form-control"
                              [class.error]="isSkillFieldInvalid(i, 'category')"
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
                              <option value="OTHER">Diğer</option>
                            </select>
                            @if (isSkillFieldInvalid(i, 'category')) {
                              <span class="error-message">Kategori zorunludur</span>
                            }
                          </div>

                          <div class="form-group">
                            <label>Yetkinlik Adı *</label>
                            <input 
                              type="text" 
                              [formControlName]="'skills.' + i + '.name'"
                              class="form-control"
                              [class.error]="isSkillFieldInvalid(i, 'name')"
                              placeholder="Örn: İlk Yardım, Şoförlük..."
                            />
                            @if (isSkillFieldInvalid(i, 'name')) {
                              <span class="error-message">Yetkinlik adı zorunludur</span>
                            }
                          </div>

                          <div class="form-group">
                            <label>Seviye *</label>
                            <select 
                              [formControlName]="'skills.' + i + '.level'"
                              class="form-control"
                              [class.error]="isSkillFieldInvalid(i, 'level')"
                            >
                              <option value="">Seviye seçin</option>
                              <option value="BEGINNER">Başlangıç</option>
                              <option value="INTERMEDIATE">Orta</option>
                              <option value="ADVANCED">İleri</option>
                              <option value="EXPERT">Uzman</option>
                            </select>
                            @if (isSkillFieldInvalid(i, 'level')) {
                              <span class="error-message">Seviye zorunludur</span>
                            }
                          </div>

                          <div class="form-group">
                            <label>Deneyim (Yıl)</label>
                            <input 
                              type="number" 
                              [formControlName]="'skills.' + i + '.experienceYears'"
                              class="form-control"
                              min="0"
                              max="50"
                            />
                          </div>

                          <div class="form-group">
                            <label class="checkbox-label">
                              <input 
                                type="checkbox" 
                                [formControlName]="'skills.' + i + '.certified'"
                              />
                              <span>Sertifikalı</span>
                            </label>
                          </div>

                          <div class="form-group">
                            <label>Sertifika Tarihi</label>
                            <input 
                              type="date" 
                              [formControlName]="'skills.' + i + '.certificationDate'"
                              class="form-control"
                            />
                          </div>

                          <div class="form-group full-width">
                            <label>Açıklama</label>
                            <textarea 
                              [formControlName]="'skills.' + i + '.description'"
                              class="form-control"
                              rows="3"
                              placeholder="Yetkinlik hakkında detaylı bilgi..."
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    }
                  </div>

                  @if (skills.length === 0) {
                    <div class="empty-skills">
                      <span class="empty-icon">🛠️</span>
                      <p>Henüz yetkinlik eklenmemiş</p>
                      <button type="button" (click)="addSkill()" class="btn btn-primary">
                        İlk Yetkinliği Ekle
                      </button>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <button type="button" (click)="resetForm()" class="btn btn-secondary">
                <span>🔄</span> Sıfırla
              </button>
              <button type="submit" [disabled]="isSubmitting" class="btn btn-primary">
                @if (isSubmitting) {
                  <span class="loading-spinner">⏳</span>
                  <span>Güncelleniyor...</span>
                } @else {
                  <span>💾</span>
                  <span>Profili Güncelle</span>
                }
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `,
  styles: [`
    .volunteer-profile {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .profile-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .profile-header h1 {
      margin: 0 0 8px 0;
      font-size: 2.5em;
      color: #1e293b;
    }

    .profile-header p {
      margin: 0;
      color: #64748b;
      font-size: 1.1em;
    }

    .profile-form-container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }

    .profile-form {
      padding: 32px;
    }

    .form-section {
      margin-bottom: 40px;
      padding-bottom: 32px;
      border-bottom: 2px solid #f1f5f9;
    }

    .form-section:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .form-section h3 {
      margin: 0 0 24px 0;
      color: #1e293b;
      font-size: 1.5em;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      margin-bottom: 8px;
      font-weight: 600;
      color: #374151;
    }

    .form-control {
      padding: 12px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1em;
      transition: all 0.2s;
      background: white;
    }

    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-control.error {
      border-color: #ef4444;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.85em;
      margin-top: 4px;
    }

    .skills-container {
      space-y: 20px;
    }

    .skill-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
    }

    .skill-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .skill-header h4 {
      margin: 0;
      color: #1e293b;
      font-size: 1.2em;
    }

    .skill-options {
      margin-top: 16px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-weight: 500;
      color: #374151;
    }

    .checkmark {
      width: 18px;
      height: 18px;
      border: 2px solid #d1d5db;
      border-radius: 4px;
      display: inline-block;
      position: relative;
    }

    input[type="checkbox"]:checked + .checkmark::after {
      content: '✓';
      position: absolute;
      top: -2px;
      left: 2px;
      color: #3b82f6;
      font-weight: bold;
    }

    .btn-add-skill {
      width: 100%;
      padding: 16px;
      font-size: 1.1em;
      margin-top: 20px;
    }

    .form-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
    }

    .loading-state {
      text-align: center;
      padding: 60px 20px;
      color: #64748b;
    }

    .loading-spinner {
      font-size: 3em;
      margin-bottom: 16px;
      display: block;
    }

    .loading-skills {
      text-align: center;
      padding: 40px 20px;
      color: #64748b;
    }

    .error-banner, .success-banner {
      padding: 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      border: 1px solid;
    }

    .error-banner {
      background-color: #fee2e2;
      color: #991b1b;
      border-color: #fda4a4;
    }

    .success-banner {
      background-color: #dcfce7;
      color: #166534;
      border-color: #86efac;
    }

    .error-icon, .success-icon {
      font-size: 1.5em;
    }

    .error-text, .success-text {
      flex-grow: 1;
    }

    .error-close, .success-close {
      background: none;
      border: none;
      font-size: 1.5em;
      cursor: pointer;
      padding: 0;
    }

    .error-close {
      color: #991b1b;
    }

    .success-close {
      color: #166534;
    }

    .skills-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e2e8f0;
    }

    .skills-header p {
      margin: 0;
      color: #64748b;
    }

    .skills-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .skill-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
    }

    .skill-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .skill-header h4 {
      margin: 0;
      color: #1e293b;
    }

    .skill-form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .empty-skills {
      text-align: center;
      padding: 40px 20px;
      color: #64748b;
    }

    .empty-icon {
      font-size: 3em;
      display: block;
      margin-bottom: 16px;
    }

    .empty-skills p {
      margin: 0 0 16px 0;
      color: #374151;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 1em;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: #6b7280;
      color: white;
    }

    .btn-secondary:hover {
      background: #4b5563;
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-danger:hover {
      background: #dc2626;
    }

    .btn-outline {
      background: transparent;
      color: #3b82f6;
      border: 2px solid #3b82f6;
    }

    .btn-outline:hover {
      background: #3b82f6;
      color: white;
    }

    .btn-sm {
      padding: 8px 16px;
      font-size: 0.9em;
    }

    @media (max-width: 768px) {
      .volunteer-profile {
        padding: 16px;
      }

      .profile-form {
        padding: 20px;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class VolunteerProfileComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;
  skills: VolunteerSkill[] = [];
  isSubmitting = false;

  // Loading states
  isLoadingProfile = false;
  isLoadingSkills = false;

  // Error states
  hasError = false;
  errorMessage = '';
  hasSuccess = false;
  successMessage = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private volunteerService: VolunteerService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadVolunteerProfile();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      dateOfBirth: [''],
      address: [''],
      city: ['', Validators.required],
      emergencyName: ['', Validators.required],
      emergencyRelationship: ['', Validators.required],
      emergencyPhone: ['', Validators.required],
      emergencyEmail: [''],
      experience: [''],
      motivation: [''],
      skills: this.fb.array([])
    });
  }

  private loadVolunteerProfile(): void {
    // Set loading states
    this.isLoadingProfile = true;
    this.isLoadingSkills = true;
    this.hasError = false;
    this.errorMessage = '';

    this.subscriptions.push(
      this.volunteerService.currentVolunteer$.subscribe(volunteer => {
        if (volunteer) {
          this.populateForm(volunteer);
          this.isLoadingProfile = false;
          
          // Load skills separately
          this.loadVolunteerSkills(volunteer.id);
        } else {
          this.isLoadingProfile = false;
          this.isLoadingSkills = false;
        }
      })
    );

    // Load current volunteer data
    const currentVolunteer = this.volunteerService.getCurrentVolunteer();
    if (currentVolunteer) {
      this.volunteerService.getVolunteerById(currentVolunteer.id).subscribe({
        error: (error) => {
          console.error('Error loading volunteer profile:', error);
          this.handleError('Profil bilgileri yüklenirken hata oluştu');
          this.isLoadingProfile = false;
        }
      });
    } else {
      this.isLoadingProfile = false;
      this.isLoadingSkills = false;
    }
  }

  private loadVolunteerSkills(volunteerId: number): void {
    this.volunteerService.getVolunteerSkills(volunteerId).subscribe({
      next: (skills) => {
        this.skills = skills;
        this.updateSkillsFormArray();
        this.isLoadingSkills = false;
      },
      error: (error) => {
        console.error('Error loading volunteer skills:', error);
        this.handleError('Yetkinlikler yüklenirken hata oluştu');
        this.isLoadingSkills = false;
      }
    });
  }

  private handleError(message: string): void {
    this.hasError = true;
    this.errorMessage = message;
    this.hasSuccess = false;
    this.successMessage = '';
    // Clear error after 5 seconds
    setTimeout(() => {
      this.hasError = false;
      this.errorMessage = '';
    }, 5000);
  }

  private populateForm(volunteer: Volunteer): void {
    this.profileForm.patchValue({
      firstName: volunteer.firstName,
      lastName: volunteer.lastName,
      email: volunteer.email,
      phone: volunteer.phone,
      dateOfBirth: this.formatDate(volunteer.dateOfBirth),
      address: volunteer.address,
      city: volunteer.city,
      emergencyName: volunteer.emergencyContact.name,
      emergencyRelationship: volunteer.emergencyContact.relationship,
      emergencyPhone: volunteer.emergencyContact.phone,
      emergencyEmail: volunteer.emergencyContact.email || '',
      experience: volunteer.experience,
      motivation: volunteer.motivation
    });
  }

  private updateSkillsFormArray(): void {
    const skillsArray = this.profileForm.get('skills') as any;
    skillsArray.clear();

    this.skills.forEach(skill => {
      skillsArray.push(this.fb.group({
        id: [skill.id],
        category: [skill.category, Validators.required],
        name: [skill.name, Validators.required],
        level: [skill.level, Validators.required],
        certified: [skill.certified],
        certificationDate: [this.formatDate(skill.certificationDate)],
        experienceYears: [skill.experienceYears],
        description: [skill.description]
      }));
    });
  }

  addSkill(): void {
    const newSkill: VolunteerSkill = {
      id: Date.now(),
      category: SkillCategory.OTHER,
      name: '',
      level: SkillLevel.BEGINNER,
      certified: false,
      experienceYears: 0,
      description: ''
    };

    this.skills.push(newSkill);
    this.updateSkillsFormArray();
  }

  removeSkill(index: number): void {
    this.skills.splice(index, 1);
    this.updateSkillsFormArray();
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched();
      this.showErrorMessage('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    this.isSubmitting = true;

    const formValue = this.profileForm.value;
    const updatedVolunteer: Partial<Volunteer> = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone,
      dateOfBirth: formValue.dateOfBirth ? new Date(formValue.dateOfBirth) : undefined,
      address: formValue.address,
      city: formValue.city,
      emergencyContact: {
        name: formValue.emergencyName,
        relationship: formValue.emergencyRelationship,
        phone: formValue.emergencyPhone,
        email: formValue.emergencyEmail
      },
      experience: formValue.experience,
      motivation: formValue.motivation,
      skills: this.skills
    };

    this.volunteerService.updateVolunteerProfile(updatedVolunteer).subscribe({
      next: (volunteer) => {
        console.log('Profile updated successfully:', volunteer);
        this.isSubmitting = false;
        this.showSuccessMessage('Profil başarıyla güncellendi!');
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.isSubmitting = false;
        this.showErrorMessage('Profil güncellenirken bir hata oluştu. Lütfen tekrar dene.');
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      if (control) {
        control.markAsTouched();
        
        // If it's a FormArray (skills), mark each control as touched
        if (control.hasOwnProperty('controls')) {
          const formArray = control as any;
          formArray.controls.forEach((skillControl: any) => {
            Object.keys(skillControl.controls).forEach(skillKey => {
              skillControl.get(skillKey)?.markAsTouched();
            });
          });
        }
      }
    });
  }

  private showSuccessMessage(message: string): void {
    this.hasSuccess = true;
    this.successMessage = message;
    this.hasError = false;
    this.errorMessage = '';
    // Clear success after 5 seconds
    setTimeout(() => {
      this.hasSuccess = false;
      this.successMessage = '';
    }, 5000);
  }

  private showErrorMessage(message: string): void {
    this.handleError(message);
  }

  resetForm(): void {
    this.loadVolunteerProfile();
    this.showSuccessMessage('Form sıfırlandı');
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  isSkillFieldInvalid(skillIndex: number, fieldName: string): boolean {
    const skillsArray = this.profileForm.get('skills') as any;
    const skillGroup = skillsArray.at(skillIndex);
    if (skillGroup) {
      const field = skillGroup.get(fieldName);
      return field ? field.invalid && (field.dirty || field.touched) : false;
    }
    return false;
  }

  private formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }
}
