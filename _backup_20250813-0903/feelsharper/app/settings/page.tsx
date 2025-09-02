import type { Metadata } from 'next';
import ProfileManager from '@/components/profile/ProfileManager';

export const metadata: Metadata = {
  title: 'Settings — Feel Sharper',
  description: 'Manage your profile, goals, and app preferences',
};

export default function SettingsPage() {
  return <ProfileManager />;
}
