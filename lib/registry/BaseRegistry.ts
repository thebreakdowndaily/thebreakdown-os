import type { IRegistry } from './types';

export class BaseRegistry<T> implements IRegistry<T> {
  private items = new Map<string, T>();

  public register(name: string, item: T): void {
    if (this.items.has(name)) {
      console.warn(`[Registry] Overwriting existing registration for: ${name}`);
    }
    this.items.set(name, item);
  }

  public get(name: string): T | undefined {
    return this.items.get(name);
  }

  public list(): string[] {
    return Array.from(this.items.keys());
  }
}
