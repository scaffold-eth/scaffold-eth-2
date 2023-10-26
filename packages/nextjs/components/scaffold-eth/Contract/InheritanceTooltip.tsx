import { InformationCircleIcon } from "@heroicons/react/20/solid";

export const InheritanceTooltip = ({ inheritedFrom }: { inheritedFrom?: string }) => (
  <>
    {inheritedFrom && (
      <span
        className={`cursor-help tooltip tooltip-top tooltip-accent px-2 before:content-[attr(data-tip)]`}
        data-tip={`Inherited from: ${inheritedFrom}`}
      >
        <InformationCircleIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
      </span>
    )}
  </>
);
