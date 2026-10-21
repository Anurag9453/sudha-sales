import React from 'react';
import { LuxurySpinner } from '@/components/ui/LuxurySpinner';

export default function StorefrontLoading() {
  return (
    <LuxurySpinner
      title="Opening Collection..."
      subtitle="Preparing high-resolution photos & available sizes"
    />
  );
}
