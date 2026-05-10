import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'timeAgo', standalone: true, pure: true })
export class TimeAgoPipe implements PipeTransform {
  transform(timestamp: number | null | undefined): string {
    if (timestamp == null) return '—';

    const diffMs  = Date.now() - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr  = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60)  return 'Just now';
    if (diffMin < 60)  return `${diffMin}m ago`;
    if (diffHr < 24)   return `${diffHr}h ago`;
    if (diffDay < 7)   return `${diffDay}d ago`;
    if (diffDay < 30)  return `${Math.floor(diffDay / 7)}w ago`;
    if (diffDay < 365) return `${Math.floor(diffDay / 30)}mo ago`;
    return `${Math.floor(diffDay / 365)}y ago`;
  }
}
