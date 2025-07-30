/**
 * Resource Management Service
 * Handles cleanup of blob URLs, memory management, and resource lifecycle
 */

interface ManagedResource {
  id: string;
  type: 'blob_url' | 'audio_context' | 'canvas' | 'video_element' | 'worker' | 'ffmpeg_instance';
  resource: any;
  createdAt: Date;
  lastAccessed: Date;
  size?: number;
  metadata?: Record<string, any>;
}

interface ResourceStats {
  totalResources: number;
  totalMemoryUsage: number;
  resourcesByType: Record<string, number>;
  oldestResource: Date | null;
  memoryPressure: 'low' | 'medium' | 'high';
}

class ResourceManagementService {
  private resources: Map<string, ManagedResource> = new Map();
  private memoryThreshold = 100 * 1024 * 1024; // 100MB threshold
  private maxAge = 30 * 60 * 1000; // 30 minutes max age
  private cleanupInterval: NodeJS.Timeout | null = null;
  private memoryWarningThreshold = 80 * 1024 * 1024; // 80MB warning

  constructor() {
    this.startCleanupInterval();
    this.setupMemoryMonitoring();
  }

  /**
   * Register a new resource for management
   */
  registerResource(
    type: ManagedResource['type'], 
    resource: any, 
    metadata?: Record<string, any>
  ): string {
    const id = this.generateResourceId();
    const size = this.estimateResourceSize(resource, type);
    
    const managedResource: ManagedResource = {
      id,
      type,
      resource,
      createdAt: new Date(),
      lastAccessed: new Date(),
      size,
      metadata
    };

    this.resources.set(id, managedResource);
    
    console.log(`📦 Resource registered: ${type} (${id}) - ${this.formatBytes(size || 0)}`);
    
    // Check if we're approaching memory limits
    this.checkMemoryPressure();
    
    return id;
  }

  /**
   * Access a resource and update last accessed time
   */
  accessResource(id: string): any {
    const resource = this.resources.get(id);
    if (resource) {
      resource.lastAccessed = new Date();
      return resource.resource;
    }
    return null;
  }

  /**
   * Manually cleanup a specific resource
   */
  cleanupResource(id: string): boolean {
    const resource = this.resources.get(id);
    if (!resource) return false;

    this.performCleanup(resource);
    this.resources.delete(id);
    
    console.log(`🧹 Resource cleaned up: ${resource.type} (${id})`);
    return true;
  }

  /**
   * Cleanup resources by type
   */
  cleanupResourcesByType(type: ManagedResource['type']): number {
    let cleaned = 0;
    for (const [id, resource] of this.resources) {
      if (resource.type === type) {
        this.performCleanup(resource);
        this.resources.delete(id);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} resources of type: ${type}`);
    }
    
    return cleaned;
  }

  /**
   * Cleanup all resources
   */
  cleanupAll(): number {
    const totalResources = this.resources.size;
    
    for (const resource of this.resources.values()) {
      this.performCleanup(resource);
    }
    
    this.resources.clear();
    
    if (totalResources > 0) {
      console.log(`🧹 Cleaned up all ${totalResources} resources`);
    }
    
    return totalResources;
  }

  /**
   * Cleanup old resources based on age
   */
  cleanupOldResources(): number {
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - this.maxAge);
    let cleaned = 0;

    for (const [id, resource] of this.resources) {
      if (resource.lastAccessed < cutoffTime) {
        this.performCleanup(resource);
        this.resources.delete(id);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} old resources`);
    }

