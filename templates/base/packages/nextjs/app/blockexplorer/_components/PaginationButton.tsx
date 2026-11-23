import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

type PaginationButtonProps = {
  currentPage: number;
  hasNextPage: boolean;
  setCurrentPage: (page: number) => void;
};

export const PaginationButton = ({ currentPage, hasNextPage, setCurrentPage }: PaginationButtonProps) => {
  const isPrevButtonDisabled = currentPage === 0;
  const isNextButtonDisabled = !hasNextPage;

  if (isNextButtonDisabled && isPrevButtonDisabled) return null;

  return (
    <div className="mt-5 justify-end flex gap-3 mx-5">
      <button
        className="btn btn-sm btn-primary"
        disabled={isPrevButtonDisabled}
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        <ArrowLeftIcon className="h-4 w-4" />
      </button>
      <span className="self-center text-primary-content font-medium">Page {currentPage + 1}</span>
      <button
        className="btn btn-sm btn-primary"
        disabled={isNextButtonDisabled}
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        <ArrowRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
};
