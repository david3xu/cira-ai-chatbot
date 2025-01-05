import { PageLayout } from '@/components/layouts/PageLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { NotFoundContent } from '@/components/shared/NotFoundContent'

export default function NotFound() {
  return (
    <PageLayout>
      <PageHeader 
        title="Not Found" 
        description="The requested chat could not be found"
      />
      <NotFoundContent />
    </PageLayout>
  )
}