import { computed, Injectable, signal } from '@angular/core';
import type { QueueItem } from '../models/queue.model';

@Injectable({ providedIn: 'root' })
export class QueueStore {
  private readonly _items        = signal<readonly QueueItem[]>([]);
  private readonly _currentIndex = signal<number>(-1);

  readonly items        = this._items.asReadonly();
  readonly currentIndex = this._currentIndex.asReadonly();

  readonly count       = computed(() => this._items().length);
  readonly isEmpty     = computed(() => this._items().length === 0);
  readonly currentItem = computed<QueueItem | null>(() => {
    const idx = this._currentIndex();
    const items = this._items();
    return idx >= 0 && idx < items.length ? (items[idx] ?? null) : null;
  });
  readonly hasNext     = computed(() => this._currentIndex() < this._items().length - 1);
  readonly hasPrev     = computed(() => this._currentIndex() > 0);
  readonly upNext      = computed(() => {
    const items = this._items();
    const idx = this._currentIndex();
    return items.slice(idx + 1);
  });
  readonly history     = computed(() => {
    const items = this._items();
    const idx = this._currentIndex();
    return idx > 0 ? items.slice(0, idx) : [];
  });

  setQueue(items: readonly QueueItem[], startIndex = 0): void {
    this._items.set([...items]);
    this._currentIndex.set(
      items.length > 0 ? Math.max(0, Math.min(startIndex, items.length - 1)) : -1,
    );
  }

  setIndex(index: number): void {
    const len = this._items().length;
    if (index >= 0 && index < len) {
      this._currentIndex.set(index);
    }
  }

  advance(): number {
    const next = this._currentIndex() + 1;
    if (next < this._items().length) {
      this._currentIndex.set(next);
    }
    return this._currentIndex();
  }

  retreat(): number {
    const prev = this._currentIndex() - 1;
    if (prev >= 0) {
      this._currentIndex.set(prev);
    }
    return this._currentIndex();
  }

  addNext(item: QueueItem): void {
    this._items.update(items => {
      const arr = [...items];
      arr.splice(this._currentIndex() + 1, 0, item);
      return arr;
    });
  }

  addToEnd(item: QueueItem): void {
    this._items.update(items => [...items, item]);
  }

  addManyToEnd(newItems: readonly QueueItem[]): void {
    this._items.update(items => [...items, ...newItems]);
  }

  remove(position: number): void {
    this._items.update(items => items.filter((_, i) => i !== position));
    const current = this._currentIndex();
    if (position < current) {
      this._currentIndex.set(current - 1);
    } else if (position === current) {
      this._currentIndex.set(Math.min(current, this._items().length - 1));
    }
  }

  reorder(from: number, to: number): void {
    this._items.update(items => {
      const arr = [...items];
      const [moved] = arr.splice(from, 1);
      if (moved) arr.splice(to, 0, moved);
      return arr;
    });
    const current = this._currentIndex();
    if (from === current) {
      this._currentIndex.set(to);
    } else if (from < current && to >= current) {
      this._currentIndex.set(current - 1);
    } else if (from > current && to <= current) {
      this._currentIndex.set(current + 1);
    }
  }

  clear(): void {
    this._items.set([]);
    this._currentIndex.set(-1);
  }
}
