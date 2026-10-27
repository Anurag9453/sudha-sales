import React from 'react';
import { StoreHeader } from '@/components/layout/StoreHeader';
import { StoreFooter } from '@/components/layout/StoreFooter';
import { WelcomeSplashScreen } from '@/components/layout/WelcomeSplashScreen';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-clip flex flex-col">
      <WelcomeSplashScreen />
      <StoreHeader />
      <main className="flex-1 w-full min-w-0">{children}</main>
      <StoreFooter />
    </div>
  );
}
