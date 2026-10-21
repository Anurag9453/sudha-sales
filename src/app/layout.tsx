import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/store/cart-context';
import { CustomerAuthProvider } from '@/store/customer-auth-context';
import { publicEnv } from '@/lib/env';

export const metadata: Metadata = {
  title: `${publicEnv.storeName} | Contemporary Ethnic & Resort Wear`,
  description:
    'Fresh daily clothing collections sourced directly from artisan looms and partner warehouses. Shop Kurtis, Co-ord Sets, Festive Suit Sets, and Dresses.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans bg-[#faf9f6] text-stone-900 selection:bg-stone-900 selection:text-white">
        <CustomerAuthProvider>
          <CartProvider>{children}</CartProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
