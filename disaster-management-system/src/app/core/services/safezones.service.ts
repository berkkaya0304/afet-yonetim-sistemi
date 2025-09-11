import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Safezone, ZoneType } from '../models/safezone.model';
import { ApiService } from './api.service';

export interface CreateSafezoneRequest {
  name: string;
  zone_type: ZoneType;
  location_id?: number;
  latitude?: number;
  longitude?: number;
}

export interface UpdateSafezoneRequest {
  name?: string;
  zone_type?: ZoneType;
  location_id?: number;
  latitude?: number;
  longitude?: number;
}

export interface NearbySafezoneRequest {
  latitude: number;
  longitude: number;
  radius: number;
}

export interface SafezoneSearchRequest {
  query: string;
  zone_type?: ZoneType;
}

@Injectable({
  providedIn: 'root'
})
export class SafezonesService {
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  getSafezones(): Observable<Safezone[]> {
    return this.http.get<Safezone[]>(this.apiService.getApiUrl('/safezones'));
  }

  getSafezoneById(id: number): Observable<Safezone> {
    return this.http.get<Safezone>(this.apiService.getApiUrl(`/safezones/${id}`));
  }

  getNearbySafezones(request: NearbySafezoneRequest): Observable<Safezone[]> {
    const params = new HttpParams()
      .set('latitude', request.latitude.toString())
      .set('longitude', request.longitude.toString())
      .set('radius', request.radius.toString());
    return this.http.get<Safezone[]>(this.apiService.getApiUrl('/safezones/nearby'), { params });
  }

  searchSafezones(request: SafezoneSearchRequest): Observable<Safezone[]> {
    let params = new HttpParams().set('query', request.query);
    if (request.zone_type) {
      params = params.set('zone_type', request.zone_type);
    }
    return this.http.get<Safezone[]>(this.apiService.getApiUrl('/safezones/search'), { params });
  }

  // Admin endpoints
  getAdminSafezones(): Observable<Safezone[]> {
    return this.http.get<Safezone[]>(this.apiService.getApiUrl('/admin/safezones'));
  }

  createSafezone(request: CreateSafezoneRequest): Observable<Safezone> {
    return this.http.post<Safezone>(this.apiService.getApiUrl('/admin/safezones'), request);
  }

  updateSafezone(id: number, request: UpdateSafezoneRequest): Observable<Safezone> {
    return this.http.put<Safezone>(this.apiService.getApiUrl(`/admin/safezones/${id}`), request);
  }

  deleteSafezone(id: number): Observable<void> {
    return this.http.delete<void>(this.apiService.getApiUrl(`/admin/safezones/${id}`));
  }
}
