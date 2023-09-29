import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

interface PaginationButtonProps {
  currentPage: number;
  totalItems: number;
  setCurrentPage: (page: number) => void;
}

const ITEMS_PER_PAGE = 20;

export const PaginationButton = ({ currentPage, totalItems, setCurrentPage }: PaginationButtonProps) => {
  const isPrevButtonDisabled = currentPage === 0;
  const isNextButtonDisabled = currentPage + 1 >= Math.ceil(totalItems / ITEMS_PER_PAGE);

  const prevButtonClass = isPrevButtonDisabled ? "bg-gray-200 cursor-default" : "btn btn-primary";
  const nextButtonClass = isNextButtonDisabled ? "bg-gray-200 cursor-default" : "btn btn-primary";

  if (isNextButtonDisabled && isPrevButtonDisabled) return null;

  return (
    <div className="mt-5 justify-end flex gap-3 mx-5">
      <button
        className={`btn btn-sm ${prevButtonClass}`}
        disabled={isPrevButtonDisabled}
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        <ArrowLeftIcon className="h-4 w-4" />
      </button>
      <span className="self-center text-primary-content font-medium">Page {currentPage + 1}</span>
      <button
        className={`btn btn-sm ${nextButtonClass}`}
        disabled={isNextButtonDisabled}
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        <ArrowRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
};
