import { Signal, signal } from "@preact/signals-react";
import localforage from "localforage";
import { produce } from "immer";
import { JTDSchemaType } from "ajv/dist/jtd";

export abstract class Store<
  StoredValue,
  Value = StoredValue,
  ExportedValue = StoredValue,
> {
  private store;
  collection = signal(new Map<string, Signal<Value>>());
  name;

  constructor(args: { name: string }) {
    const { name } = args;
    this.store = localforage.createInstance({ name });
    this.name = name;
  }

  abstract asValue: (storedValue: StoredValue) => Value;
  abstract asStoredValue: (value: Value) => StoredValue;
  abstract asExportedValue: (value: StoredValue) => ExportedValue | null;
  abstract fromExportedValue: (
    value: ExportedValue,
  ) => [key: string, StoredValue];
  abstract valueJsonSchema: JTDSchemaType<ExportedValue[]>;

  afterLoaded = async () => {};

  load = async () => {
    const keyValues: [string, Signal<Value>][] = [];

    // TODO error handling
    await this.store.iterate((storedValue: StoredValue, key) => {
      keyValues.push([key, signal(this.asValue(storedValue))]);
    });
    this.collection.value = new Map(keyValues);
    await this.afterLoaded?.();
  };

  set = async (key: string, value: Value) => {
    await this.store.setItem(key, this.asStoredValue(value));
    this.collection.value = new Map([
      ...this.collection.value.entries(),
      [key, signal(value)],
    ]);
    return value;
  };

  get = async (key: string) => {
    try {
      const storedValue: StoredValue | null = await this.store.getItem(key);
      return storedValue ? this.asValue(storedValue) : null;
    } catch (error) {
      throw new Error(`Failed to get item: ${error}`);
    }
  };

  remove = async (key: string) => {
    await this.store.removeItem(key);
    this.collection.value = produce(this.collection.value, (draft) => {
      draft.delete(key);
    });
  };

  clear = async () => {
    await this.store.clear();
    this.collection.value = new Map();
    await this.afterLoaded?.();
  };

  export = async () => {
    const result: ExportedValue[] = [];

    // TODO error handling
    await this.store.iterate((storedValue: StoredValue, key) => {
      const exportedValue = this.asExportedValue(storedValue);
      if (exportedValue) {
        result.push(exportedValue);
      }
    });

    return result;
  };

  import = async (data: ExportedValue[]) => {
    await Promise.all(
      data.map((value) => this.store.setItem(...this.fromExportedValue(value))),
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
