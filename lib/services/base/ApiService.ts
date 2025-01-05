import { ErrorService } from './ErrorService';
import { DEFAULT_SESSION } from '@/lib/config/auth';

export class ApiService {
  protected static async fetch<T>(
    input: RequestInfo,
    init?: RequestInit
  ): Promise<T> {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEFAULT_SESSION.access_token}`,
        ...init?.headers,
      };

      const response = await fetch(input, {
        ...init,
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response Error:', response.status, errorText);
        
        // Handle 401 with default session
        if (response.status === 401) {
          // Retry the request once with default credentials
          return this.retryRequestWithDefaultSession<T>(input, init);
        }
        
        throw new Error(
          errorText ? JSON.parse(errorText).error : `HTTP error! status: ${response.status}`
        );
      }

      const contentType = response.headers.get('content-type');
      return contentType?.includes('application/json') 
        ? response.json() 
        : response.text() as T;
    } catch (error) {
      console.error('ApiService Error:', error);
      throw ErrorService.handleApiError(error);
    }
  }

  protected static async retryRequestWithDefaultSession<T>(
    input: RequestInfo,
    init?: RequestInit
  ): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEFAULT_SESSION.access_token}`,
      ...init?.headers,
    };

    const response = await fetch(input, {
      ...init,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to authenticate with default session');
    }

    const contentType = response.headers.get('content-type');
    return contentType?.includes('application/json') 
      ? response.json() 
      : response.text() as T;
  }

  protected static async post<T>(url: string, data?: any): Promise<T> {
    return this.fetch<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  protected static async get<T>(url: string): Promise<T> {
    return this.fetch<T>(url, {
      method: 'GET',
    });
  }
  
  protected static async put<T>(url: string, data?: any): Promise<T> {
    return this.fetch<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  protected static async delete(url: string): Promise<void> {
    await this.fetch(url, {
      method: 'DELETE',
    });
  }

  protected static async refreshSession(): Promise<void> {
    await this.post('/api/auth/refresh');
  }
}
