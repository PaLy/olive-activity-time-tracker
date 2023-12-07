import { effect, signal } from "@preact/signals-react";
import localforage from "localforage";

const valueUpdaterDisposes = new Map<string, () => void>();

// When loading, activities should not be rendered.
// All stores must be imported
export const loadDB = () => {
  return Promise.all([...stores.values()].map((store) => store.load()));
};

const stores = new Map<string, SignalStore<any, any>>();

export class SignalStore<StoredValue, Value> {
  private store;
  private asValue;
  private asStoredValue;
  private name;
  private afterLoaded;
  collection = signal(new Map<string, Value>());

  constructor(args: {
    name: string;
    asValue: (storedValue: StoredValue) => Value;
    asStoredValue: (value: Value) => StoredValue;
    afterLoaded?: () => void;
  }) {
    const { name, asStoredValue, asValue, afterLoaded } = args;
    this.store = localforage.createInstance({ name });
    this.name = name;
    this.asValue = asValue;
    this.asStoredValue = asStoredValue;
    this.afterLoaded = afterLoaded;
    stores.set(name, this);
  }

  load = async () => {
    const keyValues: [string, Value][] = [];

    await this.store.iterate((storedValue: StoredValue, key) => {
      const value = this.asValue(storedValue);
      keyValues.push([key, value]);

      const dispose = effect(() =>
        this.store.setItem(key, this.asStoredValue(value)),
      );
      valueUpdaterDisposes.set(key, dispose);
    });

    this.collection.value = new Map(keyValues);
    this.afterLoaded?.();
  };

  set = (key: string, value: Value) => {
    this.collection.value = new Map([
      ...this.collection.value.entries(),
      [key, value],
    ]);

    valueUpdaterDisposes.get(key)?.();
    valueUpdaterDisposes.delete(key);

    const dispose = effect(() =>
      this.store.setItem(key, this.asStoredValue(value)).catch(() => {
        // TODO display error - activities are not saving
      }),
    );
    valueUpdaterDisposes.set(key, dispose);
  };
}
