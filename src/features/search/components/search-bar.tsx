import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import type { SearchResult } from "@/types";

import { useDebouncedValue } from "@/hooks/use-debounced-value";

import { searchQueryOptions } from "../hooks/use-search-query";
import { SearchInput } from "./search-input";
import { SearchResults } from "./search-results";

type SearchBarProps = {
  onResultSelect?: (result: SearchResult) => void;
};

export const SearchBar = ({ onResultSelect }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const { data: results = [], isLoading } = useQuery(searchQueryOptions(debouncedQuery));

  return (
    <div className="space-y-4">
      <SearchInput value={query} onChange={setQuery} />
      {isLoading && debouncedQuery && (
        <div className="text-center text-muted-foreground py-4">
          Buscando...
        </div>
      )}
      {!isLoading && debouncedQuery && (
        <SearchResults results={results} onResultSelect={onResultSelect} />
      )}
    </div>
  );
};
