import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { VolunteerService } from '../../../core/services/volunteer.service';
import { VolunteerTask, TaskStatus, TaskPriority, TaskCategory, EmergencyLevel } from '../../../core/models/volunteer.model';

@Component({
  selector: 'app-volunteer-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="volunteer-tasks">
      <!-- Header -->
      <div class="tasks-header">
        <h1>📋 Gönüllü Görevleri</h1>
        <p>Müsait görevleri görüntüle ve görevlerini yönet</p>
      </div>

      <!-- Task Filters -->
      <div class="task-filters">
        <div class="filter-group">
          <label for="statusFilter">Durum:</label>
          <select id="statusFilter" [(ngModel)]="statusFilter" class="filter-select">
            <option value="">Tümü</option>
            <option value="PENDING">Bekleyen</option>
            <option value="ASSIGNED">Atanan</option>
            <option value="IN_PROGRESS">Devam Eden</option>
            <option value="COMPLETED">Tamamlanan</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="categoryFilter">Kategori:</label>
          <select id="categoryFilter" [(ngModel)]="categoryFilter" class="filter-select">
            <option value="">Tümü</option>
            <option value="SEARCH_RESCUE">Arama Kurtarma</option>
            <option value="MEDICAL_AID">Tıbbi Yardım</option>
            <option value="TRANSPORTATION">Ulaşım</option>
            <option value="DISTRIBUTION">Dağıtım</option>
            <option value="COMMUNICATION">İletişim</option>
            <option value="LOGISTICS">Lojistik</option>
            <option value="CONSTRUCTION">İnşaat</option>
            <option value="PSYCHOLOGICAL_SUPPORT">Psikolojik Destek</option>
            <option value="ADMINISTRATIVE">İdari</option>
            <option value="OTHER">Diğer</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="priorityFilter">Öncelik:</label>
          <select id="priorityFilter" [(ngModel)]="priorityFilter" class="filter-select">
            <option value="">Tümü</option>
            <option value="LOW">Düşük</option>
            <option value="MEDIUM">Orta</option>
            <option value="HIGH">Yüksek</option>
            <option value="CRITICAL">Kritik</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="emergencyFilter">Acil Durum:</label>
          <select id="emergencyFilter" [(ngModel)]="emergencyFilter" class="filter-select">
            <option value="">Tümü</option>
            <option value="NORMAL">Normal</option>
            <option value="URGENT">Acil</option>
            <option value="CRITICAL">Kritik</option>
            <option value="EMERGENCY">Acil Durum</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="searchFilter">Arama:</label>
          <input 
            type="text" 
            id="searchFilter" 
            [(ngModel)]="searchFilter" 
            class="filter-input"
            placeholder="Görev adı veya açıklama ara..."
          />
        </div>

        <div class="filter-group">
          <label for="distanceFilter">Maksimum Mesafe:</label>
          <select id="distanceFilter" [(ngModel)]="distanceFilter" class="filter-select">
            <option value="">Tüm Mesafeler</option>
            <option value="5">5 km</option>
            <option value="10">10 km</option>
            <option value="25">25 km</option>
            <option value="50">50 km</option>
            <option value="100">100 km</option>
          </select>
        </div>
      </div>

      <!-- Task Tabs -->
      <div class="task-tabs">
        <button 
          [class.active]="activeTab === 'available'"
          (click)="setActiveTab('available')"
          class="tab-button"
        >
          <span>🎯</span> Müsait Görevler ({{ filteredAvailableTasks.length }})
        </button>
        <button 
          [class.active]="activeTab === 'current'"
          (click)="setActiveTab('current')"
          class="tab-button"
        >
          <span>🔄</span> Mevcut Görevler ({{ filteredCurrentTasks.length }})
        </button>
        <button 
          [class.active]="activeTab === 'completed'"
          (click)="setActiveTab('completed')"
          class="tab-button"
        >
          <span>✅</span> Tamamlanan Görevler ({{ filteredCompletedTasks.length }})
        </button>
      </div>

      <!-- Available Tasks Tab -->
      @if (activeTab === 'available') {
        <div class="tasks-container">
          @if (isLoadingAvailableTasks) {
            <div class="loading-state">
              <span class="loading-icon">⏳</span>
              <p>Müsait görevler yükleniyor...</p>
            </div>
          } @else if (hasError) {
            <div class="error-state">
              <span class="error-icon">❌</span>
              <p>{{ errorMessage }}</p>
              <button (click)="refreshTasks()" class="btn btn-primary">
                Tekrar Yükle
              </button>
            </div>
          } @else if (filteredAvailableTasks.length > 0) {
            @for (task of filteredAvailableTasks; track task.id) {
              <div class="task-card available-task">
                <div class="task-header">
                  <h3>{{ task.title }}</h3>
                  <div class="task-badges">
                    <span class="badge category-badge">{{ getTaskCategoryLabel(task.category) }}</span>
                    <span class="badge priority-badge priority-{{ task.priority.toLowerCase() }}">
                      {{ getTaskPriorityLabel(task.priority) }}
                    </span>
                    <span class="badge emergency-badge emergency-{{ task.emergencyLevel.toLowerCase() }}">
                      {{ getEmergencyLevelLabel(task.emergencyLevel) }}
                    </span>
                  </div>
                </div>

                <div class="task-content">
                  <p class="task-description">{{ task.description }}</p>
                  
                  <div class="task-details">
                    <div class="detail-item">
                      <span class="detail-label">📍 Konum:</span>
                      <span class="detail-value">{{ task.location.address }}, {{ task.location.district }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">⏱️ Tahmini Süre:</span>
                      <span class="detail-value">{{ task.estimatedDuration }} dakika</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">🛠️ Gerekli Yetkinlikler:</span>
                      <span class="detail-value">
                        @for (skill of task.requiredSkills; track skill) {
                          <span class="skill-tag">{{ getSkillCategoryLabel(skill) }}</span>
                        }
                      </span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">📅 Oluşturulma:</span>
                      <span class="detail-value">{{ formatDate(task.createdAt) }}</span>
                    </div>
                  </div>
                </div>

                <div class="task-actions">
                  <button 
                    (click)="acceptTask(task.id)"
                    class="btn btn-success"
                    [disabled]="isAcceptingTask === task.id"
                  >
                    <span>{{ isAcceptingTask === task.id ? '⏳' : '✅' }}</span>
                    {{ isAcceptingTask === task.id ? 'Kabul Ediliyor...' : 'Görevi Üstlen' }}
                  </button>
                  <button 
                    (click)="viewTaskDetails(task)"
                    class="btn btn-outline"
                  >
                    <span>👁️</span> Detayları Gör
                  </button>
                </div>
              </div>
            }
          } @else {
            <div class="empty-state">
              <span class="empty-icon">🎯</span>
              <h3>Müsait Görev Bulunamadı</h3>
              <p>Seçilen filtrelerle eşleşen müsait görev bulunmuyor.</p>
              <button (click)="clearFilters()" class="btn btn-primary">
                Filtreleri Temizle
              </button>
            </div>
          }
        </div>
      }

      <!-- Current Tasks Tab -->
      @if (activeTab === 'current') {
        <div class="tasks-container">
          @if (isLoadingCurrentTasks) {
            <div class="loading-state">
              <span class="loading-icon">⏳</span>
              <p>Mevcut görevler yükleniyor...</p>
            </div>
          } @else if (hasError) {
            <div class="error-state">
              <span class="error-icon">❌</span>
              <p>{{ errorMessage }}</p>
              <button (click)="refreshTasks()" class="btn btn-primary">
                Tekrar Yükle
              </button>
            </div>
          } @else if (filteredCurrentTasks.length > 0) {
            @for (task of filteredCurrentTasks; track task.id) {
              <div class="task-card current-task">
                <div class="task-header">
                  <h3>{{ task.title }}</h3>
                  <div class="task-badges">
                    <span class="badge status-badge status-{{ task.status.toLowerCase() }}">
                      {{ getTaskStatusLabel(task.status) }}
                    </span>
                    <span class="badge category-badge">{{ getTaskCategoryLabel(task.category) }}</span>
                    <span class="badge priority-badge priority-{{ task.priority.toLowerCase() }}">
                      {{ getTaskPriorityLabel(task.priority) }}
                    </span>
                  </div>
                </div>

                <div class="task-content">
                  <p class="task-description">{{ task.description }}</p>
                  
                  <div class="task-details">
                    <div class="detail-item">
                      <span class="detail-label">📍 Konum:</span>
                      <span class="detail-value">{{ task.location.address }}, {{ task.location.district }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">⏱️ Tahmini Süre:</span>
                      <span class="detail-value">{{ task.estimatedDuration }} dakika</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">📅 Atanma Tarihi:</span>
                      <span class="detail-value">{{ formatDate(task.assignedAt) }}</span>
                    </div>
                    @if (task.startedAt) {
                      <div class="detail-item">
                        <span class="detail-label">🚀 Başlama Tarihi:</span>
                        <span class="detail-value">{{ formatDate(task.startedAt) }}</span>
                      </div>
                    }
                  </div>
                </div>

                <div class="task-actions">
                  @if (task.status === TaskStatus.ASSIGNED) {
                    <button 
                      (click)="updateTaskStatus(task.id, TaskStatus.IN_PROGRESS)"
                      class="btn btn-primary"
                    >
                      <span>🚀</span> Görevi Başlat
                    </button>
                  }
                  @if (task.status === TaskStatus.IN_PROGRESS) {
                    <button 
                      (click)="updateTaskStatus(task.id, TaskStatus.COMPLETED)"
                      class="btn btn-success"
                    >
                      <span>✅</span> Görevi Tamamla
                    </button>
                    <button 
                      (click)="updateTaskStatus(task.id, TaskStatus.CANCELLED)"
                      class="btn btn-danger"
                    >
                      <span>❌</span> Görevi İptal Et
                    </button>
                  }
                  <button 
                    (click)="viewTaskDetails(task)"
                    class="btn btn-outline"
                  >
                    <span>👁️</span> Detayları Gör
                  </button>
                </div>
              </div>
            }
          } @else {
            <div class="empty-state">
              <span class="empty-icon">🔄</span>
              <h3>Mevcut Görev Bulunamadı</h3>
              <p>Şu anda aktif görevin bulunmuyor.</p>
              <button routerLink="/volunteer/tasks" class="btn btn-primary">
                Müsait Görevleri Gör
              </button>
            </div>
          }
        </div>
      }

      <!-- Completed Tasks Tab -->
      @if (activeTab === 'completed') {
        <div class="tasks-container">
          @if (isLoadingCompletedTasks) {
            <div class="loading-state">
              <span class="loading-icon">⏳</span>
              <p>Tamamlanan görevler yükleniyor...</p>
            </div>
          } @else if (hasError) {
            <div class="error-state">
              <span class="error-icon">❌</span>
              <p>{{ errorMessage }}</p>
              <button (click)="refreshTasks()" class="btn btn-primary">
                Tekrar Yükle
              </button>
            </div>
          } @else if (filteredCompletedTasks.length > 0) {
            @for (task of filteredCompletedTasks; track task.id) {
              <div class="task-card completed-task">
                <div class="task-header">
                  <h3>{{ task.title }}</h3>
                  <div class="task-badges">
                    <span class="badge status-badge status-completed">Tamamlandı</span>
                    <span class="badge category-badge">{{ getTaskCategoryLabel(task.category) }}</span>
                    @if (task.rating) {
                      <span class="badge rating-badge">
                        ⭐ {{ task.rating }}/5
                      </span>
                    }
                  </div>
                </div>

                <div class="task-content">
                  <p class="task-description">{{ task.description }}</p>
                  
                  <div class="task-details">
                    <div class="detail-item">
                      <span class="detail-label">📍 Konum:</span>
                      <span class="detail-value">{{ task.location.address }}, {{ task.location.district }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">⏱️ Gerçek Süre:</span>
                      <span class="detail-value">{{ task.actualDuration || 'Belirtilmemiş' }} dakika</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">📅 Tamamlanma Tarihi:</span>
                      <span class="detail-value">{{ formatDate(task.completedAt) }}</span>
                    </div>
                    @if (task.feedback) {
                      <div class="detail-item">
                        <span class="detail-label">💬 Geri Bildirim:</span>
                        <span class="detail-value">{{ task.feedback }}</span>
                      </div>
                    }
                  </div>
                </div>

                <div class="task-actions">
                  <button 
                    (click)="viewTaskDetails(task)"
                    class="btn btn-outline"
                  >
                    <span>👁️</span> Detayları Gör
                  </button>
                </div>
              </div>
            }
          } @else {
            <div class="empty-state">
              <span class="empty-icon">✅</span>
              <h3>Tamamlanan Görev Bulunamadı</h3>
              <p>Henüz hiç görev tamamlamadın.</p>
              <p class="empty-note">Görevleri tamamlayarak deneyim kazan ve rozetler elde et!</p>
            </div>
          }
        </div>
      }

      <!-- Task Details Modal -->
      @if (selectedTask) {
        <div class="modal-overlay" (click)="closeTaskDetails()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>{{ selectedTask.title }}</h3>
              <button (click)="closeTaskDetails()" class="modal-close">×</button>
            </div>
            <div class="modal-body">
              <p class="task-description">{{ selectedTask.description }}</p>
              
              <div class="task-details-grid">
                <div class="detail-item">
                  <span class="detail-label">📍 Konum:</span>
                  <span class="detail-value">{{ selectedTask.location.address }}, {{ selectedTask.location.district }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">⏱️ Tahmini Süre:</span>
                  <span class="detail-value">{{ selectedTask.estimatedDuration }} dakika</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">🛠️ Gerekli Yetkinlikler:</span>
                  <span class="detail-value">
                    @for (skill of selectedTask.requiredSkills; track skill) {
                      <span class="skill-tag">{{ getSkillCategoryLabel(skill) }}</span>
                    }
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">📅 Oluşturulma:</span>
                  <span class="detail-value">{{ formatDate(selectedTask.createdAt) }}</span>
                </div>
                @if (selectedTask.assignedAt) {
                  <div class="detail-item">
                    <span class="detail-label">📅 Atanma:</span>
                    <span class="detail-value">{{ formatDate(selectedTask.assignedAt) }}</span>
                  </div>
                }
                @if (selectedTask.startedAt) {
                  <div class="detail-item">
                    <span class="detail-label">🚀 Başlama:</span>
                    <span class="detail-value">{{ formatDate(selectedTask.startedAt) }}</span>
                  </div>
                }
                @if (selectedTask.completedAt) {
                  <div class="detail-item">
                    <span class="detail-label">✅ Tamamlanma:</span>
                    <span class="detail-value">{{ formatDate(selectedTask.completedAt) }}</span>
                  </div>
                }
              </div>

              @if (selectedTask.photos && selectedTask.photos.length > 0) {
                <div class="task-photos">
                  <h4>📸 Görev Fotoğrafları</h4>
                  <div class="photo-gallery">
                    @for (photo of selectedTask.photos; track photo) {
                      <img [src]="photo" [alt]="'Görev fotoğrafı'" class="task-photo" />
                    }
                  </div>
                </div>
              }
            </div>
            <div class="modal-footer">
              @if (selectedTask.status === 'PENDING') {
                <button 
                  (click)="acceptTask(selectedTask.id)"
                  class="btn btn-success"
                  [disabled]="isAcceptingTask === selectedTask.id"
                >
                  <span>{{ isAcceptingTask === selectedTask.id ? '⏳' : '✅' }}</span>
                  {{ isAcceptingTask === selectedTask.id ? 'Kabul Ediliyor...' : 'Görevi Üstlen' }}
                </button>
              }
              @if (selectedTask.status === TaskStatus.ASSIGNED) {
                <button 
                  (click)="updateTaskStatus(selectedTask.id, TaskStatus.IN_PROGRESS)"
                  class="btn btn-primary"
                >
                  <span>🚀</span> Görevi Başlat
                </button>
              }
              @if (selectedTask.status === TaskStatus.IN_PROGRESS) {
                <button 
                  (click)="updateTaskStatus(selectedTask.id, TaskStatus.COMPLETED)"
                  class="btn btn-success"
                >
                  <span>✅</span> Görevi Tamamla
                </button>
              }
              <button (click)="closeTaskDetails()" class="btn btn-secondary">
                <span>✕</span> Kapat
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .volunteer-tasks {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .tasks-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .tasks-header h1 {
      margin: 0 0 8px 0;
      font-size: 2.5em;
      color: #1e293b;
    }

    .tasks-header p {
      margin: 0;
      color: #64748b;
      font-size: 1.1em;
    }

    .task-filters {
      display: flex;
      gap: 20px;
      margin-bottom: 24px;
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      border: 1px solid #e2e8f0;
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .filter-group label {
      font-weight: 600;
      color: #374151;
      font-size: 0.9em;
    }

    .filter-select {
      padding: 8px 12px;
      border: 2px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.9em;
      background: white;
      min-width: 150px;
    }

    .filter-select:focus {
      outline: none;
      border-color: #3b82f6;
    }

    .filter-input {
      padding: 8px 12px;
      border: 2px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.9em;
      background: white;
      min-width: 200px;
    }

    .filter-input:focus {
      outline: none;
      border-color: #3b82f6;
    }

    .task-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      border-bottom: 2px solid #e2e8f0;
    }

    .tab-button {
      padding: 16px 24px;
      border: none;
      background: none;
      cursor: pointer;
      font-weight: 600;
      color: #64748b;
      border-bottom: 3px solid transparent;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tab-button:hover {
      color: #3b82f6;
    }

    .tab-button.active {
      color: #3b82f6;
      border-bottom-color: #3b82f6;
    }

    .tasks-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .task-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      border: 1px solid #e2e8f0;
      overflow: hidden;
      transition: all 0.2s;
    }

    .task-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    }

    .available-task {
      border-left: 4px solid #10b981;
    }

    .current-task {
      border-left: 4px solid #3b82f6;
    }

    .completed-task {
      border-left: 4px solid #8b5cf6;
    }

    .task-header {
      padding: 20px 24px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }

    .task-header h3 {
      margin: 0;
      color: #1e293b;
      font-size: 1.3em;
      flex: 1;
    }

    .task-badges {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8em;
      font-weight: 600;
      white-space: nowrap;
    }

    .category-badge {
      background: #e0f2fe;
      color: #0277bd;
    }

    .priority-badge {
      color: white;
    }

    .priority-low { background: #10b981; }
    .priority-medium { background: #f59e0b; }
    .priority-high { background: #ef4444; }
    .priority-critical { background: #7c2d12; }

    .emergency-badge {
      color: white;
    }

    .emergency-normal { background: #10b981; }
    .emergency-urgent { background: #f59e0b; }
    .emergency-critical { background: #ef4444; }
    .emergency-emergency { background: #7c2d12; }

    .status-badge {
      color: white;
    }

    .status-pending { background: #6b7280; }
    .status-assigned { background: #3b82f6; }
    .status-in_progress { background: #f59e0b; }
    .status-completed { background: #10b981; }
    .status-cancelled { background: #ef4444; }
    .status-failed { background: #7c2d12; }

    .rating-badge {
      background: #fef3c7;
      color: #92400e;
    }

    .task-content {
      padding: 24px;
    }

    .task-description {
      margin: 0 0 20px 0;
      color: #374151;
      line-height: 1.6;
    }

    .task-details {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .detail-item {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .detail-label {
      font-weight: 600;
      color: #6b7280;
      min-width: 140px;
      flex-shrink: 0;
    }

    .detail-value {
      color: #374151;
      flex: 1;
    }

    .skill-tag {
      display: inline-block;
      background: #f3f4f6;
      color: #374151;
      padding: 4px 8px;
      border-radius: 8px;
      font-size: 0.8em;
      margin-right: 8px;
      margin-bottom: 4px;
    }

    .task-actions {
      padding: 20px 24px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #64748b;
    }

    .empty-icon {
      font-size: 4em;
      display: block;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 12px 0;
      color: #374151;
      font-size: 1.5em;
    }

    .empty-note {
      font-size: 0.9em;
      margin-top: 8px;
      opacity: 0.7;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9em;
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
    }

    .btn-success {
      background: #10b981;
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background: #059669;
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
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

    .btn-secondary {
      background: #6b7280;
      color: white;
    }

    .btn-secondary:hover {
      background: #4b5563;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 80px rgba(0,0,0,0.3);
    }

    .modal-header {
      padding: 24px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h3 {
      margin: 0;
      color: #1e293b;
      font-size: 1.5em;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 2em;
      cursor: pointer;
      color: #6b7280;
      padding: 0;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s;
    }

    .modal-close:hover {
      background: #f3f4f6;
      color: #374151;
    }

    .modal-body {
      padding: 24px;
    }

    .task-details-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      margin-top: 20px;
    }

    .task-photos {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
    }

    .task-photos h4 {
      margin: 0 0 16px 0;
      color: #1e293b;
    }

    .photo-gallery {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
    }

    .task-photo {
      width: 100%;
      height: 150px;
      object-fit: cover;
      border-radius: 8px;
      border: 2px solid #e2e8f0;
    }

    .modal-footer {
      padding: 24px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .loading-state, .error-state {
      text-align: center;
      padding: 60px 20px;
      color: #64748b;
    }

    .loading-icon, .error-icon {
      font-size: 4em;
      display: block;
      margin-bottom: 16px;
    }

    .loading-state p, .error-state p {
      margin: 0 0 12px 0;
      color: #374151;
      font-size: 1.2em;
    }

    @media (max-width: 768px) {
      .volunteer-tasks {
        padding: 16px;
      }

      .task-filters {
        flex-direction: column;
        gap: 16px;
      }

      .filter-select {
        min-width: auto;
        width: 100%;
      }

      .filter-input {
        min-width: auto;
        width: 100%;
      }

      .task-tabs {
        flex-wrap: wrap;
      }

      .tab-button {
        flex: 1;
        min-width: 120px;
        padding: 12px 16px;
        font-size: 0.9em;
      }

      .task-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .task-badges {
        width: 100%;
        justify-content: flex-start;
      }

      .task-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }

      .modal-content {
        margin: 20px;
        max-height: calc(100vh - 40px);
      }
    }
  `]
})
export class VolunteerTasksComponent implements OnInit, OnDestroy {
  activeTab: 'available' | 'current' | 'completed' = 'available';
  availableTasks: VolunteerTask[] = [];
  currentTasks: VolunteerTask[] = [];
  completedTasks: VolunteerTask[] = [];
  selectedTask: VolunteerTask | null = null;
  isAcceptingTask: number | null = null;

  // Loading states
  isLoadingAvailableTasks = false;
  isLoadingCurrentTasks = false;
  isLoadingCompletedTasks = false;

  // Error states
  hasError = false;
  errorMessage = '';

  // Filters
  statusFilter = '';
  categoryFilter = '';
  priorityFilter = '';
  emergencyFilter = '';
  searchFilter = '';
  distanceFilter = '';

  // Enums for template
  TaskStatus = TaskStatus;
  TaskCategory = TaskCategory;
  TaskPriority = TaskPriority;
  EmergencyLevel = EmergencyLevel;

  private subscriptions: Subscription[] = [];

  constructor(private volunteerService: VolunteerService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadTasks(): void {
    // Set loading states
    this.isLoadingAvailableTasks = true;
    this.isLoadingCurrentTasks = true;
    this.isLoadingCompletedTasks = true;
    this.hasError = false;
    this.errorMessage = '';

    // Load available tasks
    this.subscriptions.push(
      this.volunteerService.availableTasks$.subscribe(tasks => {
        this.availableTasks = tasks;
        this.isLoadingAvailableTasks = false;
      })
    );

    // Load volunteer tasks
    this.subscriptions.push(
      this.volunteerService.volunteerTasks$.subscribe(tasks => {
        this.currentTasks = tasks.filter(task => 
          task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS'
        );
        this.completedTasks = tasks.filter(task => 
          task.status === 'COMPLETED'
        );
        this.isLoadingCurrentTasks = false;
        this.isLoadingCompletedTasks = false;
      })
    );

    // Load initial data with error handling
    this.volunteerService.getAvailableTasks().subscribe({
      error: (error) => {
        console.error('Error loading available tasks:', error);
        this.handleError('Müsait görevler yüklenirken hata oluştu');
        this.isLoadingAvailableTasks = false;
      }
    });

    const currentVolunteer = this.volunteerService.getCurrentVolunteer();
    if (currentVolunteer) {
      this.volunteerService.getVolunteerTasks(currentVolunteer.id).subscribe({
        error: (error) => {
          console.error('Error loading volunteer tasks:', error);
          this.handleError('Gönüllü görevleri yüklenirken hata oluştu');
          this.isLoadingCurrentTasks = false;
          this.isLoadingCompletedTasks = false;
        }
      });
    } else {
      this.isLoadingCurrentTasks = false;
      this.isLoadingCompletedTasks = false;
    }
  }

  private handleError(message: string): void {
    this.hasError = true;
    this.errorMessage = message;
    // Clear error after 5 seconds
    setTimeout(() => {
      this.hasError = false;
      this.errorMessage = '';
    }, 5000);
  }

  setActiveTab(tab: 'available' | 'current' | 'completed'): void {
    this.activeTab = tab;
  }

  acceptTask(taskId: number): void {
    this.isAcceptingTask = taskId;
    
    this.volunteerService.acceptTask(taskId).subscribe({
      next: (task) => {
        console.log('Task accepted successfully:', task);
        this.isAcceptingTask = null;
        this.selectedTask = null;
        this.hasError = false;
        this.errorMessage = '';
        // Switch to current tasks tab
        this.setActiveTab('current');
      },
      error: (error) => {
        console.error('Error accepting task:', error);
        this.isAcceptingTask = null;
        this.handleError('Görev kabul edilirken hata oluştu');
      }
    });
  }

  updateTaskStatus(taskId: number, status: TaskStatus): void {
    this.volunteerService.updateTaskStatus(taskId, status).subscribe({
      next: (task) => {
        console.log('Task status updated successfully:', task);
        this.hasError = false;
        this.errorMessage = '';
        // Refresh tasks
        const currentVolunteer = this.volunteerService.getCurrentVolunteer();
        if (currentVolunteer) {
          this.volunteerService.getVolunteerTasks(currentVolunteer.id).subscribe({
            error: (error) => {
              console.error('Error refreshing tasks:', error);
              this.handleError('Görevler yenilenirken hata oluştu');
            }
          });
        }
      },
      error: (error) => {
        console.error('Error updating task status:', error);
        this.handleError('Görev durumu güncellenirken hata oluştu');
      }
    });
  }

  refreshTasks(): void {
    this.loadTasks();
  }

  viewTaskDetails(task: VolunteerTask): void {
    this.selectedTask = task;
  }

  closeTaskDetails(): void {
    this.selectedTask = null;
  }

  clearFilters(): void {
    this.statusFilter = '';
    this.categoryFilter = '';
    this.priorityFilter = '';
    this.emergencyFilter = '';
    this.searchFilter = '';
    this.distanceFilter = '';
  }

  // Filtered tasks
  get filteredAvailableTasks(): VolunteerTask[] {
    return this.availableTasks.filter(task => {
      if (this.categoryFilter && task.category !== this.categoryFilter) return false;
      if (this.priorityFilter && task.priority !== this.priorityFilter) return false;
      if (this.emergencyFilter && task.emergencyLevel !== this.emergencyFilter) return false;
      if (this.searchFilter && 
          !task.title.toLowerCase().includes(this.searchFilter.toLowerCase()) &&
          !task.description.toLowerCase().includes(this.searchFilter.toLowerCase())) return false;
      if (this.distanceFilter) {
        const distance = this.calculateDistance(task.location.latitude, task.location.longitude);
        if (distance > parseInt(this.distanceFilter)) return false;
      }
      return true;
    });
  }

  get filteredCurrentTasks(): VolunteerTask[] {
    return this.currentTasks.filter(task => {
      if (this.statusFilter && task.status !== this.statusFilter) return false;
      if (this.categoryFilter && task.category !== this.categoryFilter) return false;
      if (this.priorityFilter && task.priority !== this.priorityFilter) return false;
      if (this.searchFilter && 
          !task.title.toLowerCase().includes(this.searchFilter.toLowerCase()) &&
          !task.description.toLowerCase().includes(this.searchFilter.toLowerCase())) return false;
      if (this.distanceFilter) {
        const distance = this.calculateDistance(task.location.latitude, task.location.longitude);
        if (distance > parseInt(this.distanceFilter)) return false;
      }
      return true;
    });
  }

  get filteredCompletedTasks(): VolunteerTask[] {
    return this.completedTasks.filter(task => {
      if (this.categoryFilter && task.category !== this.categoryFilter) return false;
      if (this.priorityFilter && task.priority !== this.priorityFilter) return false;
      if (this.searchFilter && 
          !task.title.toLowerCase().includes(this.searchFilter.toLowerCase()) &&
          !task.description.toLowerCase().includes(this.searchFilter.toLowerCase())) return false;
      return true;
    });
  }

  // Helper methods for labels
  getTaskCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'SEARCH_RESCUE': 'Arama Kurtarma',
      'MEDICAL_AID': 'Tıbbi Yardım',
      'TRANSPORTATION': 'Ulaşım',
      'DISTRIBUTION': 'Dağıtım',
      'COMMUNICATION': 'İletişim',
      'LOGISTICS': 'Lojistik',
      'CONSTRUCTION': 'İnşaat',
      'PSYCHOLOGICAL_SUPPORT': 'Psikolojik Destek',
      'ADMINISTRATIVE': 'İdari',
      'OTHER': 'Diğer'
    };
    return labels[category] || category;
  }

  getTaskPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      'LOW': 'Düşük',
      'MEDIUM': 'Orta',
      'HIGH': 'Yüksek',
      'CRITICAL': 'Kritik'
    };
    return labels[priority] || priority;
  }

  getTaskStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'Bekliyor',
      'ASSIGNED': 'Atandı',
      'IN_PROGRESS': 'Devam Ediyor',
      'COMPLETED': 'Tamamlandı',
      'CANCELLED': 'İptal Edildi',
      'FAILED': 'Başarısız'
    };
    return labels[status] || status;
  }

  getEmergencyLevelLabel(level: string): string {
    const labels: { [key: string]: string } = {
      'NORMAL': 'Normal',
      'URGENT': 'Acil',
      'CRITICAL': 'Kritik',
      'EMERGENCY': 'Acil Durum'
    };
    return labels[level] || level;
  }

  getSkillCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'MEDICAL': 'Tıbbi',
      'TRANSPORTATION': 'Ulaşım',
      'EQUIPMENT': 'Ekipman',
      'COMMUNICATION': 'İletişim',
      'LOGISTICS': 'Lojistik',
      'CONSTRUCTION': 'İnşaat',
      'PSYCHOLOGICAL': 'Psikolojik',
      'ADMINISTRATIVE': 'İdari',
      'OTHER': 'Diğer'
    };
    return labels[category] || category;
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'Belirtilmemiş';
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private calculateDistance(lat1: number, lon1: number): number {
    // For now, use mock coordinates (Istanbul center)
    const lat2 = 41.0082;
    const lon2 = 28.9784;
    
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return Math.round(distance);
  }
}
