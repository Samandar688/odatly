import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import type { Habit, Day } from './types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissionsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3CB878',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get permissions for push notification!');
      return false;
    }
    return true;
  }
  return false;
}

const dayToWeekday = (day: Day): number => {
  const map: Record<Day, number> = {
    'Yak': 1, // Sunday
    'Du': 2,  // Monday
    'Se': 3,  // Tuesday
    'Cho': 4, // Wednesday
    'Pa': 5,  // Thursday
    'Ju': 6,  // Friday
    'Sha': 7, // Saturday
  };
  return map[day];
};

export async function scheduleHabitNotifications(habit: Habit): Promise<string[]> {
  if (!habit.active || !habit.reminderTime) return [];

  const [hourStr, minuteStr] = habit.reminderTime.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (isNaN(hour) || isNaN(minute)) return [];

  const newNotificationIds: string[] = [];

  for (const day of habit.days) {
    const weekday = dayToWeekday(day);
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Odat: ${habit.name}`,
        body: `Bugungi odatni bajarish esingizdan chiqmasin: ${habit.target}`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour,
        minute,
      },
    });
    newNotificationIds.push(id);
  }

  return newNotificationIds;
}

export async function cancelHabitNotifications(notificationIds?: string[]) {
  if (!notificationIds || notificationIds.length === 0) return;
  for (const id of notificationIds) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch (err) {
      console.error('Error cancelling notification', err);
    }
  }
}
