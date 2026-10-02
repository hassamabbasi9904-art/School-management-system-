import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'EduCore Enterprise - School Management System & ERP',
  description: 'Comprehensive enterprise-grade School ERP with multi-campus support, student lifecycle management, fee automation, day book financial ledger, cash flow, exams, and RBAC.',
  openGraph: {
    title: 'EduCore Enterprise - School Management System & ERP',
    description: 'Comprehensive enterprise-grade School ERP with multi-campus support, student lifecycle management, fee automation, day book financial ledger, cash flow, exams, and RBAC.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EduCore Enterprise - School Management System & ERP',
    description: 'Comprehensive enterprise-grade School ERP with multi-campus support, student lifecycle management, fee automation, day book financial ledger, cash flow, exams, and RBAC.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
