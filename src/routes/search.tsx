import { createFileRoute } from "@tanstack/react-router";

import { SearchBar } from "@/features/search";

export const Route = createFileRoute("/search")({
  component: SearchComponent,
});

function SearchComponent() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">Buscar Estación</h1>
        <p className="text-muted-foreground">
          Busca una estación por nombre
        </p>
      </div>

      <SearchBar />
    </div>
  );
}
