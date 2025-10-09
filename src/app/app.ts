import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
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

  constructor(private swUpdate: SwUpdate, private snackBar: MatSnackBar) {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          const ref = this.snackBar.open(
            'Une nouvelle version du site est disponible.',
            'Mettre à jour',
            { duration: 10000 }
          );

          ref.onAction().subscribe(() => {
            window.location.reload();
          });
        });
    }
  }
}
