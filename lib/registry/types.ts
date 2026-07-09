export interface IRegistry<T> {
  register(name: string, item: T): void;
  get(name: string): T | undefined;
  list(): string[];
}
