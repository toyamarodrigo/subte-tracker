import { useQueryClient } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";

import { routeTree } from "./route-tree.gen";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  context: {
    queryClient: undefined!,
  },
});

declare module "@tanstack/react-router" {
  // eslint-disable-next-line ts/consistent-type-definitions
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const queryClient = useQueryClient();

  return (
    <RouterProvider
      router={router}
      context={{
        queryClient,
      }}
    />
  );
}
