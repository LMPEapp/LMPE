import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccessApiService } from '../access-api-service';
import { CourbeCA, CourbeCAIn } from '../../../Models/Courbeca.model';

@Injectable({
  providedIn: 'root'
})
export class CourbeCAAccessApi {
  private readonly controller = 'ca';

  constructor(private api: AccessApiService) {}

  getAll(startDate: Date, endDate: Date): Observable<CourbeCA[]> {
    const token = localStorage.getItem('token') || '';

    const params: Record<string, string> = {};
    if (startDate) params['startDate'] = startDate.toISOString();
    if (endDate) params['endDate'] = endDate.toISOString();

    return this.api.get<CourbeCA[]>(this.controller, '', params, token);
  }

  getById(id: number): Observable<CourbeCA> {
    const token = localStorage.getItem('token') || '';
    return this.api.get<CourbeCA>(this.controller, id.toString(), {}, token);
  }

  create(input: CourbeCAIn): Observable<CourbeCA> {
    const token = localStorage.getItem('token') || '';
    return this.api.post<CourbeCA>(this.controller, '', input, token);
  }

  delete(id: number): Observable<null> {
    const token = localStorage.getItem('token') || '';
    return this.api.delete<null>(this.controller, id.toString(), token);
  }

  // GET pour obtenir la somme des Amount entre 2 dates
  getTotalAmount(startDate: Date, endDate: Date): Observable<number> {
    const token = localStorage.getItem('token') || '';
    const params: Record<string, string> = {};
    if (startDate) params['startDate'] = startDate.toISOString();
    if (endDate) params['endDate'] = endDate.toISOString();

    return this.api.get<number>(`${this.controller}/sum`, '', params, token);
  }

}
