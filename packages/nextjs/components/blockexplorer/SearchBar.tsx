import { useSearchHandler } from "~~/hooks/scaffold-eth";

export const SearchBar = () => {
  const { handleSearch, searchInput, setSearchInput } = useSearchHandler();

  return (
    <form onSubmit={handleSearch} className="flex items-center justify-end mb-5 space-x-3">
      <input
        className="border-primary bg-base-100 text-base-content p-2 mr-2 w-full md:w-1/2 lg:w-1/3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
        type="text"
        value={searchInput}
        placeholder="Search by hash or address"
        onChange={e => setSearchInput(e.target.value)}
      />
      <button className="btn btn-primary" type="submit">
        Search
      </button>
    </form>
  );
};
