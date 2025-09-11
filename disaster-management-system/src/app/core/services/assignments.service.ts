import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { Assignment, AssignmentStatus } from '../models/assignment.model';
import { ApiService } from './api.service';

export interface CreateAssignmentRequest {
  volunteer_id: number;
  request_id: number;
}

export interface UpdateAssignmentRequest {
  status?: AssignmentStatus;
}

@Injectable({
  providedIn: 'root'
})
export class AssignmentsService {
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  getAssignments(status?: AssignmentStatus): Observable<Assignment[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    
    const url = this.apiService.getApiUrl('/assignments');
    console.log('AssignmentsService - Fetching assignments from:', url);
    console.log('AssignmentsService - Params:', params);
    
    return this.http.get<Assignment[]>(url, { params }).pipe(
      catchError((error) => {
        if (error.status === 405) {
          console.log('AssignmentsService - GET method not allowed, trying alternative approach...');
          // Try to get assignments data from help-requests endpoint
          return this.getAssignmentsFromHelpRequests();
        }
        return throwError(() => error);
      })
    );
  }

  // Fallback method: Get assignments data from help-requests
  private getAssignmentsFromHelpRequests(): Observable<Assignment[]> {
    console.log('AssignmentsService - Attempting to get assignments from help-requests endpoint...');
    const url = this.apiService.getApiUrl('/help-requests');
    
    return this.http.get<any[]>(url).pipe(
      map(helpRequests => {
        // Convert help requests with assignment status to assignments
        const assignments: Assignment[] = [];
        
        helpRequests.forEach(request => {
          if (request.assignment_status) {
            assignments.push({
              id: request.id || 0,
              volunteer_id: request.volunteer_id,
              request_id: request.id,
              status: this.mapStatusFromHelpRequest(request.assignment_status),
              assigned_at: request.created_at ? new Date(request.created_at) : new Date()
            });
          }
        });
        
        console.log('AssignmentsService - Created assignments from help requests:', assignments);
        return assignments;
      }),
      catchError((error) => {
        console.error('AssignmentsService - Failed to get assignments from help requests:', error);
        return throwError(() => error);
      })
    );
  }

  private mapStatusFromHelpRequest(status: string): AssignmentStatus {
    switch (status) {
      case 'atanmis':
        return AssignmentStatus.ATANMIS;
      case 'yolda':
        return AssignmentStatus.YOLDA;
      case 'tamamlandi':
        return AssignmentStatus.TAMAMLANDI;
      case 'iptal_edildi':
        return AssignmentStatus.IPTAL_EDILDI;
      default:
        return AssignmentStatus.ATANMIS;
    }
  }

  getAssignmentById(id: number): Observable<Assignment> {
    return this.http.get<Assignment>(this.apiService.getApiUrl(`/assignments/${id}`));
  }

  createAssignment(request: CreateAssignmentRequest): Observable<Assignment> {
    return this.http.post<Assignment>(this.apiService.getApiUrl('/assignments'), request);
  }

  updateAssignment(id: number, request: UpdateAssignmentRequest): Observable<Assignment> {
    return this.http.put<Assignment>(this.apiService.getApiUrl(`/assignments/${id}`), request);
  }

  updateAssignmentStatus(id: number, status: AssignmentStatus): Observable<Assignment> {
    return this.http.patch<Assignment>(this.apiService.getApiUrl(`/assignments/${id}/status`), { status });
  }

  deleteAssignment(id: number): Observable<void> {
    return this.http.delete<void>(this.apiService.getApiUrl(`/assignments/${id}`));
  }

  // Help request status update
  updateHelpRequestStatus(helpRequestId: number, status: string): Observable<any> {
    return this.http.patch(this.apiService.getApiUrl(`/help-requests/${helpRequestId}/status`), { status });
  }

  // Task completion notification
  notifyTaskCompleted(userId: number): Observable<any> {
    return this.http.post(this.apiService.getApiUrl(`/internal/users/${userId}/task-completed`), {});
  }
}
