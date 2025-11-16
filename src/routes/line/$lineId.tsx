import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { SuspenseWrapper } from "@/components/shared/suspense-wrapper";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { routesQueryOptions } from "@/features/lines/hooks/use-routes-query";
import { StopSelector } from "@/features/stops";
import { routeToStopsQueryOptions } from "@/features/stops/hooks/use-route-to-stops-query";
import { stopsQueryOptions } from "@/features/stops/hooks/use-stops-query";

export const Route = createFileRoute("/line/$lineId")({
  component: LineComponent,
  loader: ({ context }) => {
    return Promise.all([
      context.queryClient.ensureQueryData(routesQueryOptions),
      context.queryClient.ensureQueryData(routeToStopsQueryOptions),
      context.queryClient.ensureQueryData(stopsQueryOptions),
    ]);
  },
});

function LineComponent() {
  const { lineId } = Route.useParams();
  const { data: routes } = useSuspenseQuery(routesQueryOptions);
  const route = routes.find(r => r.route_id === lineId);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {route ? `Línea ${route.route_short_name}` : lineId}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">
          {route ? `Línea ${route.route_short_name}` : lineId}
        </h1>
        {route && (
          <p className="text-muted-foreground">{route.route_long_name}</p>
        )}
      </div>

      <SuspenseWrapper>
        <StopSelector routeId={lineId} />
      </SuspenseWrapper>
    </div>
  );
}
