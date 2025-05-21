import { InformationCircleIcon } from "@heroicons/react/20/solid";
import { Tooltip } from "~~/app/components/Tooltip";

export const InheritanceTooltip = ({ inheritedFrom }: { inheritedFrom?: string }) => (
  <>
    {inheritedFrom && (
      <Tooltip content={`Inherited from: ${inheritedFrom}`} className="!whitespace-normal rounded-xl">
        <InformationCircleIcon className="h-4 w-4 mx-2" aria-hidden="true" />
      </Tooltip>
    )}
  </>
);
