import type { ReactNode } from "react";

import { Suspense } from "react";

import { LoadingSpinner } from "./loading-spinner";

type SuspenseWrapperProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export const SuspenseWrapper = ({ children, fallback }: SuspenseWrapperProps) => {
  return <Suspense fallback={fallback || <LoadingSpinner />}>{children}</Suspense>;
};
