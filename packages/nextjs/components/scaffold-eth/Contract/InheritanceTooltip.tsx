import { InformationCircleIcon } from "@heroicons/react/24/solid";

export const InheritanceTooltip = ({
  inheritedFrom,
  tooltipType = "tooltip-secondary",
}: {
  inheritedFrom?: string;
  tooltipType?: string;
}) => (
  <>
    {inheritedFrom && (
      <span
        className={`cursor-help tooltip tooltip-top ${tooltipType} px-2 before:content-[attr(data-tip)]`}
        data-tip={`Inherited from: ${inheritedFrom}`}
      >
        <InformationCircleIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
      </span>
    )}
  </>
);
