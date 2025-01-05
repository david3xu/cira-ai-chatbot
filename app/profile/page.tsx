import { PageHeader } from '@/components/shared/PageHeader'
import { ProfileSettings } from '@/components/chat/profile/ProfileSettings'

export default function ProfilePage() {
  return (
    <>
      <PageHeader 
        title="Profile Settings" 
        description="Manage your account preferences"
      />
      <div className="container mx-auto py-6">
        <ProfileSettings />
      </div>
    </>
  )
} 