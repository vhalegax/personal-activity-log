import '../assets/styles/globals.css';
import Providers from '@/components/Providers';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth';
import type { Metadata } from 'next';
import localFont from 'next/font/local';

const geistSans = localFont({
  src: '../assets/fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: '../assets/fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Daily Worklog - Task Management',
  description: 'A modern task management app with Supabase and TailwindCSS',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
