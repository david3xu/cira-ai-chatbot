import { useEffect, useRef } from "react";

import { useCallback } from "react";

// Types for different kinds of resources we need to manage
type ResourceType = 'message' | 'stream' | 'file' | 'websocket';

interface ManagedResource {
  id: string;
  type: ResourceType;
  createdAt: number;
  lastAccessed: number;
  size: number;
  cleanup: () => Promise<void>;
}

export class MemoryManager {
  // Configuration constants
  private static readonly MEMORY_LIMIT = 50 * 1024 * 1024; // 50MB
  private static readonly RESOURCE_TTL = 30 * 60 * 1000;   // 30 minutes
  private static readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

  // Resource tracking
  private static resources = new Map<string, ManagedResource>();
  private static currentMemoryUsage = 0;

  // Memory usage monitoring
  private static async checkMemoryUsage(): Promise<void> {
    if (this.currentMemoryUsage > this.MEMORY_LIMIT) {
      await this.performEmergencyCleanup();
    }
  }

  // Resource registration
  static async registerResource(
    type: ResourceType,
    size: number,
    cleanup: () => Promise<void>
  ): Promise<string> {
    const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const resource: ManagedResource = {
      id,
      type,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      size,
      cleanup
    };

    this.resources.set(id, resource);
    this.currentMemoryUsage += size;

    await this.checkMemoryUsage();
    return id;
  }

  // Resource access tracking
  static async accessResource(id: string): Promise<void> {
    const resource = this.resources.get(id);
    if (resource) {
      resource.lastAccessed = Date.now();
      this.resources.set(id, resource);
    }
  }

  // Cleanup strategies
  private static async performEmergencyCleanup(): Promise<void> {
    const now = Date.now();
    const resourcesArray = Array.from(this.resources.values());

    // Sort resources by last accessed time
    resourcesArray.sort((a, b) => a.lastAccessed - b.lastAccessed);

    // Clean up old resources until we're under memory limit
    for (const resource of resourcesArray) {
      if (this.currentMemoryUsage <= this.MEMORY_LIMIT) break;

      try {
        await this.cleanupResource(resource.id);
      } catch (error) {
        console.error(`Failed to cleanup resource ${resource.id}:`, error);
      }
    }
  }

  private static async cleanupResource(id: string): Promise<void> {
    const resource = this.resources.get(id);
    if (!resource) return;

    try {
      await resource.cleanup();
      this.currentMemoryUsage -= resource.size;
      this.resources.delete(id);
    } catch (error) {
      console.error(`Error cleaning up resource ${id}:`, error);
      throw error;
    }
  }

  // Periodic cleanup
  static startPeriodicCleanup(): NodeJS.Timer {
    return setInterval(async () => {
      const now = Date.now();
      const expiredResources = Array.from(this.resources.values())
        .filter(resource => now - resource.lastAccessed > this.RESOURCE_TTL);

      for (const resource of expiredResources) {
        await this.cleanupResource(resource.id);
      }
    }, this.CLEANUP_INTERVAL);
  }

  // Add this new public method
  static async cleanup(id: string): Promise<void> {
    return this.cleanupResource(id);
  }
}

// Hook for component-level memory management
export const useMemoryManagement = () => {
  const resourceIds = useRef<Set<string>>(new Set());

  // Register a new resource
  const registerResource = useCallback(async (
    type: ResourceType,
    size: number,
    cleanup: () => Promise<void>
  ) => {
    const id = await MemoryManager.registerResource(type, size, cleanup);
    resourceIds.current.add(id);
    return id;
  }, []);

  // Access a resource
  const accessResource = useCallback(async (id: string) => {
    if (resourceIds.current.has(id)) {
      await MemoryManager.accessResource(id);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resourceIds.current.forEach(async (id) => {
        try {
          await MemoryManager.cleanup(id);
        } catch (error) {
          console.error(`Failed to cleanup resource ${id} on unmount:`, error);
        }
      });
      resourceIds.current.clear();
    };
  }, []);

  return {
    registerResource,
    accessResource
  };
};

// Example usage in a chat component
export const ChatComponent: React.FC = () => {
  const { registerResource, accessResource } = useMemoryManagement();

  // Example: Managing message history
  useEffect(() => {
    const messageHistory: string[] = [];
    let resourceId: string;

    const initialize = async () => {
      resourceId = await registerResource('message', 0, async () => {
        messageHistory.length = 0; // Clear history on cleanup
      });
    };

    initialize();

    // Access the resource when messages are added
    const addMessage = async (message: string) => {
      messageHistory.push(message);
      if (resourceId) {
        await accessResource(resourceId);
      }
    };

    return () => {
      // Cleanup will be handled by useMemoryManagement
    };
  }, [registerResource, accessResource]);

  return null;
}; 