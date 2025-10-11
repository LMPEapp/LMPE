import { Injectable } from '@angular/core';
import { from, Observable, switchMap, throwError } from 'rxjs';
import { AccessApiService } from '../access-api-service';
import { MessageOut, MessageIn } from '../../../Models/Message.model';
import imageCompression from 'browser-image-compression';

@Injectable({
  providedIn: 'root'
})
export class MessageAccessApi {
  private readonly controller = 'message';

  constructor(private api: AccessApiService) {}

  // GET /message/groupe/{groupId}?lastMessageId=...
  getByGroup(groupId: number, lastMessageId?: number): Observable<MessageOut[]> {
    const token = localStorage.getItem('token') || '';
    const params: any = {};
    if (lastMessageId) params.lastMessageId = lastMessageId;
    return this.api.get<MessageOut[]>(`${this.controller}/groupe/${groupId}`, '', params, token);
  }

  // POST /message/groupe/{groupId}
  create(groupId: number, input: MessageIn): Observable<MessageOut> {
    const token = localStorage.getItem('token') || '';
    return this.api.post<MessageOut>(`${this.controller}/groupe/${groupId}`, '', input, token);
  }

  // PUT /message/{messageId}
  update(groupId: number, messageId: number, input: MessageIn): Observable<null> {
    const token = localStorage.getItem('token') || '';
    return this.api.put<null>(`${this.controller}/groupe/${groupId}/${messageId}`, '', input, token);
  }

  // DELETE /message/{messageId}
  delete(groupId: number, messageId: number): Observable<null> {
    const token = localStorage.getItem('token') || '';
    return this.api.delete<null>(`${this.controller}/groupe/${groupId}/${messageId}`, '', token);
  }
    // GET /message/groupe/{groupId}/readAll
  readAll(groupId: number): Observable<number> {
    const token = localStorage.getItem('token') || '';
    return this.api.get<number>(`${this.controller}/groupe/${groupId}/readAll`, '', {}, token);
  }

  // GET /message/Notification
  getNotificationCount(): Observable<number> {
    const token = localStorage.getItem('token') || '';
    return this.api.get<number>(`${this.controller}/Notification`, '', {}, token);
  }

  upload(groupId: number, file: File): Observable<MessageOut> {
    const token = localStorage.getItem('token') || '';
    const type = file.type;

    const isImage = type.startsWith('image/') && type !== 'image/gif';

    // 🧩 Cas 1 : Image (jpg/png/webp…) → compression légère
    if (isImage) {
      const options = {
        maxSizeMB: 2,            // environ 2 Mo
        maxWidthOrHeight: 1920,  // bonne qualité
        initialQuality: 0.8,     // légère compression
        useWebWorker: true
      };

      return from(imageCompression(file, options)).pipe(
        switchMap((compressedFile) => {
          const formData = new FormData();
          formData.append('file', compressedFile, compressedFile.name);
          return this.api.post<MessageOut>(`${this.controller}/groupe/${groupId}/upload`, '', formData, token);
        })
      );
    }

    // 🧩 Cas 2 : GIF ou tout autre fichier → pas de compression, limite 20 Mo
    if (file.size > 20 * 1024 * 1024) {
      return throwError(() => new Error('Le fichier dépasse la limite de 20 Mo'));
    }

    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.api.post<MessageOut>(`${this.controller}/groupe/${groupId}/upload`, '', formData, token);
  }
}
