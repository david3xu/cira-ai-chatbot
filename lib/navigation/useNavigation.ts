import { useRouter, usePathname } from 'next/navigation'
import { routes } from '@/app/routes'

export function useNavigation() {
  const router = useRouter()
  const pathname = usePathname()

  return {
    navigate: {
      toChat: (id: string) => router.push(routes.chat.id(id)),
      toNewChat: () => router.push(routes.chat.new),
      toSettings: () => router.push(routes.settings),
      toHome: () => router.push(routes.home)
    },
    current: {
      isChat: pathname.startsWith(routes.chat.index),
      isSettings: pathname === routes.settings,
      chatId: pathname.match(/^\/chat\/(.+)$/)?.[1]
    }
  }
} 