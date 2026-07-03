import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login — LTE Cruise AIS',
  description: 'Sistem Informasi Akademik LTE Cruise — Leading Tourism Education',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
