import localforage from "localforage";
import { JTDSchemaType } from "ajv/dist/jtd";
import { produce } from "immer";

export abstract class Store<
  StoredValue,
  Value = StoredValue,
  ExportedValue = StoredValue,
> {
  private store;
  name;
  protected cache: Map<string, Value> | undefined;

  constructor(args: { name: string }) {
    const { name } = args;
    this.store = localforage.createInstance({ name });
    this.name = name;
  }

  abstract asValue: (storedValue: StoredValue) => Promise<Value>;
  abstract asStoredValue: (value: Value) => StoredValue;
  abstract asExportedValue: (value: StoredValue) => ExportedValue | null;
  abstract fromExportedValue: (
    value: ExportedValue,
  ) => [key: string, StoredValue];
  abstract valueJsonSchema: JTDSchemaType<ExportedValue[]>;

  afterLoaded = async (
    items: Map<string, Value>,
  ): Promise<Map<string, Value>> => items;

  load = async () => {
    if (this.cache) {
      return this.cache;
    } else {
      const storedValues = new Map<string, StoredValue>();
      const result = new Map<string, Value>();
      try {
        await this.store.iterate((storedValue: StoredValue, key) => {
          storedValues.set(key, storedValue);
        });
        for (const [key, storedValue] of storedValues.entries()) {
          result.set(key, await this.asValue(storedValue));
        }
        this.cache = await this.afterLoaded?.(result);
        return this.cache;
      } catch (error) {
        console.error(error);
        throw new Error(`Failed to load items.`);
      }
    }
  };

  set = async (key: string, value: Value) => {
    try {
      await this.store.setItem(key, this.asStoredValue(value));
      if (this.cache) {
        this.cache = produce(this.cache, (draft: Map<string, Value>) => {
          draft.set(key, value);
        });
      }
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to set item.`);
    }
    return value;
  };

  get = async (key: string) => {
    const cachedValue = this.cache?.get(key);
    if (cachedValue) {
      return cachedValue;
    } else {
      try {
        const storedValue: StoredValue | null = await this.store.getItem(key);
        if (storedValue === null) throw new Error(`Item not found: ${key}.`);
        return await this.asValue(storedValue);
      } catch (error) {
        console.error(error);
        throw new Error(`Failed to get item.`);
      }
    }
  };

  remove = async (key: string) => {
    await this.store.removeItem(key);
    this.cache = produce(this.cache!, (draft: Map<string, Value>) => {
      draft.delete(key);
    });
  };

  clear = async () => {
    await this.store.clear();
    this.cache = undefined;
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
  };
}
