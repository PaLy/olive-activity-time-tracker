import localforage from "localforage";
import { JTDSchemaType } from "ajv/dist/jtd";

export abstract class Store<
  StoredValue,
  Value = StoredValue,
  ExportedValue = StoredValue,
> {
  private store;
  name;

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
    const storedValues = new Map<string, StoredValue>();
    const result = new Map<string, Value>();
    try {
      await this.store.iterate((storedValue: StoredValue, key) => {
        storedValues.set(key, storedValue);
      });
      for (const [key, storedValue] of storedValues.entries()) {
        result.set(key, await this.asValue(storedValue));
      }
      return this.afterLoaded?.(result);
    } catch (error) {
      throw new Error(`Failed to load items: ${error}`);
    }
  };

  set = async (key: string, value: Value) => {
    try {
      await this.store.setItem(key, this.asStoredValue(value));
    } catch (error) {
      throw new Error(`Failed to set item: ${error}`);
    }
    return value;
  };

  get = async (key: string) => {
    try {
      const storedValue: StoredValue | null = await this.store.getItem(key);
      if (storedValue === null) throw new Error(`Item not found: ${key}`);
      return await this.asValue(storedValue);
    } catch (error) {
      throw new Error(`Failed to get item: ${error}`);
    }
  };

  remove = async (key: string) => {
    await this.store.removeItem(key);
  };

  clear = async () => {
    await this.store.clear();
    await this.afterLoaded?.(await this.load());
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
