import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccessApiService } from '../access-api-service';
import { CourbeCA, CourbeCAGroupByDatePoint, CourbeCAIn } from '../../../Models/Courbeca.model';
import { DateOnly } from '../../../Helper/DateOnly';

@Injectable({
  providedIn: 'root'
})
export class CourbeCAAccessApi {
  private readonly controller = 'ca';

  constructor(private api: AccessApiService) {}

  GetAllGroupeByDate(startDate: DateOnly, endDate: DateOnly, allData:boolean, idUser?:number): Observable<CourbeCAGroupByDatePoint[]> {
    const token = localStorage.getItem('token') || '';

    const params: Record<string, string> = {};
    if (startDate) params['startDate'] = startDate.toString();
    if (endDate) params['endDate'] = endDate.toString();
    if (idUser) params['idUser'] = idUser.toString();
    params['allData'] = allData.toString();

    return this.api.get<CourbeCAGroupByDatePoint[]>(this.controller, '', params, token);
  }

  GetAll(lastId: number | null = null, allData:boolean, idUser?:number): Observable<CourbeCA[]> {
    const token = localStorage.getItem('token') || '';

    const params: Record<string, string> = {};
    if (lastId) params['lastId'] = lastId.toString();
    if (idUser) params['idUser'] = idUser.toString();
    params['allData'] = allData.toString();

    return this.api.get<CourbeCA[]>(`${this.controller}/data`, '', params, token);
  }

  getById(id: number): Observable<CourbeCA> {
    const token = localStorage.getItem('token') || '';
    return this.api.get<CourbeCA>(this.controller, id.toString(), {}, token);
  }

  create(input: CourbeCAIn): Observable<CourbeCA> {
    const token = localStorage.getItem('token') || '';
    const payload = {
      ...input,
      datePoint: input.datePointDateOnly.toString() // <-- YYYY-MM-DD
    };
    return this.api.post<CourbeCA>(this.controller, '', payload, token);
  }

  Achat(input: CourbeCAIn): Observable<CourbeCA> {
    const token = localStorage.getItem('token') || '';
    const payload = {
      ...input,
      datePoint: input.datePointDateOnly.toString() // <-- YYYY-MM-DD
    };
    return this.api.post<CourbeCA>(`${this.controller}/Achat`, '', payload, token);
  }


  delete(id: number): Observable<null> {
    const token = localStorage.getItem('token') || '';
    return this.api.delete<null>(this.controller, id.toString(), token);
  }

  // GET pour obtenir la somme des Amount entre 2 dates
  getTotalAmount(startDate: DateOnly, endDate: DateOnly): Observable<number> {
    const token = localStorage.getItem('token') || '';
    const params: Record<string, string> = {};
    if (startDate) params['startDate'] = startDate.toString();
    if (endDate) params['endDate'] = endDate.toString();

    return this.api.get<number>(`${this.controller}/sum`, '', params, token);
  }

}
