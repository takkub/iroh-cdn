import '../styles/globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'ระบบจัดเก็บและแชร์ไฟล์',
  description: 'ระบบอัปโหลด จัดเก็บ และแชร์ไฟล์ออนไลน์',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
