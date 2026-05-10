import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fileSize', standalone: true, pure: true })
export class FileSizePipe implements PipeTransform {
  transform(bytes: number | null | undefined): string {
    if (bytes == null || bytes < 0) return '—';
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB'];
    const exp   = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, exp);
    const unit  = units[exp]!;

    return exp === 0 ? `${value} ${unit}` : `${value.toFixed(1)} ${unit}`;
  }
}
