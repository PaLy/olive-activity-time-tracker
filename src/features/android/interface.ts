export {};

declare global {
  interface Window {
    Android?: {
      export(json: string, filename: string): "ok" | "error";
    };
  }
}
