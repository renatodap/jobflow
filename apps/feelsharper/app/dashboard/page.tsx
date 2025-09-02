import type { Metadata } from 'next';
import Dashboard from '@/components/dashboard/Dashboard';

export const metadata: Metadata = {
  title: 'Dashboard | Feel Sharper',
  description: 'Track your fitness progress with clean, focused tools.',
};

export default function DashboardPage() {
  return <Dashboard />;
}
