import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { SuspenseWrapper } from "@/components/shared/suspense-wrapper";
import { LineSelector } from "@/features/lines";
import { routesQueryOptions } from "@/features/lines/hooks/use-routes-query";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  loader: ({ context }) => {
    return context.queryClient.ensureQueryData(routesQueryOptions);
  },
});

function HomeComponent() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">Líneas de Subte</h1>
        <p className="text-muted-foreground">
          Selecciona una línea para ver sus estaciones
        </p>
      </div>

      <SuspenseWrapper>
        <LineSelectorContent />
      </SuspenseWrapper>
    </div>
  );
}

function LineSelectorContent() {
  useSuspenseQuery(routesQueryOptions);

  return <LineSelector />;
}
