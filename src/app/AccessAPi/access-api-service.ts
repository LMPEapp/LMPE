import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccessApiService {
  private apiBase = 'https://localhost:7089'; // à adapter

  constructor(private http: HttpClient) {}

  // méthode générique GET
  get<T>(controller: string, action: string, params: any = {}, token?: string): Observable<T> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<T>(`${this.apiBase}/${controller}/${action}`, {
      params: new HttpParams({ fromObject: params }),
      headers
    });
  }

  private buildUrl(controller: string, action?: string): string {
    return action && action.length > 0
      ? `${this.apiBase}/${controller}/${action}`
      : `${this.apiBase}/${controller}`;
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

  // méthode générique DELETE
  delete<T>(controller: string, action: string = '', id?: number | string, token?: string): Observable<T> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    let url = this.buildUrl(controller, action);
    if (id !== undefined) {
      url += `/${id}`;
    }
    return this.http.delete<T>(url, { headers });
  }
}
