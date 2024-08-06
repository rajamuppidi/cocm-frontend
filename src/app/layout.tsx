import ClientRootLayout from '@/components/controls/clientrootlayout';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="w-full h-full">
        <ClientRootLayout>{children}</ClientRootLayout>
      </body>
    </html>
  );
}
