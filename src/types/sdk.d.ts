// Local type definitions for SDK dependencies

declare module '@familymanager/sdk/core/BasePlugin' {
  import { EventBus } from './events/EventBus';
  import { Logger } from './logging/Logger';

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
    constructor(config: PluginConfig);
    abstract init(context: PluginContext): Promise<void>;
    abstract getHealth(): Promise<any>;
  }
}

declare module '@familymanager/sdk/types' {
  export interface PluginConfig {
    name: string;
    version: string;
  }

  export interface PluginContext {
    app: any;
    eventBus: any;
    logger: any;
    config?: any;
  }
}

declare module '@familymanager/sdk/events/EventBus' {
  export class EventBus {
    subscribe(event: string, handler: (data: any) => void): void;
    emit(event: string, data: any): void;
  }
}

declare module '@familymanager/sdk/logging/Logger' {
  export class Logger {
    info(message: string, meta?: any): void;
    error(message: string, error?: any): void;
    warn(message: string, meta?: any): void;
  }
}