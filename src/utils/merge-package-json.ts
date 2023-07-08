// @ts-expect-error We don't have types for this probably add .d.ts file
import mergeJsonStr from "merge-packages";
import fs from "fs";

export function mergePackageJson(
  targetPackageJsonPath: string,
  secondPackageJsonPath: string
) {
  if (
    !fs.existsSync(targetPackageJsonPath) ||
    !fs.existsSync(secondPackageJsonPath)
  )
    return;

  const targetPackageJson = fs.readFileSync(targetPackageJsonPath, "utf8");

  const secondPackageJson = fs.readFileSync(secondPackageJsonPath, "utf8");

  const mergedPkgStr = mergeJsonStr.default(
    targetPackageJson,
    secondPackageJson
  );

  fs.writeFileSync(targetPackageJsonPath, mergedPkgStr, "utf8");
}
