import React, { createContext, useContext, useState } from "react";
import * as chains from "wagmi/chains";
import { ScaffoldConfig } from "~~/scaffold.config";
import scaffoldConfig from "~~/scaffold.config";
import { TChainAttributes } from "~~/utils/scaffold-eth";
import { NETWORKS_EXTRA_DATA } from "~~/utils/scaffold-eth";

type IScaffoldConfig = ScaffoldConfig & Partial<TChainAttributes>;

interface IScaffoldConfigContext {
  config: IScaffoldConfig;
  setNetwork: (network: chains.Chain) => void;
  configuredNetwork: chains.Chain;
}

const ScaffoldConfigContext = createContext<IScaffoldConfigContext | undefined>(undefined);

export const ScaffoldConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [targetNetwork, setTargetNetwork] = useState<chains.Chain>(scaffoldConfig.targetNetwork); // Default network

  const config: IScaffoldConfig = {
    ...scaffoldConfig,
    targetNetwork,
    ...NETWORKS_EXTRA_DATA[targetNetwork.id],
  };

  return (
    <ScaffoldConfigContext.Provider
      value={{ config, setNetwork: setTargetNetwork, configuredNetwork: config.targetNetwork }}
    >
      {children}
    </ScaffoldConfigContext.Provider>
  );
};

export const useScaffoldConfig = () => {
  const context = useContext(ScaffoldConfigContext);
  if (!context) {
    throw new Error("useScaffoldConfig must be used within a ScaffoldConfigProvider");
  }
  return context;
};
