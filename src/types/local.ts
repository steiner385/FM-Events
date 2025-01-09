// Comprehensive local type declarations for external dependencies

export interface EventBus {
  emit(event: string, data: any): void;
}

export interface Logger {
  info(message: string, meta?: any): void;
  error(message: string, error?: any): void;
  warn?(message: string, meta?: any): void;
}

export interface PluginConfig {
  name: string;
  version: string;
}

export interface PluginContext {
  app: any;
  eventBus: EventBus;
  logger: Logger;
  config?: any;
}

export abstract class BasePlugin {
  protected logger: Logger;

  constructor(config: PluginConfig) {
    this.logger = {
      info: () => {},
      error: () => {}
    };
  }

  abstract init(context: PluginContext): Promise<void>;
  abstract getHealth(): Promise<any>;
}

// Additional type utilities
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// Utility functions for type manipulation
export function isNullable<T>(value: T | null): value is null {
  return value === null;
}

export function isUndefined<T>(value: T | undefined): value is undefined {
  return value === undefined;
}