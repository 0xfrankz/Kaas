/**
 * Util methods for file manipulations in cache folder of App Data
 */
import type { FileEntry } from '@tauri-apps/api/fs';
import { readDir, writeBinaryFile } from '@tauri-apps/api/fs';
import { BaseDirectory, sep } from '@tauri-apps/api/path';

const BASE_PATH = `cache${sep}`;

/**
 * List all files in a directory
 * @param recursive whether to list subdirectories
 * @returns file entries as FileEntry[]
 */
async function list(recursive: boolean = false): Promise<FileEntry[]> {
  const entries = await readDir(BASE_PATH, {
    dir: BaseDirectory.AppData,
    recursive,
  });
  return entries;
}

/**
 * Write a file to cache dir with given file name
 * @param name file name
 * @param data binary data as Uint8Array
 */
async function write(fileName: string, data: Uint8Array) {
  await writeBinaryFile(`${BASE_PATH}${fileName}`, data, {
    dir: BaseDirectory.AppData,
  });
}

export default {
  list,
  write,
};
