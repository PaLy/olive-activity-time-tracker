// Android notification service for activity tracking

import { InProgressActivitiesNotificationData } from "../../db/queries/inProgressActivitiesNotificationData";
import { humanize } from "../../utils/duration";

export class AndroidNotificationService {
  private static instance: AndroidNotificationService;
  private updateInterval: number | null = null;
  private activitiesData?: InProgressActivitiesNotificationData;

  static getInstance(): AndroidNotificationService {
    if (!AndroidNotificationService.instance) {
      AndroidNotificationService.instance = new AndroidNotificationService();
    }
    return AndroidNotificationService.instance;
  }

  /**
   * Check if notification permission is granted
   */
  hasPermission(): boolean {
    if (!window.Android) return false;
    try {
      return window.Android.hasNotificationPermission();
    } catch (error) {
      console.error("Error checking notification permission:", error);
      return false;
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    if (!window.Android) return false;

    try {
      const result = window.Android.requestNotificationPermission();

      if (result === "not_needed") {
        return true;
      }

      if (result === "requested") {
        // Wait for permission result event
        return new Promise((resolve) => {
          const handler = (event: CustomEvent) => {
            window.removeEventListener(
              "notificationPermissionResult",
              handler as EventListener,
            );
            resolve(event.detail === "granted");
          };
          window.addEventListener(
            "notificationPermissionResult",
            handler as EventListener,
          );
        });
      }

      return false;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  /**
   * Update notification with current in-progress activities
   */
  async updateNotification(
    activitiesData: InProgressActivitiesNotificationData,
  ): Promise<boolean> {
    if (!window.Android) return false;

    this.activitiesData = activitiesData;

    if (activitiesData.length === 0) {
      this.stopNotification();
      return true;
    }

    try {
      if (!this.hasPermission()) {
        const granted = await this.requestPermission();
        if (!granted) {
          console.warn("Notification permission not granted");
          return false;
        }
      }

      const now = Date.now();

      const activities = activitiesData.map((activity) => ({
        fullName: activity.fullName,
        duration: humanize(now - activity.start, false),
      }));

      const activitiesJson = JSON.stringify(activities);
      const result = window.Android.updateNotification(activitiesJson);

      return result === "success";
    } catch (error) {
      console.error("Error updating notification:", error);
      return false;
    }
  }

  /**
   * Stop the notification service
   */
  stopNotification(): boolean {
    if (!window.Android) return false;

    try {
      const result = window.Android.stopNotification();
      return result === "success";
    } catch (error) {
      console.error("Error stopping notification:", error);
      return false;
    }
  }

  /**
   * Start automatic notification updates
   */
  startAutoUpdate(intervalMs: number): void {
    if (this.updateInterval) {
      this.stopAutoUpdate();
    }

    this.updateInterval = window.setInterval(() => {
      this.updateFromCurrentActivities();
    }, intervalMs);

    // Update immediately
    this.updateFromCurrentActivities();
  }

  /**
   * Stop automatic notification updates
   */
  stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.stopNotification();
  }

  /**
   * Update notification based on current in-progress activities
   */
  private async updateFromCurrentActivities(): Promise<void> {
    try {
      if (this.activitiesData) {
        await this.updateNotification(this.activitiesData);
      }
    } catch (error) {
      console.error("Error updating from current activities:", error);
    }
  }
}

// Export singleton instance
export const androidNotificationService =
  AndroidNotificationService.getInstance();
