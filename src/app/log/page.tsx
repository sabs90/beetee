'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { SleepForm } from '@/components/SleepForm';

function LogContent() {
  const searchParams = useSearchParams();
  const editDate = searchParams.get('date') || undefined;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-text">
        {editDate ? 'Edit Entry' : "Tonight's Sleep"}
      </h1>
      <SleepForm editDate={editDate} />
    </div>
  );
}

export default function LogPage() {
  return (
    <Suspense>
      <LogContent />
    </Suspense>
  );
}
