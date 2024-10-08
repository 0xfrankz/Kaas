/**
 * Util methods for file manipulations in cache folder of App Data
 */
import type { FileEntry } from '@tauri-apps/api/fs';
import { readBinaryFile, readDir, writeBinaryFile } from '@tauri-apps/api/fs';
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
 * Write a file, of the form of bytes array, to cache dir with given file name
 * @param name file name
 * @param data binary data as Uint8Array
 */
async function write(fileName: string, data: Uint8Array) {
  await writeBinaryFile(`${BASE_PATH}${fileName}`, data, {
    dir: BaseDirectory.AppData,
  });
}

/**
 * Read a file from cache as bytes array
 * @param fileName
 * @returns
 */
async function read(fileName: string): Promise<Uint8Array> {
  const data = await readBinaryFile(`${BASE_PATH}${fileName}`, {
    dir: BaseDirectory.AppData,
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
