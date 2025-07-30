/**
 * Fallback Chain Service
 * Manages multiple service providers and automatically switches to backups when primary services fail
 */

export interface ServiceProvider {
  id: string;
  name: string;
  priority: number;
  isAvailable: boolean;
  lastFailure?: Date;
  failureCount: number;
  maxFailures: number;
  cooldownPeriod: number; // milliseconds
  healthCheckUrl?: string;
  execute: (params: any) => Promise<any>;
}

export interface FallbackChainConfig {
  maxRetries: number;
  retryDelay: number;
  healthCheckInterval: number;
  circuitBreakerThreshold: number;
}

class FallbackChainService {
  private providers: Map<string, ServiceProvider[]> = new Map();
  private config: FallbackChainConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    healthCheckInterval: 60000, // 1 minute
    circuitBreakerThreshold: 5
  };
  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Register a service provider for a specific service type
   */
  registerProvider(serviceType: string, provider: ServiceProvider): void {
    if (!this.providers.has(serviceType)) {
      this.providers.set(serviceType, []);
    }

    const existingProviders = this.providers.get(serviceType)!;
    
    // Remove existing provider with same ID if it exists
    const filteredProviders = existingProviders.filter(p => p.id !== provider.id);
    
    // Add new provider and sort by priority
    filteredProviders.push(provider);
    filteredProviders.sort((a, b) => a.priority - b.priority);
    
    this.providers.set(serviceType, filteredProviders);
    
    // Start health checks if configured
    if (provider.healthCheckUrl) {
      this.startHealthCheck(serviceType, provider.id);
    }

    console.log(`📡 Registered ${provider.name} as provider for ${serviceType} (priority: ${provider.priority})`);
  }

  /**
   * Execute a service with automatic fallback
   */
  async executeWithFallback<T>(
    serviceType: string, 
    params: any,
    onProviderChange?: (providerId: string, providerName: string) => void
  ): Promise<T> {
    const providers = this.providers.get(serviceType);
    
    if (!providers || providers.length === 0) {
      throw new Error(`No providers registered for service type: ${serviceType}`);
    }

    let lastError: Error | null = null;
    
    for (const provider of providers) {
      // Skip if provider is in circuit breaker state
      if (!this.isProviderAvailable(provider)) {
        console.log(`⚠️ Skipping ${provider.name} - circuit breaker active`);
        continue;
      }

      try {
        console.log(`🔄 Attempting ${serviceType} with ${provider.name}`);
        
        if (onProviderChange) {
          onProviderChange(provider.id, provider.name);
        }

        const startTime = Date.now();
        const result = await provider.execute(params);
        const duration = Date.now() - startTime;

        // Success - reset failure count
        provider.failureCount = 0;
        provider.lastFailure = undefined;
        
        console.log(`✅ ${provider.name} succeeded in ${duration}ms`);
        return result;

      } catch (error) {
        lastError = error as Error;
        console.error(`❌ ${provider.name} failed:`, error);
        
        // Increment failure count
        provider.failureCount++;
        provider.lastFailure = new Date();
        
        // Check if we should circuit break this provider
        if (provider.failureCount >= provider.maxFailures) {
          provider.isAvailable = false;
          console.warn(`🚨 Circuit breaker activated for ${provider.name}`);
          
          // Schedule recovery attempt
          setTimeout(() => {
            provider.isAvailable = true;
            provider.failureCount = 0;
            console.log(`🔋 Circuit breaker reset for ${provider.name}`);
          }, provider.cooldownPeriod);
        }
        
        // Continue to next provider
        continue;
      }
    }

    // All providers failed
    throw new Error(`All providers failed for ${serviceType}. Last error: ${lastError?.message}`);
  }

  /**
   * Check if a provider is available (not in circuit breaker state)
   */
  private isProviderAvailable(provider: ServiceProvider): boolean {
    if (!provider.isAvailable) {
      return false;
    }

    // Check if cooldown period has passed
    if (provider.lastFailure) {
      const timeSinceFailure = Date.now() - provider.lastFailure.getTime();
      if (timeSinceFailure < provider.cooldownPeriod) {
        return false;
      }
    }

    return true;
  }

  /**
   * Start health check for a provider
   */
  private startHealthCheck(serviceType: string, providerId: string): void {
    const intervalId = setInterval(async () => {
      await this.performHealthCheck(serviceType, providerId);
    }, this.config.healthCheckInterval);

    this.healthCheckIntervals.set(`${serviceType}:${providerId}`, intervalId);
  }

  /**
   * Perform health check for a specific provider
   */
  private async performHealthCheck(serviceType: string, providerId: string): Promise<void> {
    const providers = this.providers.get(serviceType);
    if (!providers) return;

    const provider = providers.find(p => p.id === providerId);
    if (!provider || !provider.healthCheckUrl) return;

    try {
      const response = await fetch(provider.healthCheckUrl, {
        method: 'HEAD',
        timeout: 5000
      });

      if (response.ok) {
        if (!provider.isAvailable) {
          provider.isAvailable = true;
          provider.failureCount = 0;
          console.log(`💚 Health check passed for ${provider.name} - provider restored`);
        }
      } else {
        throw new Error(`Health check failed with status: ${response.status}`);
      }
    } catch (error) {
      if (provider.isAvailable) {
        console.warn(`💔 Health check failed for ${provider.name}:`, error);
        provider.failureCount++;
        
        if (provider.failureCount >= provider.maxFailures) {
          provider.isAvailable = false;
          console.warn(`🚨 Provider ${provider.name} marked as unavailable due to health check failures`);
        }
      }
    }
  }

  /**
   * Get status of all providers for a service type
   */
  getServiceStatus(serviceType: string): {
    serviceType: string;
    providers: Array<{
      id: string;
      name: string;
      available: boolean;
      failureCount: number;
      lastFailure?: Date;
      priority: number;
    }>;
    activeProvider?: string;
  } {
    const providers = this.providers.get(serviceType) || [];
    
    const availableProvider = providers.find(p => this.isProviderAvailable(p));
    
    return {
      serviceType,
      providers: providers.map(p => ({
        id: p.id,
        name: p.name,
        available: this.isProviderAvailable(p),
        failureCount: p.failureCount,
        lastFailure: p.lastFailure,
        priority: p.priority
      })),
      activeProvider: availableProvider?.id
    };
  }

  /**
   * Get overall system status
   */
  getSystemStatus(): Record<string, any> {
    const status: Record<string, any> = {};
    
    for (const serviceType of this.providers.keys()) {
      status[serviceType] = this.getServiceStatus(serviceType);
    }
    
    return status;
  }

  /**
   * Manually mark a provider as unavailable
   */
  markProviderUnavailable(serviceType: string, providerId: string): boolean {
    const providers = this.providers.get(serviceType);
    if (!providers) return false;

    const provider = providers.find(p => p.id === providerId);
    if (!provider) return false;

    provider.isAvailable = false;
    provider.failureCount = provider.maxFailures;
    provider.lastFailure = new Date();

    console.log(`🔴 Manually marked ${provider.name} as unavailable`);
    return true;
  }

  /**
   * Manually restore a provider
   */
  restoreProvider(serviceType: string, providerId: string): boolean {
    const providers = this.providers.get(serviceType);
    if (!providers) return false;

    const provider = providers.find(p => p.id === providerId);
    if (!provider) return false;

    provider.isAvailable = true;
    provider.failureCount = 0;
    provider.lastFailure = undefined;

    console.log(`🟢 Manually restored ${provider.name}`);
    return true;
  }

  /**
   * Update provider priority
   */
  updateProviderPriority(serviceType: string, providerId: string, newPriority: number): boolean {
    const providers = this.providers.get(serviceType);
    if (!providers) return false;

    const provider = providers.find(p => p.id === providerId);
    if (!provider) return false;

    provider.priority = newPriority;
    
    // Re-sort providers by priority
    providers.sort((a, b) => a.priority - b.priority);
    
    console.log(`📊 Updated ${provider.name} priority to ${newPriority}`);
    return true;
  }

  /**
   * Clean up health check intervals
   */
  cleanup(): void {
    for (const interval of this.healthCheckIntervals.values()) {
      clearInterval(interval);
    }
    this.healthCheckIntervals.clear();
  }

  /**
   * Get recommendations for improving service reliability
   */
  getReliabilityRecommendations(): string[] {
    const recommendations: string[] = [];
    
    for (const [serviceType, providers] of this.providers.entries()) {
      const availableProviders = providers.filter(p => this.isProviderAvailable(p));
      
      if (availableProviders.length === 0) {
        recommendations.push(`🚨 No available providers for ${serviceType} - service will fail`);
      } else if (availableProviders.length === 1) {
        recommendations.push(`⚠️ Only one provider available for ${serviceType} - consider adding backup`);
      }
      
      const highFailureProviders = providers.filter(p => p.failureCount > 2);
      if (highFailureProviders.length > 0) {
        recommendations.push(`📈 High failure rate detected for ${serviceType} providers - check service health`);
      }
    }
    
    return recommendations;
  }
}

export const fallbackChainService = new FallbackChainService();