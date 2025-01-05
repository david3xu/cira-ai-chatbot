export class ErrorService {
  static handleApiError(error: unknown): Error {
    if (error instanceof Response) {
      return new Error(`API Error: ${error.statusText}`);
    }
    
    if (error instanceof Error) {
      return error;
    }
    
    return new Error('Unknown error occurred');
  }

  static isNetworkError(error: unknown): boolean {
    return error instanceof TypeError && error.message === 'Failed to fetch';
  }
}
