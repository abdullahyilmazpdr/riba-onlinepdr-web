import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RİBA Anket Formu',
  robots: { index: false, follow: false },
};

export default function PublicFormLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
