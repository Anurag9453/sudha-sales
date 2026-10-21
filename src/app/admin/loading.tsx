import React from 'react';
import { LuxurySpinner } from '@/components/ui/LuxurySpinner';

export default function AdminLoading() {
  return (
    <LuxurySpinner
      title="Loading Admin Workspace..."
      subtitle="Connecting to catalog & warehouse inventory"
    />
  );
}
