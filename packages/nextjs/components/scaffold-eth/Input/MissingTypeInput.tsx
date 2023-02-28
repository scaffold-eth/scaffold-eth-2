import { utils } from "ethers";
import { useEffect } from "react";

import { InputBase } from "./InputBase";

type MissingTypeInputProps = {
  paramType: utils.ParamType;
};

export const MissingTypeInput = ({ paramType }: MissingTypeInputProps) => {
  useEffect(() => {
    console.error(`Param type ${paramType.type} is not implemented yet.`);
  }, [paramType.type]);

  return (
    <InputBase
      value={undefined}
      placeholder={`Param type ${paramType.type} is not implemented yet.`}
      onChange={() => undefined}
      disabled
    />
  );
};
