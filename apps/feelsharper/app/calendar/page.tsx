import type { Metadata } from 'next';
import CalendarView from '@/components/calendar/CalendarView';

export const metadata: Metadata = {
  title: 'Calendar — Feel Sharper',
  description: 'Plan workouts, track meals, and visualize your fitness progress',
};

export default function CalendarPage() {
  return <CalendarView />;
}
