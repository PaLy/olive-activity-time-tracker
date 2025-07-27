export {};

declare global {
  interface Window {
    Android?: {
      export(json: string, filename: string): "ok" | "error";
      hasNotificationPermission(): boolean;
      requestNotificationPermission(): "requested" | "not_needed";
      updateNotification(activitiesJson: string): string;
      stopNotification(): string;
    };
  }
}
