import DashboardScreen from '@/features/dashboard/DashboardScreen';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardScreen>{children}</DashboardScreen>;
}
