import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { SuspenseWrapper } from "@/components/shared/suspense-wrapper";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { routeDirectionsQueryOptions, useRouteDirectionsQuery } from "@/features/directions/hooks/use-route-directions-query";
import { routesQueryOptions } from "@/features/lines/hooks/use-routes-query";
import { StopSelector } from "@/features/stops";
import { routeToStopsQueryOptions } from "@/features/stops/hooks/use-route-to-stops-query";
import { stopsQueryOptions } from "@/features/stops/hooks/use-stops-query";

export const Route = createFileRoute("/line/$lineId")({
  component: LineComponent,
  loader: ({ context, params }) => {
    const { queryClient } = context as { queryClient: ReturnType<typeof import("@tanstack/react-query").useQueryClient> };

    return Promise.all([
      queryClient.ensureQueryData(routesQueryOptions),
      queryClient.ensureQueryData(routeToStopsQueryOptions),
      queryClient.ensureQueryData(stopsQueryOptions),
      queryClient.ensureQueryData(routeDirectionsQueryOptions(params.lineId)),
    ]);
  },
});

function LineComponent() {
  const { lineId } = Route.useParams();
  const { data: routes } = useSuspenseQuery(routesQueryOptions);
  const { data: directions } = useRouteDirectionsQuery(lineId);
  const route = routes.find(r => r.route_id === lineId);

  const initialDirectionId = directions && directions.length > 0 ? directions[0].directionId : "0";
  const [selectedDirectionId, setSelectedDirectionId] = useState<string>(initialDirectionId);

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

      {directions && directions.length > 1 && (
        <div className="mb-6">
          <Tabs value={selectedDirectionId} onValueChange={setSelectedDirectionId}>
            <TabsList>
              {directions.map(direction => (
                <TabsTrigger key={direction.directionId} value={direction.directionId}>
                  {direction.directionDisplayName}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}

      <SuspenseWrapper>
        <StopSelector routeId={lineId} directionId={selectedDirectionId} />
      </SuspenseWrapper>
    </div>
  );
}
