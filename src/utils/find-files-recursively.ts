import fs from "fs";
import path from "path";

export const findFilesRecursiveSync = (
  baseDir: string,
  criteriaFn: (path: string) => boolean = () => true
): string[] => {
  const subPaths = fs.readdirSync(baseDir);
  const files = subPaths.map((relativePath) => {
    const fullPath = path.resolve(baseDir, relativePath);
    return fs.lstatSync(fullPath).isDirectory()
      ? [...findFilesRecursiveSync(fullPath, criteriaFn)]
      : criteriaFn(fullPath)
      ? [fullPath]
      : [];
  });

  return files.flat();
};
