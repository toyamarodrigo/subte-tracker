import { Link } from "@tanstack/react-router";

import type { SearchResult } from "@/types";

import { Card } from "@/components/ui/card";

type SearchResultsProps = {
  results: SearchResult[];
  onResultSelect?: (result: SearchResult) => void;
};

export const SearchResults = ({ results, onResultSelect }: SearchResultsProps) => {
  if (results.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No se encontraron resultados
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {results.map((result, index) => (
        <Link
          key={`${result.stop.stop_id}-${result.route.route_id}-${result.direction}-${index}`}
          to="/line/$lineId/$stopId/$directionId"
          params={{
            lineId: result.route.route_id,
            stopId: result.stop.stop_id,
            directionId: result.direction,
          }}
          onClick={() => onResultSelect?.(result)}
        >
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium">{result.stop.stop_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {result.route.route_long_name}
                  {" "}
                  -
                  {result.headsign}
                </p>
              </div>
              <div className="ml-4">
                <span className="text-lg font-bold">{result.route.route_short_name}</span>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};
