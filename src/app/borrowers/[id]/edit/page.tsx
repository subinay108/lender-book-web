'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useBorrower } from '@/lib/hooks/useBorrowers';
import { Sidebar, PageWrapper } from '@/components/layout/AppShell';
import { BorrowerForm } from '@/components/borrowers/BorrowerForm';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui';
import { withAuth } from '@/lib/hooks/withAuth';

function EditBorrowerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { borrower, loading } = useBorrower(id);

  if (loading) return <PageLoader />;
  if (!borrower) return <PageWrapper><div className="text-center py-16 text-gray-500">Borrower not found.</div></PageWrapper>;

  return (
    <>
      <Sidebar />
      <PageWrapper>
        <div className="max-w-lg mx-auto">
          <Link
            href={`/borrowers/${id}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5"
          >
            <ArrowLeft size={15} /> Back to Borrower
          </Link>
          <h1 className="text-xl font-bold text-gray-900 mb-5">Edit Borrower</h1>
          <Card>
            <BorrowerForm
              borrower={borrower}
              onSuccess={() => router.push(`/borrowers/${id}`)}
              onCancel={() => router.back()}
            />
          </Card>
        </div>
      </PageWrapper>
    </>
  );
}

export default withAuth(EditBorrowerPage);
