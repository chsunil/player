import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'duration', standalone: true, pure: true })
export class DurationPipe implements PipeTransform {
  transform(ms: number | null | undefined): string {
    if (ms == null || !isFinite(ms) || ms < 0) return '0:00';

    const totalSeconds = Math.floor(ms / 1000);
    const hours        = Math.floor(totalSeconds / 3600);
    const minutes      = Math.floor((totalSeconds % 3600) / 60);
    const seconds      = totalSeconds % 60;

    const paddedSec = String(seconds).padStart(2, '0');
    const paddedMin = hours > 0 ? String(minutes).padStart(2, '0') : String(minutes);

    return hours > 0 ? `${hours}:${paddedMin}:${paddedSec}` : `${paddedMin}:${paddedSec}`;
  }
}
