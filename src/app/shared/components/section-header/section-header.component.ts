import { ChangeDetectionStrategy, Component, EventEmitter, input, Output } from '@angular/core';

@Component({
  selector: 'app-section-header',
  standalone: true,
  template: `
    <div class="section-header">
      <h2 class="section-header__title">{{ title() }}</h2>
      @if (seeAll()) {
        <button class="section-header__link" (click)="seeAllClick.emit()">See all</button>
      }
    </div>
  `,
  styles: [`
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      margin-bottom: 12px;
    }
    .section-header__title {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      color: oklch(93% 0.01 280);
      line-height: 1.2;
    }
    .section-header__link {
      background: none;
      border: none;
      font-size: 13px;
      font-weight: 700;
      color: oklch(62% 0.015 280);
      cursor: pointer;
      padding: 4px 0;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      &:active { opacity: 0.7; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeaderComponent {
  readonly title  = input.required<string>();
  readonly seeAll = input<boolean>(false);
  @Output() readonly seeAllClick = new EventEmitter<void>();
}
