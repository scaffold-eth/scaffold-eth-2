import { JSX } from "react";

type Provider<TProps> = {
  Component: React.ComponentType<React.PropsWithChildren<TProps>>;
  props?: Omit<TProps, "children">;
};

export function composeProviders<TProviders extends Array<Provider<any>>>(
  providers: TProviders,
): React.ComponentType<React.PropsWithChildren> {
  const ProviderComponent: React.FunctionComponent<React.PropsWithChildren> = ({ children }) => {
    const initialJSX = <>{children}</>;

    return providers.reduceRight<JSX.Element>((prevJSX, { Component: CurrentProvider, props = {} }) => {
      return <CurrentProvider {...props}>{prevJSX}</CurrentProvider>;
    }, initialJSX);
  };

  return ProviderComponent;
}

export function createProvider<TProps>(
  Component: React.ComponentType<React.PropsWithChildren<TProps>>,
  props?: Omit<TProps, "children">,
): Provider<TProps> {
  return { Component, props };
}
