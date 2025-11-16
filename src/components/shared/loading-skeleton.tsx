import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type LoadingSkeletonProps = {
  className?: string;
};

export const LoadingSkeleton = ({ className }: LoadingSkeletonProps) => {
  return <Skeleton className={cn("h-4 w-full", className)} />;
};
