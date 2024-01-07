import { effect, Signal, signal } from "@preact/signals-react";
import localforage from "localforage";
import { produce } from "immer";

export abstract class SignalStore<StoredValue, Value> {
  private store;
  private valueUpdaterDisposes = new Map<string, () => void>();
  collection = signal(new Map<string, Signal<Value>>());
  name;

  constructor(args: { name: string }) {
    const { name } = args;
    this.store = localforage.createInstance({ name });
    this.name = name;
  }

  abstract asValue: (storedValue: StoredValue) => Value;
  abstract asStoredValue: (value: Value) => StoredValue;
  abstract valueJsonSchema: unknown;

  asExportedValue = (value: StoredValue): StoredValue | null => value;
  afterLoaded = () => {};

  load = async () => {
    const keyValues: [string, Signal<Value>][] = [];

    // TODO error handling
    await this.store.iterate((storedValue: StoredValue, key) => {
      const value = this.asValue(storedValue);
      keyValues.push([key, signal(value)]);
    });

    return () => {
      this.collection.value = new Map(keyValues);
      keyValues.forEach(([key, value]) => {
        const dispose = effect(() =>
          this.store.setItem(key, this.asStoredValue(value.value)),
        );
        this.valueUpdaterDisposes.set(key, dispose);
      });
      this.afterLoaded?.();
    };
  };

  set = (key: string, value: Value) => {
    this.collection.value = new Map([
      ...this.collection.value.entries(),
      [key, signal(value)],
    ]);

    this.valueUpdaterDisposes.get(key)?.();
    this.valueUpdaterDisposes.delete(key);

    const updaterDispose = effect(() =>
      this.store.setItem(key, this.asStoredValue(value)).catch(() => {
        // TODO display error - activities are not saving,...
      }),
    );
    this.valueUpdaterDisposes.set(key, updaterDispose);
  };

  remove = (key: string) => {
    this.collection.value = produce(this.collection.value, (draft) => {
      draft.delete(key);
    });
    this.valueUpdaterDisposes.get(key)?.();
    this.valueUpdaterDisposes.delete(key);
  };

  clear = async () => {
    try {
      await this.store.clear();
    } catch (error) {
      // TODO
    }
    return () => {
      this.collection.value = new Map();
      this.valueUpdaterDisposes.forEach((dispose) => dispose());
      this.valueUpdaterDisposes.clear();
      this.afterLoaded?.();
    };
  };

  export = async () => {
    const result: {
      storeName: string;
      data: { key: string; value: StoredValue }[];
    } = { storeName: this.name, data: [] };

    // TODO error handling
    await this.store.iterate((storedValue: StoredValue, key) => {
      const exportedValue = this.asExportedValue(storedValue);
      if (exportedValue) {
        result.data.push({ key, value: exportedValue });
      }
    });

    return result;
  };

  import = async (data: { key: string; value: StoredValue }[]) => {
    await Promise.all(
      data.map(({ key, value }) => this.store.setItem(key, value)),
    ).catch(() => {
      // TODO clean so far imported?
    });
    return this.load();
  };

  jsonSchema = () => ({
    type: "object",
    properties: {
      storeName: { type: "string", pattern: `^${this.name}$` },
      data: { type: "array", items: this.valueJsonSchema },
    },
    required: ["storeName", "data"],
  });
}
