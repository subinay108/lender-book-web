'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Sidebar, PageWrapper } from '@/components/layout/AppShell';
import { BorrowerForm } from '@/components/borrowers/BorrowerForm';
import { Card } from '@/components/ui/Card';
import { withAuth } from '@/lib/hooks/withAuth';

function NewBorrowerPage() {
  const router = useRouter();

  return (
    <>
      <Sidebar />
      <PageWrapper>
        <div className="max-w-lg mx-auto">
          <Link
            href="/borrowers"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5"
          >
            <ArrowLeft size={15} /> Back to Borrowers
          </Link>

          <h1 className="text-xl font-bold text-gray-900 mb-5">Add New Borrower</h1>

          <Card>
            <BorrowerForm
              onSuccess={(id) => router.push(`/borrowers/${id}`)}
              onCancel={() => router.back()}
            />
          </Card>
        </div>
      </PageWrapper>
    </>
  );
}

export default withAuth(NewBorrowerPage);
