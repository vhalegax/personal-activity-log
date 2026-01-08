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
  title: 'Personal Activity Log',
  description:
    'Personal Activity Log is a personal activity and time-tracking app built with Next.js, designed to record everything you do — from learning and work to hobbies — with flexible start–stop sessions and optional project organization.',
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
