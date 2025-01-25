// Mock SDK types for local development

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

export class EventBus {
  subscribe(event: string, handler: (data: any) => void): void {}
  emit(event: string, data: any): void {}
}

export class Logger {
  info(message: string, meta?: any): void {}
  error(message: string, error?: any): void {}
  warn(message: string, meta?: any): void {}
}

export abstract class BasePlugin {
  protected logger: Logger;

  constructor(config: PluginConfig) {
    this.logger = new Logger();
  }

  abstract init(context: PluginContext): Promise<void>;
  abstract getHealth(): Promise<any>;
}