import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HelpRequest, RequestStatus, RequestType, UrgencyLevel, DisasterType } from '../models/help-request.model';
import { ApiService } from './api.service';

export interface CreateHelpRequestRequest {
  request_type: RequestType;
  details?: string;
  location_id?: number;
  latitude?: number;
  longitude?: number;
  disaster_type?: DisasterType;
  urgency: UrgencyLevel;
}

// Alternative interface in case backend expects different field names
export interface CreateHelpRequestRequestAlt {
  request_type: RequestType;
  details?: string;
  location_id?: number;
  lat?: number;
  lng?: number;
  disaster_type?: DisasterType;
  urgency: UrgencyLevel;
}

export interface UpdateHelpRequestRequest {
  details?: string;
  urgency?: UrgencyLevel;
  disaster_type?: DisasterType;
}

@Injectable({
  providedIn: 'root'
})
export class HelpRequestsService {
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  getHelpRequests(status?: RequestStatus): Observable<HelpRequest[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<HelpRequest[]>(this.apiService.getApiUrl('/help-requests'), { params });
  }

  getHelpRequestById(id: number): Observable<HelpRequest> {
    return this.http.get<HelpRequest>(this.apiService.getApiUrl(`/help-requests/${id}`));
  }

  getMyHelpRequests(): Observable<HelpRequest[]> {
    return this.http.get<HelpRequest[]>(this.apiService.getApiUrl('/help-requests/my'));
  }

  getNearbyHelpRequests(latitude: number, longitude: number, radius: number = 10): Observable<HelpRequest[]> {
    const params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString())
      .set('radius', radius.toString());
    return this.http.get<HelpRequest[]>(this.apiService.getApiUrl('/help-requests/nearby'), { params });
  }

  createHelpRequest(request: CreateHelpRequestRequest): Observable<HelpRequest> {
    return this.http.post<HelpRequest>(this.apiService.getApiUrl('/help-requests'), request);
  }

  createHelpRequestWithAltFields(request: CreateHelpRequestRequestAlt): Observable<HelpRequest> {
    return this.http.post<HelpRequest>(this.apiService.getApiUrl('/help-requests'), request);
  }

  updateHelpRequest(id: number, request: UpdateHelpRequestRequest): Observable<HelpRequest> {
    return this.http.put<HelpRequest>(this.apiService.getApiUrl(`/help-requests/${id}`), request);
  }

  updateHelpRequestStatus(id: number, status: RequestStatus): Observable<HelpRequest> {
    return this.http.patch<HelpRequest>(this.apiService.getApiUrl(`/help-requests/${id}/status`), { status });
  }

  deleteHelpRequest(id: number): Observable<void> {
    return this.http.delete<void>(this.apiService.getApiUrl(`/help-requests/${id}`));
  }

  // Admin endpoints
  getAdminHelpRequestById(id: number): Observable<HelpRequest> {
    return this.http.get<HelpRequest>(this.apiService.getApiUrl(`/help-requests/admin/${id}`));
  }

  updateAdminHelpRequestStatus(id: number, status: RequestStatus): Observable<HelpRequest> {
    return this.http.patch<HelpRequest>(this.apiService.getApiUrl(`/help-requests/admin/${id}/status`), { status });
  }
}
