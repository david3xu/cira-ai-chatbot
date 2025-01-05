'use client'

import { PageLayout } from '@/components/layouts/PageLayout'
import { PageErrorBoundary } from '@/components/shared/PageErrorBoundary'

export default function Error({ error, reset }: { 
  error: Error & { digest?: string }
  reset: () => void 
}) {
  return (
    <PageLayout>
      <PageErrorBoundary error={error} reset={reset} />
    </PageLayout>
  )
}