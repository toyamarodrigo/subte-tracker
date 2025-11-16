import { Link, useLocation } from "@tanstack/react-router";
import { Home, Search } from "lucide-react";

import { cn } from "@/lib/utils";

export const AppHeader = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-foreground hover:text-foreground/80 transition-colors"
        >
          <span>Subte Tracker</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
              location.pathname === "/" && "text-foreground",
            )}
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <Link
            to="/search"
            className={cn(
              "flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
              location.pathname === "/search" && "text-foreground",
            )}
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};
