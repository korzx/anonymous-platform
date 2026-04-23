// app/layout.tsx - Root layout with minimal styling

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'What is something you feel but cannot tell anyone?',
  description: 'A safe space for anonymous emotional expression',
  robots: 'noindex, nofollow', // Privacy: don't index
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🌙</text></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="referrer" content="no-referrer" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
