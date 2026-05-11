import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NextcloudStore } from '../../core/state/nextcloud.store';

@Component({
  selector: 'app-nextcloud',
  standalone: true,
  imports: [],
  templateUrl: './nextcloud.component.html',
  styleUrl:    './nextcloud.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NextcloudComponent {
  protected readonly store = inject(NextcloudStore);
}
