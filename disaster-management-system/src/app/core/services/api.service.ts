import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly apiVersion = environment.apiVersion;

  getApiUrl(endpoint: string): string {
    return `${this.baseUrl}/api/${this.apiVersion}${endpoint}`;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}
