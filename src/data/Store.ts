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
  private cache: Promise<Map<string, Value>> | undefined;

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

  afterLoaded = async (items: Map<string, Value>) => {};

  load = async (opts?: { refresh?: boolean }): Promise<Map<string, Value>> => {
    if (!this.cache || opts?.refresh) {
      this.cache = (async () => {
        const storedValues = new Map<string, StoredValue>();
        const result = new Map<string, Value>();
        try {
          await this.store.iterate((storedValue: StoredValue, key) => {
            storedValues.set(key, storedValue);
          });
          for (const [key, storedValue] of storedValues.entries()) {
            result.set(key, await this.asValue(storedValue));
          }
          await this.afterLoaded(result);
          return result;
        } catch (error) {
          this.cache = undefined;
          console.error(error);
          throw new Error(`Failed to load items.`);
        }
      })();
    }
    return this.cache;
  };

  private updateCache = async (recipe: (draft: Map<string, Value>) => void) => {
    const cache = await this.load();
    this.cache = (async () => {
      try {
        return produce(cache, recipe);
      } catch (error) {
        this.cache = undefined;
        throw error;
      }
    })();
  };

  set = async (key: string, value: Value) => {
    try {
      await this.store.setItem(key, this.asStoredValue(value));
      await this.updateCache((draft: Map<string, Value>) => {
        draft.set(key, value);
      });
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to set item.`);
    }
    return value;
  };

  get = async (key: string) => {
    const cache = await this.load();
    const cachedValue = cache.get(key);
    if (cachedValue !== undefined) {
      return cachedValue;
    } else {
      throw new Error(`Item not found: ${key}.`);
    }
  };

  remove = async (key: string) => {
    await this.store.removeItem(key);
    await this.updateCache((draft: Map<string, Value>) => {
      draft.delete(key);
    });
  };

  clear = async () => {
    await this.store.clear();
    await this.load({ refresh: true });
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
    ).catch((error) => {
      console.error(error);
      throw new Error(`Failed to import items.`);
    });
  };
}
