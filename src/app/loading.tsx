import React from 'react';
import { LuxurySpinner } from '@/components/ui/LuxurySpinner';

export default function RootLoading() {
  return (
    <LuxurySpinner
      title="Loading Sudha Sales..."
      subtitle="Fetching the latest collection & styles"
    />
  );
}
