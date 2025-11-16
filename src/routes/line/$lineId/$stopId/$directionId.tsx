import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { ErrorState } from "@/components/shared/error-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { SuspenseWrapper } from "@/components/shared/suspense-wrapper";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrivalsView } from "@/features/arrivals";
import { realtimeQueryOptions } from "@/features/arrivals/hooks/use-realtime-query";
import { routesQueryOptions } from "@/features/lines/hooks/use-routes-query";
import { stopsQueryOptions } from "@/features/stops/hooks/use-stops-query";
import { queryKeys } from "@/lib/query/query-keys";

export const Route = createFileRoute("/line/$lineId/$stopId/$directionId")({
  component: ArrivalsComponent,
  loader: ({ context }) => {
    return Promise.all([
      context.queryClient.ensureQueryData(routesQueryOptions),
      context.queryClient.ensureQueryData(stopsQueryOptions),
    ]);
  },
});

function ArrivalsComponent() {
  const { lineId, stopId, directionId } = Route.useParams();
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
            <BreadcrumbLink asChild>
              <Link to="/line/$lineId/$stopId" params={{ lineId, stopId }}>
                {stop?.stop_name || stopId}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              Dirección
              {directionId}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">{stop?.stop_name || stopId}</h1>
        {route && (
          <p className="text-muted-foreground">
            {route.route_long_name}
            {" "}
            - Dirección
            {directionId}
          </p>
        )}
      </div>

      <SuspenseWrapper>
        <ArrivalsContent
          lineId={lineId}
          stopId={stopId}
          directionId={directionId}
          stopName={stop?.stop_name || stopId}
          routeName={route?.route_long_name || lineId}
        />
      </SuspenseWrapper>
    </div>
  );
}

function ArrivalsContent({
  lineId,
  stopId,
  directionId,
  stopName,
  routeName,
}: {
  lineId: string;
  stopId: string;
  directionId: string;
  stopName: string;
  routeName: string;
}) {
  const queryClient = useQueryClient();
  const { data, error, isFetching } = useQuery(
    realtimeQueryOptions(lineId, stopId, directionId),
  );

  if (error) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : "Error al cargar los arribos"}
        onRetry={() => {
          queryClient.invalidateQueries({
            queryKey: queryKeys.realtime(lineId, stopId, directionId),
          });
        }}
      />
    );
  }

  if (!data) {
    return <LoadingSpinner />;
  }

  return (
    <ArrivalsView
      data={data}
      stopName={stopName}
      routeName={routeName}
      selectedStopId={stopId}
      isFetching={isFetching}
    />
  );
}
