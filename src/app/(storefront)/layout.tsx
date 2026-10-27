import React from 'react';
import { StoreHeader } from '@/components/layout/StoreHeader';
import { StoreFooter } from '@/components/layout/StoreFooter';
import { WelcomeSplashScreen } from '@/components/layout/WelcomeSplashScreen';
import { AppConstants } from '@/constants/app.constants';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={AppConstants.Storefront.LAYOUT.SHELL}>
      <WelcomeSplashScreen />
      <StoreHeader />
      <main className={AppConstants.Storefront.LAYOUT.MAIN}>{children}</main>
      <StoreFooter />
    </div>
  );
}
