import { useMemo } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

interface PaginationButtonProps {
  currentPage: number;
  totalItems: number;
  setCurrentPage: (page: number) => void;
}

const ITEMS_PER_PAGE = 20;

export const PaginationButton = ({ currentPage, totalItems, setCurrentPage }: PaginationButtonProps) => {
  const isPrevButtonDisabled = useMemo(() => currentPage === 0, [currentPage]);
  const isNextButtonDisabled = useMemo(
    () => currentPage + 1 >= Math.ceil(totalItems / ITEMS_PER_PAGE),
    [currentPage, totalItems],
  );

  const prevButtonClass = useMemo(
    () => (isPrevButtonDisabled ? "bg-gray-200 cursor-default" : "btn btn-primary"),
    [isPrevButtonDisabled],
  );

  const nextButtonClass = useMemo(
    () => (isNextButtonDisabled ? "bg-gray-200 cursor-default" : "btn btn-primary"),
    [isNextButtonDisabled],
  );

  return (
    <div className="absolute right-0 bottom-0 mb-5 mr-5 flex space-x-3">
      <button
        className={`btn btn-primary ${prevButtonClass}`}
        disabled={isPrevButtonDisabled}
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        <ArrowLeftIcon className="h-4 w-4" />
      </button>
      <span className="self-center text-primary-content font-medium">Page {currentPage + 1}</span>
      <button
        className={`btn btn-primary ${nextButtonClass}`}
        disabled={isNextButtonDisabled}
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        <ArrowRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
};
