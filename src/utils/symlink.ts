import type { Options } from "ncp";
import { existsSync, lstatSync, readdirSync } from "fs";
import { mkdir, symlink } from "fs/promises";
import path from "path";

/**
 * The goal is that this function has the same API as ncp, so they can be used
 * interchangeably.
 * 
 * - clobber not implemented
 */
const symlinkRecursive = async (source: string, destination: string, options?: Options): Promise<void> => {
  const passesFilter = options?.filter === undefined
    ? true // no filter
    : typeof options.filter === 'function'
      ? options.filter(source) // filter is function
      : options.filter.test(source) // filter is regex

  if (!passesFilter) {
    return
  }

  if(lstatSync(source).isDirectory()) {
    const subPaths = readdirSync(source);
    await Promise.all(
      subPaths.map(async subPath => {
        const sourceSubpath = path.join(source, subPath);
        const isSubPathAFolder = lstatSync(sourceSubpath).isDirectory()
        const destSubPath = path.join(destination, subPath)
        const existsDestSubPath = existsSync(destSubPath)
        if (isSubPathAFolder && !existsDestSubPath) {
          await mkdir(destSubPath)
        }
        await symlinkRecursive(sourceSubpath, destSubPath, options)
      })
    )
    return
  }

  return symlink(source, destination)
}

export default symlinkRecursive