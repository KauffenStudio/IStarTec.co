import type {Metadata} from 'next';

export const metadata: Metadata = {
  title: 'Jetwash24',
  description: 'Jetwash24 — car wash booking in Guia, Portugal',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return children;
}
