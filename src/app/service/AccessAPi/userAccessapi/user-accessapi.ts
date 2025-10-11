import { Injectable } from '@angular/core';
import { from, Observable, switchMap, tap, throwError } from 'rxjs';
import { AccessApiService } from '../access-api-service';
import { User, UserIn } from '../../../Models/user.model';
import imageCompression from 'browser-image-compression';

@Injectable({
  providedIn: 'root'
})
export class UserAccessapi {
  private readonly controller = 'user';

  constructor(private api: AccessApiService) {}

  get(): Observable<User[]> {
    const token = localStorage.getItem('token') || '';
    return this.api.get<User[]>(this.controller, '', {}, token);
  }

  delete(id:number): Observable<null> {
    const token = localStorage.getItem('token') || '';
    return this.api.delete<null>(this.controller, id.toString(), token);
  }

  update(id:number, user:UserIn): Observable<null> {
    const token = localStorage.getItem('token') || '';
    return this.api.put<null>(this.controller, id.toString(), user, token);
  }

  create(user:UserIn): Observable<User> {
    const token = localStorage.getItem('token') || '';
    return this.api.post<User>(this.controller, "",user , token);
  }

  uploadImage(id: number, file: File): Observable<{ url: string }> {
    const token = localStorage.getItem('token') || '';

    // Vérifie si c’est un GIF
    const isGif = file.type === 'image/gif';

    // Si c’est un GIF, on ne compresse pas
    if (isGif) {
      // Vérifie la taille (limite 2 Mo)
      const maxGifSize = 2 * 1024 * 1024; // 2 Mo
      if (file.size > maxGifSize) {
        return throwError(() => new Error('Le GIF dépasse la taille maximale autorisée (2 Mo).'));
      }

      // Upload direct du GIF
      const formData = new FormData();
      formData.append('file', file, file.name);
      return this.api.post<{ url: string }>(this.controller, `${id}/upload`, formData, token);
    }

    // ⚙️ Sinon, compression des images classiques
    const options = {
      maxSizeMB: 1, // taille max finale (~1 Mo)
      maxWidthOrHeight: 1024, // redimensionne si besoin
      useWebWorker: true, // plus rapide
    };

    return from(imageCompression(file, options)).pipe(
      switchMap((compressedFile) => {
        const formData = new FormData();
        formData.append('file', compressedFile, compressedFile.name);

        return this.api.post<{ url: string }>(this.controller, `${id}/upload`, formData, token);
      })
    );
  }


}
