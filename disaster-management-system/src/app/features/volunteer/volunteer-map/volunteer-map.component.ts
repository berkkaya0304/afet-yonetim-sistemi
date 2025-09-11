import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { VolunteerService } from '../../../core/services/volunteer.service';
import { VolunteerTask, VolunteerTeam, Volunteer } from '../../../core/models/volunteer.model';

// Interface for nearby tasks with distance
interface NearbyTask extends VolunteerTask {
  distance: number;
}

@Component({
  selector: 'app-volunteer-map',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="volunteer-map">
      <!-- Header -->
      <div class="map-header">
        <h1>🗺️ Gönüllü Haritası</h1>
        <p>Görevleri ve ekip konumlarını haritada görüntüle</p>
      </div>

      <!-- Map Container -->
      <div class="map-container">
        <div #mapContainer class="map" id="volunteerMap"></div>
        
        <!-- Map Controls -->
        <div class="map-controls">
          <div class="control-group">
            <h4>🗺️ Harita Katmanları</h4>
            <label class="control-item">
              <input type="checkbox" [(ngModel)]="showTasks" (change)="updateMapLayers()" />
              <span>📋 Görevler</span>
            </label>
            <label class="control-item">
              <input type="checkbox" [(ngModel)]="showTeams" (change)="updateMapLayers()" />
              <span>👥 Ekipler</span>
            </label>
            <label class="control-item">
              <input type="checkbox" [(ngModel)]="showVolunteers" (change)="updateMapLayers()" />
              <span>👤 Gönüllüler</span>
            </label>
          </div>

          <div class="control-group">
            <h4>🎯 Görev Filtreleri</h4>
            <label class="control-item">
              <input type="checkbox" [(ngModel)]="showAvailableTasks" (change)="updateMapLayers()" />
              <span>✅ Müsait Görevler</span>
            </label>
            <label class="control-item">
              <input type="checkbox" [(ngModel)]="showCurrentTasks" (change)="updateMapLayers()" />
              <span>🔄 Mevcut Görevler</span>
            </label>
            <label class="control-item">
              <input type="checkbox" [(ngModel)]="showCompletedTasks" (change)="updateMapLayers()" />
              <span>🏁 Tamamlanan Görevler</span>
            </label>
          </div>

          <div class="control-group">
            <h4>📍 Konum</h4>
            <button (click)="centerOnVolunteer()" class="btn btn-primary btn-sm">
              <span>📍</span> Konumuma Git
            </button>
            <button (click)="centerOnTasks()" class="btn btn-secondary btn-sm">
              <span>🎯</span> Görevlere Git
            </button>
          </div>
        </div>

        <!-- Map Info Panel -->
        <div class="map-info-panel">
          <div class="info-header">
            <h3>📊 Harita Bilgileri</h3>
          </div>
          <div class="info-content">
            <div class="info-item">
              <span class="info-label">📍 Müsait Görevler:</span>
              <span class="info-value">{{ availableTasks.length }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">🔄 Mevcut Görevler:</span>
              <span class="info-value">{{ currentTasks.length }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">👥 Aktif Ekipler:</span>
              <span class="info-value">{{ activeTeams.length }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">👤 Aktif Gönüllüler:</span>
              <span class="info-value">{{ activeVolunteers.length }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Task List Panel -->
      <div class="task-list-panel">
        <div class="panel-header">
          <h3>📋 Yakındaki Görevler</h3>
          <button (click)="toggleTaskList()" class="btn-toggle">
            <span>{{ isTaskListOpen ? '▼' : '▲' }}</span>
          </button>
        </div>
        
        @if (isTaskListOpen) {
          <div class="task-list-content">
            @if (nearbyTasks.length > 0) {
              @for (task of nearbyTasks; track task.id) {
                <div class="task-item" (click)="focusOnTask(task)">
                  <div class="task-header">
                    <h4>{{ task.title }}</h4>
                    <span class="task-distance">{{ task.distance }} km</span>
                  </div>
                  <p class="task-description">{{ task.description }}</p>
                  <div class="task-meta">
                    <span class="task-category">{{ getTaskCategoryLabel(task.category) }}</span>
                    <span class="task-priority priority-{{ task.priority.toLowerCase() }}">
                      {{ getTaskPriorityLabel(task.priority) }}
                    </span>
                  </div>
                  <div class="task-actions">
                    @if (task.status === 'PENDING') {
                      <button 
                        (click)="acceptTask(task.id)"
                        class="btn btn-success btn-sm"
                        [disabled]="isAcceptingTask === task.id"
                      >
                        <span>{{ isAcceptingTask === task.id ? '⏳' : '✅' }}</span>
                        {{ isAcceptingTask === task.id ? 'Kabul Ediliyor...' : 'Görevi Üstlen' }}
                      </button>
                    }
                    <button (click)="viewTaskDetails(task)" class="btn btn-outline btn-sm">
                      <span>👁️</span> Detaylar
                    </button>
                  </div>
                </div>
              }
            } @else {
              <div class="empty-state">
                <span class="empty-icon">🎯</span>
                <p>Yakında müsait görev bulunmuyor</p>
                <p class="empty-note">Haritayı genişlet veya daha sonra tekrar kontrol et</p>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .volunteer-map {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .map-header {
      text-align: center;
      margin-bottom: 24px;
    }

    .map-header h1 {
      margin: 0 0 8px 0;
      font-size: 2.5em;
      color: #1e293b;
    }

    .map-header p {
      margin: 0;
      color: #64748b;
      font-size: 1.1em;
    }

    .map-container {
      position: relative;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      border: 1px solid #e2e8f0;
      overflow: hidden;
      margin-bottom: 24px;
    }

    .map {
      width: 100%;
      height: 600px;
      background: #f8fafc;
    }

    .map-controls {
      position: absolute;
      top: 20px;
      right: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      border: 1px solid #e2e8f0;
      padding: 20px;
      max-width: 280px;
      z-index: 1000;
    }

    .control-group {
      margin-bottom: 20px;
    }

    .control-group:last-child {
      margin-bottom: 0;
    }

    .control-group h4 {
      margin: 0 0 12px 0;
      color: #1e293b;
      font-size: 1em;
      font-weight: 600;
    }

    .control-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      cursor: pointer;
      font-size: 0.9em;
      color: #374151;
    }

    .control-item input[type="checkbox"] {
      width: 16px;
      height: 16px;
      accent-color: #3b82f6;
    }

    .map-info-panel {
      position: absolute;
      bottom: 20px;
      left: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      border: 1px solid #e2e8f0;
      padding: 20px;
      min-width: 250px;
      z-index: 1000;
    }

    .info-header h3 {
      margin: 0 0 16px 0;
      color: #1e293b;
      font-size: 1.1em;
      font-weight: 600;
    }

    .info-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .info-item:last-child {
      border-bottom: none;
    }

    .info-label {
      color: #64748b;
      font-size: 0.9em;
    }

    .info-value {
      color: #1e293b;
      font-weight: 600;
      font-size: 0.9em;
    }

    .task-list-panel {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .panel-header h3 {
      margin: 0;
      color: #1e293b;
      font-size: 1.3em;
    }

    .btn-toggle {
      background: none;
      border: none;
      font-size: 1.2em;
      cursor: pointer;
      color: #6b7280;
      padding: 8px;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .btn-toggle:hover {
      background: #f3f4f6;
      color: #374151;
    }

    .task-list-content {
      max-height: 400px;
      overflow-y: auto;
      padding: 20px;
    }

    .task-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .task-item:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
      transform: translateY(-1px);
    }

    .task-item:last-child {
      margin-bottom: 0;
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .task-header h4 {
      margin: 0;
      color: #1e293b;
      font-size: 1.1em;
      flex: 1;
    }

    .task-distance {
      background: #3b82f6;
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8em;
      font-weight: 600;
      margin-left: 12px;
    }

    .task-description {
      margin: 0 0 12px 0;
      color: #64748b;
      font-size: 0.9em;
      line-height: 1.4;
    }

    .task-meta {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }

    .task-category {
      background: #e0f2fe;
      color: #0277bd;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8em;
      font-weight: 500;
    }

    .task-priority {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8em;
      font-weight: 600;
      color: white;
    }

    .priority-low { background: #10b981; }
    .priority-medium { background: #f59e0b; }
    .priority-high { background: #ef4444; }
    .priority-critical { background: #7c2d12; }

    .task-actions {
      display: flex;
      gap: 8px;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.9em;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 0.8em;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover {
      background: #2563eb;
    }

    .btn-secondary {
      background: #6b7280;
      color: white;
    }

    .btn-secondary:hover {
      background: #4b5563;
    }

    .btn-success {
      background: #10b981;
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background: #059669;
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

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #64748b;
    }

    .empty-icon {
      font-size: 3em;
      display: block;
      margin-bottom: 16px;
    }

    .empty-note {
      font-size: 0.9em;
      margin-top: 8px;
      opacity: 0.7;
    }

    @media (max-width: 768px) {
      .volunteer-map {
        padding: 16px;
      }

      .map {
        height: 400px;
      }

      .map-controls {
        position: relative;
        top: auto;
        right: auto;
        max-width: none;
        margin-bottom: 20px;
      }

      .map-info-panel {
        position: relative;
        bottom: auto;
        left: auto;
        margin-top: 20px;
      }

      .task-list-content {
        max-height: 300px;
      }

      .task-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }
    }

    /* Map marker styles */
    .task-marker, .team-marker, .volunteer-marker {
      cursor: pointer;
    }

    /* Popup styles */
    .task-popup, .team-popup, .volunteer-popup {
      min-width: 200px;
      padding: 8px;
    }

    .task-popup h4, .team-popup h4, .volunteer-popup h4 {
      margin: 0 0 8px 0;
      color: #1e293b;
      font-size: 1.1em;
      font-weight: 600;
    }

    .task-popup p, .team-popup p, .volunteer-popup p {
      margin: 4px 0;
      color: #64748b;
      font-size: 0.9em;
      line-height: 1.4;
    }

    .task-popup strong, .team-popup strong, .volunteer-popup strong {
      color: #374151;
      font-weight: 600;
    }
  `]
})
export class VolunteerMapComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  
  // Map properties
  map: any = null;
  mapInitialized = false;
  
  // Map layers
  showTasks = true;
  showTeams = true;
  showVolunteers = true;
  showAvailableTasks = true;
  showCurrentTasks = true;
  showCompletedTasks = false;
  
  // Data
  availableTasks: VolunteerTask[] = [];
  currentTasks: VolunteerTask[] = [];
  completedTasks: VolunteerTask[] = [];
  activeTeams: VolunteerTeam[] = [];
  activeVolunteers: Volunteer[] = [];
  
  // UI state
  isTaskListOpen = true;
  isAcceptingTask: number | null = null;
  
  // Map markers
  taskMarkers: any[] = [];
  teamMarkers: any[] = [];
  volunteerMarkers: any[] = [];
  
  private subscriptions: Subscription[] = [];

  constructor(private volunteerService: VolunteerService) {}

  ngOnInit(): void {
    this.loadMapData();
    this.initializeMap();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.map) {
      this.map.remove();
    }
  }

  private loadMapData(): void {
    // Load available tasks
    this.subscriptions.push(
      this.volunteerService.availableTasks$.subscribe(tasks => {
        this.availableTasks = tasks;
        this.updateMapLayers();
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
        this.updateMapLayers();
      })
    );

    // Load volunteer team
    this.subscriptions.push(
      this.volunteerService.volunteerTeam$.subscribe(team => {
        if (team) {
          this.activeTeams = [team];
        } else {
          this.activeTeams = [];
        }
        this.updateMapLayers();
      })
    );

    // Load initial data
    this.volunteerService.getAvailableTasks().subscribe();
    const currentVolunteer = this.volunteerService.getCurrentVolunteer();
    if (currentVolunteer) {
      this.volunteerService.getVolunteerTasks(currentVolunteer.id).subscribe();
      this.volunteerService.getVolunteerTeam(currentVolunteer.id).subscribe();
      // Initialize active volunteers with current volunteer
      this.activeVolunteers = [currentVolunteer];
    }
  }

  private initializeMap(): void {
    // Initialize Leaflet map
    try {
      setTimeout(() => {
        this.createMap();
      }, 100);
    } catch (error) {
      console.error('Error initializing map:', error);
      this.mapInitialized = true; // Set to true to prevent errors
    }
  }

  private createMap(): void {
    // Initialize Leaflet map
    try {
      // Import Leaflet dynamically to avoid SSR issues
      import('leaflet').then((L) => {
        if (this.mapContainer && this.mapContainer.nativeElement) {
          // Get current volunteer location or default to Istanbul
          const currentVolunteer = this.volunteerService.getCurrentVolunteer();
          let defaultLat = 41.0082;
          let defaultLng = 28.9784;
          let defaultZoom = 10;

          // For now, use mock coordinates since volunteer location is not in the model
          if (currentVolunteer) {
            defaultLat = 41.0082 + (Math.random() - 0.5) * 0.01;
            defaultLng = 28.9784 + (Math.random() - 0.5) * 0.01;
            defaultZoom = 13;
          }

          this.map = L.map('volunteerMap').setView([defaultLat, defaultLng], defaultZoom);
          
          // Add OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(this.map);
          
          // Add current volunteer location marker
          if (currentVolunteer) {
            this.addVolunteerLocationMarker(currentVolunteer, L);
          }
          
          this.mapInitialized = true;
          this.updateMapLayers();
          
          // Add map event listeners
          this.map.on('moveend', () => {
            // Trigger change detection for nearby tasks
            this.updateMapLayers();
          });
        }
      }).catch(error => {
        console.error('Error loading Leaflet:', error);
        this.mapInitialized = true; // Set to true to prevent errors
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      this.mapInitialized = true; // Set to true to prevent errors
    }
  }

  private addVolunteerLocationMarker(volunteer: Volunteer, L: any): void {
    // For now, use mock coordinates since volunteer location is not in the model
    const mockLat = 41.0082 + (Math.random() - 0.5) * 0.01;
    const mockLng = 28.9784 + (Math.random() - 0.5) * 0.01;
    
    const icon = L.divIcon({
      className: 'volunteer-marker current-volunteer',
      html: `<div style="background-color: #ef4444; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">📍</div>`,
      iconSize: [25, 25],
      iconAnchor: [12, 12]
    });
    
    const marker = L.marker([mockLat, mockLng], { icon })
      .addTo(this.map)
      .bindPopup(`
        <div class="volunteer-popup current-volunteer">
          <h4>📍 Sen (${volunteer.firstName} ${volunteer.lastName})</h4>
          <p><strong>Görev Tamamlanan:</strong> ${volunteer.totalTasksCompleted}</p>
          <p><strong>Toplam Saat:</strong> ${volunteer.totalHours}</p>
          <p><strong>Puan:</strong> ${volunteer.rating}</p>
        </div>
      `);
    
    this.volunteerMarkers.push(marker);
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  updateMapLayers(): void {
    if (!this.mapInitialized) return;
    
    // Clear existing markers
    this.clearMarkers();
    
    // Add task markers
    if (this.showTasks) {
      if (this.showAvailableTasks) {
        this.addTaskMarkers(this.availableTasks, 'available');
      }
      if (this.showCurrentTasks) {
        this.addTaskMarkers(this.currentTasks, 'current');
      }
      if (this.showCompletedTasks) {
        this.addTaskMarkers(this.completedTasks, 'completed');
      }
    }
    
    // Add team markers
    if (this.showTeams) {
      this.addTeamMarkers();
    }
    
    // Add volunteer markers
    if (this.showVolunteers) {
      this.addVolunteerMarkers();
    }
  }

  private clearMarkers(): void {
    this.taskMarkers.forEach(marker => {
      if (marker && marker.remove) marker.remove();
    });
    this.teamMarkers.forEach(marker => {
      if (marker && marker.remove) marker.remove();
    });
    this.volunteerMarkers.forEach(marker => {
      if (marker && marker.remove) marker.remove();
    });
    
    this.taskMarkers = [];
    this.teamMarkers = [];
    this.volunteerMarkers = [];
  }

  private addTaskMarkers(tasks: VolunteerTask[], type: string): void {
    if (!this.map) return;
    
    import('leaflet').then((L) => {
      tasks.forEach(task => {
        if (task.location && task.location.latitude && task.location.longitude) {
          const markerColor = this.getTaskMarkerColor(type);
          const icon = L.divIcon({
            className: 'task-marker',
            html: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          
          const marker = L.marker([task.location.latitude, task.location.longitude], { icon })
            .addTo(this.map)
            .bindPopup(`
              <div class="task-popup">
                <h4>${task.title}</h4>
                <p>${task.description}</p>
                <p><strong>Kategori:</strong> ${this.getTaskCategoryLabel(task.category)}</p>
                <p><strong>Öncelik:</strong> ${this.getTaskPriorityLabel(task.priority)}</p>
                <p><strong>Durum:</strong> ${this.getTaskStatusLabel(task.status)}</p>
              </div>
            `);
          
          this.taskMarkers.push(marker);
        }
      });
    });
  }

  private addTeamMarkers(): void {
    if (!this.map) return;
    
    import('leaflet').then((L) => {
      this.activeTeams.forEach(team => {
        if (team.location && team.location.latitude && team.location.longitude) {
          const icon = L.divIcon({
            className: 'team-marker',
            html: `<div style="background-color: #3b82f6; width: 25px; height: 25px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">👥</div>`,
            iconSize: [25, 25],
            iconAnchor: [12, 12]
          });
          
          const marker = L.marker([team.location.latitude, team.location.longitude], { icon })
            .addTo(this.map)
            .bindPopup(`
              <div class="team-popup">
                <h4>${team.name}</h4>
                <p>${team.description}</p>
                <p><strong>Üye Sayısı:</strong> ${team.currentMembers}/${team.maxMembers}</p>
                <p><strong>Durum:</strong> ${this.getTeamStatusLabel(team.status)}</p>
              </div>
            `);
          
          this.teamMarkers.push(marker);
        }
      });
    });
  }

  private addVolunteerMarkers(): void {
    if (!this.map) return;
    
    import('leaflet').then((L) => {
      this.activeVolunteers.forEach(volunteer => {
        // For now, use mock coordinates since volunteer location is not in the model
        const mockLat = 41.0082 + (Math.random() - 0.5) * 0.1;
        const mockLng = 28.9784 + (Math.random() - 0.5) * 0.1;
        
        const icon = L.divIcon({
          className: 'volunteer-marker',
          html: `<div style="background-color: #10b981; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">👤</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        
        const marker = L.marker([mockLat, mockLng], { icon })
          .addTo(this.map)
          .bindPopup(`
            <div class="volunteer-popup">
              <h4>${volunteer.firstName} ${volunteer.lastName}</h4>
              <p><strong>Görev Tamamlanan:</strong> ${volunteer.totalTasksCompleted}</p>
              <p><strong>Toplam Saat:</strong> ${volunteer.totalHours}</p>
              <p><strong>Puan:</strong> ${volunteer.rating}</p>
            </div>
          `);
        
        this.volunteerMarkers.push(marker);
      });
    });
  }

  private getTaskMarkerColor(type: string): string {
    switch (type) {
      case 'available': return '#10b981'; // Green
      case 'current': return '#f59e0b';   // Orange
      case 'completed': return '#6b7280'; // Gray
      default: return '#3b82f6';          // Blue
    }
  }

  centerOnVolunteer(): void {
    // Center map on current volunteer location
    if (this.map && this.activeVolunteers.length > 0) {
      // For now, center on Istanbul with a slight offset
      const volunteer = this.activeVolunteers[0];
      const mockLat = 41.0082 + (Math.random() - 0.5) * 0.05;
      const mockLng = 28.9784 + (Math.random() - 0.5) * 0.05;
      
      this.map.setView([mockLat, mockLng], 13);
      console.log('Centered on volunteer location');
    }
  }

  centerOnTasks(): void {
    // Center map on available tasks
    if (this.map && this.availableTasks.length > 0) {
      const tasksWithLocation = this.availableTasks.filter(task => 
        task.location && task.location.latitude && task.location.longitude
      );
      
      if (tasksWithLocation.length > 0) {
        const bounds = tasksWithLocation.map(task => [
          task.location.latitude,
          task.location.longitude
        ]);
        
        this.map.fitBounds(bounds, { padding: [20, 20] });
        console.log('Centered on available tasks');
      } else {
        // If no tasks have location, center on Istanbul
        this.map.setView([41.0082, 28.9784], 10);
      }
    }
  }

  toggleTaskList(): void {
    this.isTaskListOpen = !this.isTaskListOpen;
  }

  focusOnTask(task: VolunteerTask): void {
    // Focus map on specific task
    if (this.map && task.location && task.location.latitude && task.location.longitude) {
      this.map.setView([task.location.latitude, task.location.longitude], 15);
      console.log('Focused on task:', task.id);
    }
  }

  acceptTask(taskId: number): void {
    this.isAcceptingTask = taskId;
    
    this.volunteerService.acceptTask(taskId).subscribe({
      next: (task) => {
        console.log('Task accepted successfully:', task);
        this.isAcceptingTask = null;
        // Refresh map data
        this.loadMapData();
      },
      error: (error) => {
        console.error('Error accepting task:', error);
        this.isAcceptingTask = null;
        // You might want to show an error message to the user here
      }
    });
  }

  viewTaskDetails(task: VolunteerTask): void {
    // This would open a task details modal or navigate to task details
    console.log('Viewing task details:', task.id);
    // TODO: Implement task details view
  }

  // Computed properties
  get nearbyTasks(): NearbyTask[] {
    if (!this.map) {
      // If map is not initialized, return all available tasks with mock distance
      return this.availableTasks.map(task => ({
        ...task,
        distance: Math.floor(Math.random() * 10) + 1 // Mock distance
      }));
    }
    
    const center = this.map.getCenter();
    
    // Calculate nearby tasks based on map center
    return this.availableTasks
      .filter(task => {
        if (task.location && task.location.latitude && task.location.longitude) {
          const distance = this.calculateDistance(
            center.lat, 
            center.lng, 
            task.location.latitude, 
            task.location.longitude
          );
          return distance <= 50; // Show tasks within 50km
        }
        return false;
      })
      .map(task => ({
        ...task,
        distance: this.calculateDistance(
          center.lat, 
          center.lng, 
          task.location.latitude, 
          task.location.longitude
        )
      }))
      .sort((a, b) => a.distance - b.distance);
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
      'PENDING': 'Beklemede',
      'ASSIGNED': 'Atandı',
      'IN_PROGRESS': 'Devam Ediyor',
      'COMPLETED': 'Tamamlandı',
      'CANCELLED': 'İptal Edildi',
      'FAILED': 'Başarısız'
    };
    return labels[status] || status;
  }

  getTeamStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'ACTIVE': 'Aktif',
      'INACTIVE': 'Aktif Değil',
      'FULL': 'Dolu',
      'RECRUITING': 'Üye Arıyor',
      'SUSPENDED': 'Askıya Alındı'
    };
    return labels[status] || status;
  }
}
