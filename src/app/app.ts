import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { SwPush, SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatSnackBarModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('LMPE');

  constructor(private swUpdate: SwUpdate, private snackBar: MatSnackBar, private swPush: SwPush) {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          // Affiche un message pendant quelques secondes si tu veux
          this.snackBar.open(
            'Nouvelle version disponible, rechargement obligatoire...',
            undefined,
            { duration: 3000 }
          );

          // Force le reload immédiatement après un petit délai
          setTimeout(() => {
            window.location.reload();
          }, 1000); // 1 seconde avant reload pour voir le snackBar
        });
    }
    this.swPush.notificationClicks.subscribe(event => {
      console.log('Notification click:', event);
      // ouvrir page spécifique
      window.open(event.action === 'explore' ? '/home' : '/', '_blank');
    });
  }
}
