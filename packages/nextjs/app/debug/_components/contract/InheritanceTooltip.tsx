import { InformationCircleIcon } from "@heroicons/react/20/solid";

export const InheritanceTooltip = ({ inheritedFrom }: { inheritedFrom?: string }) => (
  <>
    {inheritedFrom && (
      <span
        className="tooltip tooltip-top tooltip-accent px-2 md:break-words"
        data-tip={`Inherited from: ${inheritedFrom}`}
      >
        <InformationCircleIcon className="h-4 w-4" aria-hidden="true" />
      </span>
    )}
  </>
);
