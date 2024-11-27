export class MessageQueueManager {
  private queue: Array<{
    message: string;
    imageFile?: string | File;
  }> = [];
  private processing = false;

  constructor(
    private processMessage: (message: string, imageFile?: string | File) => Promise<void>,
    private updateMessageStatus: (tempId: string, status: 'sending' | 'failed' | 'success') => void,
    private onError: (error: Error) => void
  ) {}

  async add(message: string, imageFile?: string | File) {
    this.queue.push({ message, imageFile });
    if (!this.processing) {
      await this.processQueue();
    }
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const current = this.queue[0];
      try {
        await this.processMessage(current.message, current.imageFile);
      } catch (error) {
        this.onError(error instanceof Error ? error : new Error('Unknown error'));
      }
      this.queue.shift();
    }
    
    this.processing = false;
  }

  clear() {
    this.queue = [];
    this.processing = false;
  }
} 