export class MessageQueueManager {
  private queue: Array<{
    message: string;
    imageFile?: string | File;
    metadata?: Record<string, any>;
  }> = [];
  private processing = false;
  private abortController: AbortController | null = null;
  private storageQueue: Promise<any> = Promise.resolve();
  private loadingStateRef = { current: false };

  constructor(
    private processMessage: (message: string, imageFile?: string | File, metadata?: Record<string, any>) => Promise<void>,
    private updateMessageStatus: (tempId: string, status: 'sending' | 'failed' | 'success') => void,
    private onError: (error: Error) => void,
    private onLoadingChange?: (loading: boolean) => void
  ) {}

  // Message Queue Methods
  async add(message: string, imageFile?: string | File, metadata?: Record<string, any>) {
    this.queue.push({ message, imageFile, metadata });
    if (!this.processing) {
      await this.processQueue();
    }
  }

  private setLoading(loading: boolean) {
    this.loadingStateRef.current = loading;
    this.onLoadingChange?.(loading);
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    this.setLoading(true);
    this.abortController = new AbortController();
    
    while (this.queue.length > 0 && !this.abortController.signal.aborted) {
      const current = this.queue[0];
      try {
        await this.processMessage(current.message, current.imageFile, current.metadata);
        this.queue.shift();
      } catch (error) {
        const appError = error instanceof Error ? error : new Error('Unknown error processing message');
        this.onError(appError);
        this.queue.shift();
      }
    }
    
    this.processing = false;
    this.setLoading(false);
    this.abortController = null;
  }

  // Storage Queue Methods
  async enqueueStorage<T>(operation: () => Promise<T>): Promise<T> {
    this.setLoading(true);
    return new Promise((resolve, reject) => {
      this.storageQueue = this.storageQueue
        .then(() => operation())
        .then((result) => {
          this.setLoading(false);
          resolve(result);
        })
        .catch((error) => {
          this.setLoading(false);
          reject(error);
        });
    });
  }

  // Control Methods
  abort() {
    this.abortController?.abort();
    this.clear();
  }

  clear() {
    this.queue = [];
    this.processing = false;
    this.storageQueue = Promise.resolve();
    this.setLoading(false);
  }

  // Status Methods
  get isProcessing() {
    return this.processing;
  }

  get isLoading() {
    return this.loadingStateRef.current;
  }

  get queueLength() {
    return this.queue.length;
  }
}

// Create a singleton instance for storage operations
export const StorageQueueManager = new MessageQueueManager(
  async () => {}, // No-op for storage queue
  () => {}, // No-op for status updates
  (error: Error) => console.error('Storage Queue Error:', error),
  (loading: boolean) => console.log('Storage Queue Loading:', loading)
); 