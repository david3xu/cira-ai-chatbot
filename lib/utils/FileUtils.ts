export class FileUtils {
  static generateUploadPath(file: File): string {
    const timestamp = Date.now();
    return `uploads/${timestamp}-${file.name}`;
  }

  static createProgressTracker(
    onProgress?: (progress: number) => void
  ): { start: () => void; complete: () => void } {
    return {
      start: () => {
        if (!onProgress) return;
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          if (progress <= 90) onProgress(progress);
        }, 100);
        return interval;
      },
      complete: () => onProgress?.(100)
    };
  }
} 