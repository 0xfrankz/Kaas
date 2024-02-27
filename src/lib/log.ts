import type { LogOptions } from 'tauri-plugin-log-api';
import {
  attachConsole,
  error as logError,
  info as logInfo,
} from 'tauri-plugin-log-api';

import type { CommandError } from './types';

function isCommandError(err: any): err is CommandError {
  return err.type !== undefined && err.message !== undefined;
}

export async function info(message: string, options?: LogOptions) {
  const detach = await attachConsole();
  logInfo(message, options);
  detach();
}

export async function error(
  err: string | Error | CommandError,
  options?: LogOptions
) {
  let errMsg;
  if (err instanceof Error) {
    errMsg = err.message;
  } else if (isCommandError(err)) {
    errMsg = `${err.type}: ${err.message}`;
  } else {
    errMsg = err;
  }

  const detach = await attachConsole();
  logError(errMsg, options);
  detach();
}

export default {
  info,
  error,
};
