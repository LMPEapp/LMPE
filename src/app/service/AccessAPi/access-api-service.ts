import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccessApiService {
  public static apiBase = 'https://localhost:7089'; // à adapter

  constructor(private http: HttpClient) {}

  // méthode générique GET
  get<T>(controller: string, action: string, params: any = {}, token?: string): Observable<T> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<T>(`${AccessApiService.apiBase}/${controller}/${action}`, {
      params: new HttpParams({ fromObject: params }),
      headers
    });
  }

  private buildUrl(controller: string, action?: string): string {
    return action && action.length > 0
      ? `${AccessApiService.apiBase}/${controller}/${action}`
      : `${AccessApiService.apiBase}/${controller}`;
  }

  // méthode générique POST
  post<T>(controller: string, action: string = '', data: any, token?: string): Observable<T> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<T>(this.buildUrl(controller, action), data, { headers });
  }

  // méthode générique PUT
  put<T>(controller: string, action: string = '', data: any, token?: string): Observable<T> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<T>(this.buildUrl(controller, action), data, { headers });
  }

  delete<T>(controller: string, action: string = '', token?: string): Observable<T> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<T>(this.buildUrl(controller, action), { headers });
  }
}
