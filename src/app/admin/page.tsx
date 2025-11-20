'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminHomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to questions page by default
    router.push('/admin/questions');
  }, [router]);

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-gray-600">Redirecting...</div>
    </div>
  );
}
