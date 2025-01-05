import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function NotFoundContent() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Chat Not Found</h2>
        <p className="text-muted-foreground mt-2">
          The chat you're looking for doesn't exist or has been deleted.
        </p>
        <Button asChild className="mt-4">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  )
} 