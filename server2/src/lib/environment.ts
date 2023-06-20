import fs from 'fs';
import path from 'path';
import { config as configDotenv } from 'dotenv';
import { EnvironmentFile, Environments } from '@/enums/environment.enum';
import { type CommonEnvKeys } from '@/types/environment.type';

export interface IEnvironment {
  getCurrentEnvironment: () => string;
  setEnvironment: (env?: Environments) => void;
  isProd: () => boolean;
  isDev: () => boolean;
  isTest: () => boolean;
  isStage: () => boolean;
}

class Environment implements IEnvironment {
  private _port: number;
  private _env: Environments;
  private _appUrl: string;

  constructor() {
    this.port = +process.env.PORT ?? appConfig.defaultPort;
    this.setEnvironment(process.env.NODE_ENV ?? Environments.DEV);
  }

  get env() {
    return this._env;
  }

  set env(value) {
    this._env = value;
  }

  get port() {
    return this._port;
  }

  set port(value) {
    this._port = value;
  }

  get appUrl() {
    return this._appUrl;
  }

  set appUrl(value) {
    this._appUrl = value;
  }

  private resolveEnvPath(key: CommonEnvKeys): string {
    // On priority bar, .env.[NODE_ENV] has higher priority than default env file (.env)
    // If both are not resolved, error is thrown.
    const rootDir: string = path.resolve(__dirname, '../../');
    const envPath = path.resolve(rootDir, EnvironmentFile[key]);
    const defaultEnvPath = path.resolve(rootDir, EnvironmentFile.DEFAULT);
    if (!fs.existsSync(envPath) && !fs.existsSync(defaultEnvPath)) {
      throw new Error(envFileNotFoundError(key));
    }
    return fs.existsSync(envPath) ? envPath : defaultEnvPath;
  }
}
