import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export const ErrorState = ({ title = "Error", message, onRetry }: ErrorStateProps) => {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-16">
      <div className="mx-auto max-w-md">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>

        {onRetry && (
          <div className="mt-4">
            <Button onClick={onRetry} variant="outline">
              Reintentar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
