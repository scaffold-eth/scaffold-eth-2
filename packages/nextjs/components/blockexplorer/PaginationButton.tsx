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
    () =>
      isPrevButtonDisabled
        ? "bg-gray-200 cursor-default"
        : "bg-primary text-primary-content hover:bg-accent hover:text-accent-content",
    [isPrevButtonDisabled],
  );

  const nextButtonClass = useMemo(
    () =>
      isNextButtonDisabled
        ? "bg-gray-200 cursor-default"
        : "bg-primary text-primary-content hover:bg-accent hover:text-accent-content",
    [isNextButtonDisabled],
  );

  return (
    <div className="absolute right-0 bottom-0 mb-5 mr-5 flex space-x-3">
      <button
        className={`btn py-1 px-3 rounded-md text-xs ${prevButtonClass}`}
        disabled={isPrevButtonDisabled}
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        <ArrowLeftIcon className="h-4 w-4" />
      </button>
      <span className="self-center text-primary-content font-medium">Page {currentPage + 1}</span>
      <button
        className={`btn py-1 px-3 rounded-md text-xs ${nextButtonClass}`}
        disabled={isNextButtonDisabled}
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        <ArrowRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
};
