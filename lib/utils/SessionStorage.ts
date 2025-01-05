export class SessionStorage {
  static getItem<T>(key: string): T | null {
    const item = sessionStorage.getItem(key)
    return item ? JSON.parse(item) : null
  }

  static setItem(key: string, value: any): void {
    sessionStorage.setItem(key, JSON.stringify(value))
  }
} 