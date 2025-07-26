import { useEffect, useRef } from "react";
import { androidNotificationService } from "../features/android/AndroidNotificationService";
import { useLiveQuery } from "dexie-react-hooks";
import { getInProgressActivitiesNotificationData } from "../db/queries/inProgressActivitiesNotificationData";

/**
 * Hook to manage Android notifications for in-progress activities
 */
export function useInProgressActivitiesNotifications() {
  const updateIntervalMs = 30_000;
  const isInitialized = useRef(false);

  const activities = useLiveQuery(getInProgressActivitiesNotificationData);

  // Initialize notification service
  useEffect(() => {
    if (isInitialized.current) return;

    const initializeNotifications = async () => {
      try {
        // Request permission if needed
        const hasPermission = androidNotificationService.hasPermission();
        if (!hasPermission) {
          const granted = await androidNotificationService.requestPermission();
          if (!granted) {
            console.warn("Notification permission denied");
            return;
          }
        }

        // Start auto-update
        androidNotificationService.startAutoUpdate(updateIntervalMs);
        isInitialized.current = true;
      } catch (error) {
        console.error("Failed to initialize notifications:", error);
      }
    };

    initializeNotifications();

    // Cleanup on unmount
    return () => {
      if (isInitialized.current) {
        androidNotificationService.stopAutoUpdate();
        isInitialized.current = false;
      }
    };
  }, [updateIntervalMs]);

  // Update notifications when activities change
  useEffect(() => {
    if (!isInitialized.current || !activities) return;

    const updateNotifications = async () => {
      try {
        await androidNotificationService.updateNotification(activities);
      } catch (error) {
        console.error("Failed to update notifications:", error);
      }
    };

    updateNotifications();
  }, [activities]);
}
