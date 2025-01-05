export const routes = {
  home: '/',
  chat: {
    index: '/chat',
    id: (id: string) => `/chat/${id}`,
    new: '/chat/new'
  },
  settings: '/settings',
  models: '/models',
  profile: '/profile'
} as const

export type AppRoutes = typeof routes 