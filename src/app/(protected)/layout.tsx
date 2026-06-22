import ProtectedNavigation from '@/components/ProtectedNavigation';

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-100">
      <ProtectedNavigation />
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">{children}</div>
    </div>
  );
}
