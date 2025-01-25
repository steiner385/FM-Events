// Comprehensive local type declarations

declare module 'zod' {
  export function object<T extends Record<string, any>>(
    shape: T
  ): {
    parse(data: any): T;
    default(defaultValue: T): any;
    min(min: number): any;
    max(max: number): any;
  };

  export function number(): {
    min(min: number): any;
    max(max: number): any;
    default(defaultValue: number): any;
  };

  export function boolean(): {
    default(defaultValue: boolean): any;
  };

  export function string(): {
    default(defaultValue: string): any;
  };

  export function infer<T>(): T;
}

declare module 'hono' {
  export interface Context {
    req: {
      json(): Promise<any>;
      param(name: string): string;
    };
    json(data: any, status?: number): any;
  }

  export class Hono {
    post(path: string, handler: (c: Context) => Promise<any>): void;
    get(path: string, handler: (c: Context) => Promise<any>): void;
  }
}

declare module '@prisma/client' {
  export class PrismaClient {
    event: {
      create(data: any): Promise<any>;
      findUnique(args: { where: { id: string } }): Promise<any>;
      findMany(args: { where: { familyId: string } }): Promise<any[]>;
      count(): Promise<number>;
      findFirst(args: { orderBy: { createdAt: 'desc' } }): Promise<any>;
    };

    $disconnect(): Promise<void>;
  }
}

// SDK-like type declarations
declare module './types/sdk' {
  export interface PluginConfig {
    name: string;
    version: string;
  }

  export interface PluginContext {
    app: any;
    eventBus: {
      emit(event: string, data: any): void;
    };
    logger: {
      info(message: string, meta?: any): void;
      error(message: string, error?: any): void;
    };
    config?: any;
  }

  export abstract class BasePlugin {
    protected logger: {
      info(message: string, meta?: any): void;
      error(message: string, error?: any): void;
    };

    constructor(config: PluginConfig);
    abstract init(context: PluginContext): Promise<void>;
    abstract getHealth(): Promise<any>;
  }
}