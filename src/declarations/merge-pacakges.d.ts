declare module "merge-packages" {
  const mergePackages: {
    default: (target: string, second: string) => string;
  };
  export default mergePackages;
}
