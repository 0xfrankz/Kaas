/**
 * Util methods for file manipulations in cache folder of App Data
 */
import { sep } from '@tauri-apps/api/path';
import type { DirEntry } from '@tauri-apps/plugin-fs';
import {
  BaseDirectory,
  readDir,
  readFile,
  writeFile,
} from '@tauri-apps/plugin-fs';

const BASE_PATH = `cache${sep()}`;

/**
 * List all files in a directory
 * @returns file entries as DirEntry[]
 */
async function list(): Promise<DirEntry[]> {
  const entries = await readDir(BASE_PATH, {
    baseDir: BaseDirectory.AppData,
  });
  return entries;
}

/**
 * Write a file, of the form of bytes array, to cache dir with given file name
 * @param name file name
 * @param data binary data as Uint8Array
 */
async function write(fileName: string, data: Uint8Array) {
  await writeFile(`${BASE_PATH}${fileName}`, data, {
    baseDir: BaseDirectory.AppData,
  });
}

/**
 * Read a file from cache as bytes array
 * @param fileName
 * @returns
 */
async function read(fileName: string): Promise<Uint8Array> {
  const data = await readFile(`${BASE_PATH}${fileName}`, {
    baseDir: BaseDirectory.AppData,
  });
  return data;
}

/**
 * Read a file from cache as object url
 * @param fileName
 * @param mimetype
 * @returns
 */
async function readObjectUrl(
  fileName: string,
  mimetype: string
): Promise<string> {
  const data = await read(fileName);
  const blob = new Blob([data], { type: mimetype });
  const url = URL.createObjectURL(blob);
  return url;
}

export default {
  list,
  write,
  read,
  readObjectUrl,
};