    return cleaned;
  }

  /**
   * Perform type-specific cleanup
   */
  private performCleanup(resource: ManagedResource): void {
    try {
      switch (resource.type) {
        case 'blob_url':
          if (typeof resource.resource === 'string' && resource.resource.startsWith('blob:')) {
            URL.revokeObjectURL(resource.resource);
          }
          break;

        case 'audio_context':
          if (resource.resource && typeof resource.resource.close === 'function') {
            resource.resource.close();
          }
          break;

        case 'canvas':
          if (resource.resource && resource.resource.getContext) {
            const ctx = resource.resource.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, resource.resource.width, resource.resource.height);
            }
          }
          break;

        case 'video_element':
          if (resource.resource) {
            resource.resource.pause();
            resource.resource.src = '';
            resource.resource.load();
          }
          break;

        case 'worker':
          if (resource.resource && typeof resource.resource.terminate === 'function') {
            resource.resource.terminate();
          }
          break;

        case 'ffmpeg_instance':
          if (resource.resource && typeof resource.resource.cleanup === 'function') {
            resource.resource.cleanup();
          }
          break;
      }
    } catch (error) {
      console.error(`Error cleaning up resource ${resource.id}:`, error);
    }
  }

  /**
   * Estimate resource memory usage
   */
  private estimateResourceSize(resource: any, type: ManagedResource['type']): number {
    try {
      switch (type) {
        case 'blob_url':
          // We can't directly measure blob size, so estimate based on usage
          return 1024 * 1024; // 1MB estimate

        case 'canvas':
          if (resource && resource.width && resource.height) {
            return resource.width * resource.height * 4; // 4 bytes per pixel (RGBA)
          }
          return 1024 * 1024; // 1MB estimate

        case 'audio_context':
          return 512 * 1024; // 512KB estimate

        case 'video_element':
          return 5 * 1024 * 1024; // 5MB estimate

        case 'worker':
          return 256 * 1024; // 256KB estimate

        case 'ffmpeg_instance':
          return 50 * 1024 * 1024; // 50MB estimate

        default:
          return 1024; // 1KB default
      }
    } catch (error) {
      return 1024; // 1KB fallback
    }
  }

  /**
   * Check memory pressure and trigger cleanup if needed
   */
  private checkMemoryPressure(): void {
    const stats = this.getResourceStats();
    
    if (stats.memoryPressure === 'high') {
      console.warn('🚨 High memory pressure detected, cleaning up old resources');
      this.cleanupOldResources();
      
      // If still high pressure, cleanup by type (starting with largest)
      const currentStats = this.getResourceStats();
      if (currentStats.memoryPressure === 'high') {
        this.cleanupResourcesByType('ffmpeg_instance');
        this.cleanupResourcesByType('video_element');
        this.cleanupResourcesByType('canvas');
      }
    } else if (stats.memoryPressure === 'medium') {
      console.warn('⚠️ Medium memory pressure, cleaning up old resources');
      this.cleanupOldResources();
    }
  }

  /**
   * Get resource statistics
   */
  getResourceStats(): ResourceStats {
    const resourcesByType: Record<string, number> = {};
    let totalMemoryUsage = 0;
    let oldestResource: Date | null = null;

    for (const resource of this.resources.values()) {
      resourcesByType[resource.type] = (resourcesByType[resource.type] || 0) + 1;
      totalMemoryUsage += resource.size || 0;
      
      if (!oldestResource || resource.createdAt < oldestResource) {
        oldestResource = resource.createdAt;
      }
    }

    const memoryPressure: 'low' | 'medium' | 'high' = 
      totalMemoryUsage > this.memoryThreshold ? 'high' :
      totalMemoryUsage > this.memoryWarningThreshold ? 'medium' : 'low';

    return {
      totalResources: this.resources.size,
      totalMemoryUsage,
      resourcesByType,
      oldestResource,
      memoryPressure
    };
  }

  /**
   * Start periodic cleanup interval
   */
  private startCleanupInterval(): void {
    if (this.cleanupInterval) return;
    
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldResources();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Stop cleanup interval
   */
  stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Setup memory monitoring (browser only)
   */
  private setupMemoryMonitoring(): void {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (window.performance as any)) {
      // Monitor memory usage periodically
      setInterval(() => {
        const memory = (window.performance as any).memory;
        if (memory) {
          const usedMB = memory.usedJSHeapSize / 1024 / 1024;
          const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
          
          if (usedMB > limitMB * 0.8) {
            console.warn(`🧠 High JS heap usage: ${usedMB.toFixed(1)}MB / ${limitMB.toFixed(1)}MB`);
            this.cleanupOldResources();
          }
        }
      }, 30000); // Every 30 seconds
    }
  }

  /**
   * Generate unique resource ID
   */
  private generateResourceId(): string {
    return `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format bytes for human readable output
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Force garbage collection (if available)
   */
  forceGarbageCollection(): boolean {
    if (typeof window !== 'undefined' && (window as any).gc) {
      (window as any).gc();
      console.log('🗑️ Forced garbage collection');
      return true;
    }
    return false;
  }

  /**
   * Cleanup on page unload
   */
  setupUnloadCleanup(): void {
    if (typeof window !== 'undefined') {
      const cleanup = () => {
        this.cleanupAll();
        this.stopCleanupInterval();
      };

      window.addEventListener('beforeunload', cleanup);
      window.addEventListener('unload', cleanup);
      
      // Also cleanup on visibility change (tab switch)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.cleanupOldResources();
        }
      });
    }
  }

  /**
   * Get memory recommendations
   */
  getMemoryRecommendations(): string[] {
    const stats = this.getResourceStats();
    const recommendations: string[] = [];

    if (stats.memoryPressure === 'high') {
      recommendations.push('Consider reducing the number of images or video quality');
      recommendations.push('Close other browser tabs to free up memory');
      recommendations.push('Restart the browser if issues persist');
    } else if (stats.memoryPressure === 'medium') {
      recommendations.push('Monitor memory usage during video generation');
      recommendations.push('Consider processing fewer images at once');
    }

    if (stats.totalResources > 50) {
      recommendations.push('Too many resources active - consider restarting the workflow');
    }

    return recommendations;
  }
}

export const resourceManagementService = new ResourceManagementService();

// Setup automatic cleanup on page unload
if (typeof window !== 'undefined') {
  resourceManagementService.setupUnloadCleanup();
}