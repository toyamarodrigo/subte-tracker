import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { SuspenseWrapper } from "@/components/shared/suspense-wrapper";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { DirectionSelector } from "@/features/directions";
import { directionsQueryOptions } from "@/features/directions/hooks/use-directions-query";
import { routesQueryOptions } from "@/features/lines/hooks/use-routes-query";
import { stopsQueryOptions } from "@/features/stops/hooks/use-stops-query";

export const Route = createFileRoute("/line/$lineId/$stopId")({
  component: StopComponent,
  loader: ({ context, params }) => {
    return Promise.all([
      context.queryClient.ensureQueryData(routesQueryOptions),
      context.queryClient.ensureQueryData(stopsQueryOptions),
      context.queryClient.ensureQueryData(directionsQueryOptions(params.lineId, params.stopId)),
    ]);
  },
});

function StopComponent() {
  const { lineId, stopId } = Route.useParams();
  const { data: routes } = useSuspenseQuery(routesQueryOptions);
  const { data: stops } = useSuspenseQuery(stopsQueryOptions);
  const route = routes.find(r => r.route_id === lineId);
  const stop = stops.find(s => s.stop_id === stopId);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/line/$lineId" params={{ lineId }}>
                {route ? `Línea ${route.route_short_name}` : lineId}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{stop?.stop_name || stopId}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">{stop?.stop_name || stopId}</h1>
        {route && (
          <p className="text-muted-foreground">
            {route.route_long_name}
          </p>
        )}
      </div>

      <SuspenseWrapper>
        <DirectionSelector routeId={lineId} stopId={stopId} />
      </SuspenseWrapper>
    </div>
  );
}
