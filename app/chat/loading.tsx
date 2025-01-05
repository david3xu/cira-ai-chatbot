import { PageLayout } from '@/components/layouts/PageLayout'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function Loading() {
  return (
    <PageLayout>
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    </PageLayout>
  )
} 