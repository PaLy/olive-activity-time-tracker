import localforage from "localforage";
import { JTDSchemaType } from "ajv/dist/jtd";

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
  abstract fromExportedValue: (
    value: ExportedValue,
  ) => [key: string, StoredValue];
  abstract valueJsonSchema: JTDSchemaType<ExportedValue[]>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  get = async (key: string) => {
    const cache = await this.load();
    const cachedValue = cache.get(key);
    if (cachedValue !== undefined) {
      return cachedValue;
    } else {
      throw new Error(`Item not found: ${key}.`);
    }
  };

  clear = async () => {
    await this.store.clear();
    await this.load({ refresh: true });
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
