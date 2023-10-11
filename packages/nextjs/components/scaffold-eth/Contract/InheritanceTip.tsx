export const InheritanceTip = ({ inheritedFrom }: { inheritedFrom?: string }) => {
  return (
    <>
      {inheritedFrom && (
        <span
          className="tooltip tooltip-top tooltip-secondary px-2 before:content-[attr(data-tip)]"
          data-tip={`Inherited from: ${inheritedFrom}`}
        >
          *
        </span>
      )}
    </>
  );
};
