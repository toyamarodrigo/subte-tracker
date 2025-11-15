# Plan de Migración: ¿Dónde está el Subte?

## Vite + TanStack Router + React 19 + PWA

> **Meta**: Reconstruir la app con arquitectura moderna orientada a features, usando kebab-case, soporte PWA, y eliminando anti-patterns.

---

## 📋 Tabla de Contenidos

1. [Stack Tecnológico](#stack-tecnológico)
2. [Decisión de Arquitectura](#decisión-de-arquitectura)
3. [Estructura del Proyecto](#estructura-del-proyecto-feature-based--kebab-case)
4. [Convenciones de Código](#convenciones-de-código)
5. [Definiciones de Tipos](#definiciones-de-tipos)
6. [Configuración Inicial](#configuración-inicial)
7. [Features](#features)
8. [Utilidades Compartidas](#utilidades-compartidas)
9. [PWA Configuration](#pwa-configuration)
10. [Secuencia de Implementación](#secuencia-de-implementación)
11. [Anti-Patterns a Evitar](#anti-patterns-a-evitar)
12. [Testing](#testing)
13. [Deployment](#deployment)

---

## Stack Tecnológico

```json
{
  "core": {
    "vite": "^6.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.6.0"
  },
  "routing-data": {
    "@tanstack/react-router": "^1.98.0",
    "@tanstack/router-devtools": "^1.98.0",
    "@tanstack/react-query": "^5.62.0",
    "@tanstack/react-query-devtools": "^5.62.0"
  },
  "state": {
    "zustand": "^5.0.2"
  },
  "validation": {
    "zod": "^3.23.8"
  },
  "ui": {
    "tailwindcss": "^4.0.0",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5",
    "lucide-react": "^0.468.0"
  },
  "pwa": {
    "vite-plugin-pwa": "^0.21.1",
    "workbox-window": "^7.3.0"
  }
}
```

---

## Decisión de Arquitectura

### ✅ TanStack Router SPA (Elegida para PWA)

**Por qué SPA y no TanStack Start:**

- **PWA Support**: Service Workers funcionan mejor con SPA
- **Offline-first**: Datos estáticos cacheables
- **No server needed**: Deploy estático más simple
- **API directa**: Llamar GCBA API desde cliente (credenciales en env)

**Arquitectura:**

```txt
User → TanStack Router SPA → public/data/*.json (static)
                          → GCBA API (realtime)
                          → Service Worker (PWA)
```

**Trade-offs aceptados:**

- ✅ Credenciales API expuestas en bundle (aceptable para API pública de GCBA)
- ✅ No SSR (no afecta UX de esta app)
- ✅ Client-side only (mejor para PWA)

---

## Estructura del Proyecto (Feature-Based + Kebab-Case)

```txt
subte-tracker/
├── public/
│   ├── data/
│   │   ├── routes.json
│   │   ├── stops.json
│   │   ├── trips.json
│   │   ├── frequencies.json
│   │   ├── route-to-stops.json
│   │   └── tiempo-promedio-entre-estaciones.json
│   ├── manifest.json
│   ├── sw.js
│   └── icons/
│
├── src/
│   ├── features/                      # Feature-based organization
│   │   ├── lines/
│   │   │   ├── components/
│   │   │   │   ├── line-selector.tsx
│   │   │   │   ├── line-card.tsx
│   │   │   │   └── index.ts
│   │   │   ├── hooks/
│   │   │   │   └── use-routes-query.ts
│   │   │   ├── utils/
│   │   │   │   └── filter-lines.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── stops/
│   │   │   ├── components/
│   │   │   │   ├── stop-selector.tsx
│   │   │   │   ├── stop-list.tsx
│   │   │   │   ├── stop-search-input.tsx
│   │   │   │   └── index.ts
│   │   │   ├── hooks/
│   │   │   │   └── use-stops-query.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── directions/
│   │   │   ├── components/
│   │   │   │   ├── direction-selector.tsx
│   │   │   │   ├── direction-card.tsx
│   │   │   │   └── index.ts
│   │   │   ├── hooks/
│   │   │   │   └── use-directions-query.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── arrivals/
│   │   │   ├── components/
│   │   │   │   ├── arrivals-view.tsx
│   │   │   │   ├── arrivals-header.tsx
│   │   │   │   ├── arrivals-list.tsx
│   │   │   │   ├── arrival-card.tsx
│   │   │   │   ├── frequency-badge.tsx
│   │   │   │   ├── stop-line-view.tsx
│   │   │   │   ├── stop-line-item.tsx
│   │   │   │   └── index.ts
│   │   │   ├── hooks/
│   │   │   │   └── use-realtime-query.ts
│   │   │   ├── utils/
│   │   │   │   ├── calculate-arrivals.ts
│   │   │   │   ├── detect-breaks.ts
│   │   │   │   └── get-travel-time.ts
│   │   │   └── index.ts
│   │   │
│   │   └── search/
│   │       ├── components/
│   │       │   ├── search-bar.tsx
│   │       │   ├── search-input.tsx
│   │       │   ├── search-results.tsx
│   │       │   └── index.ts
│   │       ├── hooks/
│   │       │   └── use-search-query.ts
│   │       └── index.ts
│   │
│   ├── components/
│   │   ├── ui/                        # shadcn (kebab-case)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── badge.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/
│   │   │   ├── app-header.tsx
│   │   │   ├── app-footer.tsx
│   │   │   └── error-boundary.tsx
│   │   │
│   │   └── shared/
│   │       ├── loading-spinner.tsx
│   │       ├── loading-skeleton.tsx
│   │       ├── empty-state.tsx
│   │       ├── error-state.tsx
│   │       └── suspense-wrapper.tsx
│   │
│   ├── routes/
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   └── line/
│   │       └── $line-id/
│   │           └── $stop-id/
│   │               └── $direction-id.tsx
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── fetch-routes.ts
│   │   │   ├── fetch-stops.ts
│   │   │   ├── fetch-directions.ts
│   │   │   ├── fetch-realtime.ts
│   │   │   ├── fetch-search.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── query/
│   │   │   ├── query-client.ts
│   │   │   └── query-keys.ts
│   │   │
│   │   └── utils/
│   │       ├── cn.ts
│   │       ├── colors.ts
│   │       ├── time.ts
│   │       └── index.ts
│   │
│   ├── hooks/
│   │   ├── use-current-time.ts
│   │   └── use-debounced-value.ts
│   │
│   ├── stores/
│   │   ├── use-ui-store.ts
│   │   └── use-preferences-store.ts
│   │
│   ├── types/
│   │   ├── gtfs.ts
│   │   ├── domain.ts
│   │   ├── api.ts
│   │   ├── external.ts
│   │   └── index.ts
│   │
│   ├── schemas/
│   │   ├── gtfs-schema.ts
│   │   ├── api-schema.ts
│   │   └── index.ts
│   │
│   ├── constants/
│   │   └── index.ts
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   ├── app.tsx
│   ├── main.tsx
│   └── route-tree.gen.ts
│
├── scripts/
│   └── process-gtfs.ts
│
├── .env.example
├── components.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Convenciones de Código

### Naming

- **Archivos**: `kebab-case.ts` / `kebab-case.tsx`
- **Componentes**: `PascalCase` (pero archivo en kebab-case)
- **Funciones/variables**: `camelCase`
- **Types/Interfaces**: `PascalCase`
- **Constants**: `SCREAMING_SNAKE_CASE`

### Functions

- ✅ Usar **arrow functions** o **function declarations**
- ❌ **NO usar clases**

### Nombres

- ✅ Nombres **descriptivos y completos**
- ❌ Evitar abreviaciones ambiguas

### Comentarios

- ✅ Solo comentar **lógica compleja** o **edge cases**
- ❌ **NO comentar código obvio**
- ✅ Documentar **funciones críticas** (ej: algoritmo de break detection)

### Duplicación

- ✅ **DRY** (Don't Repeat Yourself)
- ✅ Extraer utilidades compartidas
- ✅ Reutilizar componentes

**Ejemplo:**

```typescript
// ✅ BIEN
export const calculateTotalTravelTime = (
  startStopId: string,
  endStopId: string,
  stopSequence: StopOnLine[],
  averageDurations: AverageDuration[]
): number | null => {
  // Solo comentar partes no obvias
  const startIndex = stopSequence.findIndex(s => s.stopId === startStopId);
  const endIndex = stopSequence.findIndex(s => s.stopId === endStopId);

  if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
    return null;
  }

  let totalDuration = 0;

  for (let i = startIndex; i < endIndex; i++) {
    const segment = averageDurations.find(
      d => d.from_stop_id === stopSequence[i].stopId &&
           d.to_stop_id === stopSequence[i + 1].stopId
    );

    if (!segment) return null;

    totalDuration += segment.average_duration_seconds;
  }

  return totalDuration;
};

// ❌ MAL - Comentarios innecesarios
export const calculateTotalTravelTime = (...) => {
  // Find the start index in the sequence
  const startIndex = stopSequence.findIndex(s => s.stopId === startStopId);
  // Find the end index in the sequence
  const endIndex = stopSequence.findIndex(s => s.stopId === endStopId);

  // Check if indices are valid
  if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
    // Return null if invalid
    return null;
  }
  // ...
};
```

---

## Definiciones de Tipos

### `src/types/gtfs.ts`

```typescript
export interface Stop {
  stop_id: string;
  stop_name: string;
  stop_lat?: string;
  stop_lon?: string;
  location_type?: string;
  parent_station?: string;
  wheelchair_boarding?: string;
}

export interface Route {
  route_id: string;
  agency_id?: string;
  route_short_name: string;
  route_long_name: string;
  route_type?: string;
  route_color?: string;
  route_text_color?: string;
}

export interface Trip {
  route_id: string;
  service_id: string;
  trip_id: string;
  trip_headsign?: string;
  direction_id: string;
  shape_id?: string;
}

export interface Frequency {
  trip_id: string;
  start_time: string;
  end_time: string;
  headway_secs: number;
  exact_times: number;
}
```

### `src/types/domain.ts`

```typescript
export interface StopOnLine {
  stopId: string;
  stopName: string;
  sequence: number;
}

export interface DirectionOption {
  stopId: string;
  lineId: string;
  selectedStopName: string;
  directionDisplayName: string;
  rawDirectionId: number;
}

export interface AverageDuration {
  from_stop_id: string;
  to_stop_id: string;
  average_duration_seconds: number;
  sample_size: number;
}

export interface LineAverageDurations {
  [lineShortName: string]: AverageDuration[];
}

export interface AverageDurationsData {
  lineAverageDurations: LineAverageDurations;
}

export type RouteToStopsData = Record<string, StopOnLine[]>;
```

### `src/types/api.ts`

```typescript
import type { Stop, Route } from './gtfs';
import type { StopOnLine } from './domain';

export interface SearchResult {
  stop: Stop;
  route: Route;
  direction: string;
  headsign: string;
}

export type ArrivalStatus = 'on-time' | 'delayed' | 'early' | 'unknown';

export interface ArrivalInfo {
  tripId: string;
  routeId: string;
  estimatedArrivalTime: number;
  delaySeconds: number;
  status: ArrivalStatus;
  departureTimeFromTerminal?: string;
  vehicleId?: string;
  isEstimate?: boolean;
}

export interface StopWithArrival extends StopOnLine {
  nextArrival?: {
    estimatedArrivalTime: number;
    delaySeconds: number;
    status: ArrivalStatus;
  };
}

export interface FrequencyInfo {
  startTime: string;
  endTime: string;
  headwaySeconds: number;
}

export interface RealtimeResponse {
  arrivals: ArrivalInfo[];
  lineStopsWithArrivals: StopWithArrival[];
  timestamp: number;
  frequency?: FrequencyInfo;
  shouldShowNoDataMessage?: boolean;
}
```

### `src/types/external.ts`

```typescript
export interface ExternalApiArrivalDepartureInfo {
  time?: number;
  delay?: number;
}

export interface ExternalApiStation {
  stop_id: string;
  stop_name: string;
  arrival?: ExternalApiArrivalDepartureInfo;
  departure?: ExternalApiArrivalDepartureInfo;
}

export interface ExternalApiTripLinea {
  Trip_Id: string;
  Route_Id: string;
  Direction_ID: number | string;
  start_time: string;
  start_date: string;
  Estaciones: ExternalApiStation[];
}

export interface ExternalApiEntity {
  ID: string;
  Linea: ExternalApiTripLinea;
}

export interface ExternalApiResponse {
  Header: {
    timestamp: number;
  };
  Entity: ExternalApiEntity[];
}
```

### `src/types/index.ts`

```typescript
export * from './gtfs';
export * from './domain';
export * from './api';
export * from './external';
```

---

## Configuración Inicial

### `package.json`

```json
{
  "name": "subte-tracker",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  },
  "dependencies": {
    "@tanstack/react-router": "^1.98.0",
    "@tanstack/router-devtools": "^1.98.0",
    "@tanstack/react-query": "^5.62.0",
    "@tanstack/react-query-devtools": "^5.62.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.2",
    "zod": "^3.23.8",
    "@radix-ui/react-alert": "^1.1.2",
    "@radix-ui/react-slot": "^1.1.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5",
    "lucide-react": "^0.468.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "@tanstack/router-vite-plugin": "^1.98.0",
    "typescript": "^5.6.0",
    "vite": "^6.0.0",
    "vite-plugin-pwa": "^0.21.1",
    "tailwindcss": "^4.0.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "eslint": "^9.17.0",
    "vitest": "^2.1.8",
    "workbox-window": "^7.3.0"
  }
}
```

### `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/**/*'],
      manifest: {
        name: '¿Dónde está el Subte?',
        short_name: 'Subte BA',
        description: 'Consulta arribos en tiempo real del subterráneo de Buenos Aires',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/apitransporte\.buenosaires\.gob\.ar\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'gcba-api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 30
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
```

### `.env.example`

```bash
VITE_SUBTE_API_CLIENT_ID=your_client_id_here
VITE_SUBTE_API_CLIENT_SECRET=your_client_secret_here
```

### `src/styles/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### `src/constants/index.ts`

```typescript
export const DWELL_TIME_SECONDS = 24;
export const MAX_ARRIVALS_TO_RETURN = 4;
export const LINES_WITH_VALID_REPORTS = new Set(['LineaA', 'LineaB', 'LineaE']);
export const ALLOWED_LINES = ['LineaA', 'LineaB', 'LineaE', 'LineaPM'];
```

---

## Features

### Feature: Lines

#### `src/features/lines/hooks/use-routes-query.ts`

```typescript
import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchRoutes } from '@/lib/api/fetch-routes';
import { queryKeys } from '@/lib/query/query-keys';

export const routesQueryOptions = queryOptions({
  queryKey: queryKeys.routes,
  queryFn: fetchRoutes,
  staleTime: Infinity,
  gcTime: Infinity,
});

export const useRoutesQuery = () => {
  return useQuery(routesQueryOptions);
};
```

#### `src/features/lines/components/line-selector.tsx`

```typescript
import { useSuspenseQuery } from '@tanstack/react-query';
import { routesQueryOptions } from '../hooks/use-routes-query';
import { LineCard } from './line-card';
import { filterAndSortLines } from '../utils/filter-lines';

export const LineSelector = () => {
  const { data: routes } = useSuspenseQuery(routesQueryOptions);
  const sortedRoutes = filterAndSortLines(routes);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedRoutes.map((route) => (
        <LineCard key={route.route_id} route={route} />
      ))}
    </div>
  );
};
```

#### `src/features/lines/components/line-card.tsx`

```typescript
import { Link } from '@tanstack/react-router';
import { Card } from '@/components/ui/card';
import { getTextColorForBackground } from '@/lib/utils/colors';
import type { Route } from '@/types';

interface LineCardProps {
  route: Route;
}

export const LineCard = ({ route }: LineCardProps) => {
  const bgColor = route.route_color || 'CCCCCC';
  const textColor = getTextColorForBackground(bgColor, route.route_text_color);

  return (
    <Link
      to="/line/$lineId"
      params={{ lineId: route.route_id }}
      className="block"
    >
      <Card
        className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
        style={{
          backgroundColor: `#${bgColor}`,
          color: textColor,
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-3xl font-bold">{route.route_short_name}</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">
              Línea {route.route_short_name}
            </h3>
            <p className="text-sm opacity-90">{route.route_long_name}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
};
```

#### `src/features/lines/utils/filter-lines.ts`

```typescript
import { ALLOWED_LINES } from '@/constants';
import type { Route } from '@/types';

export const filterAndSortLines = (routes: Route[]): Route[] => {
  const filtered = routes.filter(route => ALLOWED_LINES.includes(route.route_id));

  return filtered.sort((a, b) => {
    const order = ['A', 'B', 'E', 'PM'];
    const aIndex = order.indexOf(a.route_short_name);
    const bIndex = order.indexOf(b.route_short_name);

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.route_short_name.localeCompare(b.route_short_name);
  });
};
```

---

### Feature: Arrivals (Most Critical)

#### `src/features/arrivals/hooks/use-realtime-query.ts`

```typescript
import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchRealtime } from '@/lib/api/fetch-realtime';
import { queryKeys } from '@/lib/query/query-keys';

export const realtimeQueryOptions = (
  routeId: string,
  stopId: string,
  direction: string
) => queryOptions({
  queryKey: queryKeys.realtime(routeId, stopId, direction),
  queryFn: () => fetchRealtime(routeId, stopId, direction),
  staleTime: 0,
  refetchInterval: 15000,
  refetchIntervalInBackground: false,
  enabled: !!routeId && !!stopId && !!direction,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});

export const useRealtimeQuery = (
  routeId: string,
  stopId: string,
  direction: string
) => {
  return useQuery(realtimeQueryOptions(routeId, stopId, direction));
};
```

#### `src/features/arrivals/utils/calculate-arrivals.ts`

```typescript
import { DWELL_TIME_SECONDS, MAX_ARRIVALS_TO_RETURN, LINES_WITH_VALID_REPORTS } from '@/constants';
import type {
  ExternalApiResponse,
  RouteToStopsData,
  AverageDurationsData,
  Frequency,
  RealtimeResponse,
  ArrivalInfo,
  StopWithArrival,
  ArrivalStatus,
} from '@/types';
import { getTotalTravelTime } from './get-travel-time';
import { getCurrentFrequency } from './get-frequency';

export const calculateArrivals = (
  externalData: ExternalApiResponse,
  routeId: string,
  stopId: string,
  direction: string,
  routeToStops: RouteToStopsData,
  averageDurations: AverageDurationsData,
  frequencies: Frequency[]
): RealtimeResponse => {
  const headerTime = externalData.Header.timestamp;
  const directionKey = `${routeId}_${direction}`;
  const currentStopSequence = routeToStops[directionKey] || [];

  if (currentStopSequence.length === 0) {
    return {
      arrivals: [],
      lineStopsWithArrivals: [],
      timestamp: headerTime * 1000,
      shouldShowNoDataMessage: !LINES_WITH_VALID_REPORTS.has(routeId),
    };
  }

  const lineShortName = routeId.replace(/^Linea/, '');
  const targetDirectionIdNum = parseInt(direction, 10);
  const bestArrivalPerStopId = new Map<string, {
    estimatedArrivalTime: number;
    delaySeconds: number;
    status: ArrivalStatus;
  }>();

  externalData.Entity.forEach((entity) => {
    const tripInfo = entity.Linea;
    let tripDirectionIdNum: number | null = null;

    if (tripInfo.Direction_ID !== undefined && tripInfo.Direction_ID !== null) {
      const parsedNum = parseInt(String(tripInfo.Direction_ID), 10);
      if (!isNaN(parsedNum)) tripDirectionIdNum = parsedNum;
    }

    if (tripInfo.Route_Id === routeId && tripDirectionIdNum === targetDirectionIdNum) {
      tripInfo.Estaciones.forEach((station) => {
        if (station.arrival?.time) {
          const arrivalTime = station.arrival.time;
          const delay = station.arrival.delay ?? 0;

          let isValidReport: boolean;
          if (LINES_WITH_VALID_REPORTS.has(tripInfo.Route_Id)) {
            isValidReport = true;
          } else {
            isValidReport = delay > 0 || arrivalTime !== headerTime;
          }

          if (isValidReport) {
            const estimatedArrivalTime = headerTime + delay;

            if (estimatedArrivalTime >= headerTime - 60) {
              let status: ArrivalStatus = 'unknown';
              if (delay === 0) status = 'on-time';
              else if (delay < 0 && delay >= -180) status = 'early';
              else if (delay < -180 || delay > 180) status = 'delayed';

              const currentArrival = { estimatedArrivalTime, delaySeconds: delay, status };
              const existing = bestArrivalPerStopId.get(station.stop_id);

              if (!existing || currentArrival.estimatedArrivalTime < existing.estimatedArrivalTime) {
                bestArrivalPerStopId.set(station.stop_id, currentArrival);
              }
            }
          }
        }
      });
    }
  });

  const finalArrivals: ArrivalInfo[] = [];
  const targetStopIndex = currentStopSequence.findIndex(s => s.stopId === stopId);

  if (targetStopIndex === -1) {
    return {
      arrivals: [],
      lineStopsWithArrivals: [],
      timestamp: headerTime * 1000,
      shouldShowNoDataMessage: !LINES_WITH_VALID_REPORTS.has(routeId),
    };
  }

  const arrivalAtTarget = bestArrivalPerStopId.get(stopId);
  let lastRelevantArrivalTime = -Infinity;
  let tripIdForFrequency = '';

  if (arrivalAtTarget && arrivalAtTarget.estimatedArrivalTime > headerTime) {
    const sourceEntity = externalData.Entity.find(
      e => e.Linea.Route_Id === routeId &&
           parseInt(String(e.Linea.Direction_ID), 10) === targetDirectionIdNum &&
           e.Linea.Estaciones.some(s => s.stop_id === stopId)
    );

    if (sourceEntity?.Linea.Trip_Id) {
      tripIdForFrequency = sourceEntity.Linea.Trip_Id;
    }

    finalArrivals.push({
      ...arrivalAtTarget,
      tripId: sourceEntity?.ID || `REAL_${stopId}_${arrivalAtTarget.estimatedArrivalTime}`,
      routeId,
      departureTimeFromTerminal: sourceEntity?.Linea.start_time,
      vehicleId: sourceEntity?.ID,
      isEstimate: false,
    });

    lastRelevantArrivalTime = arrivalAtTarget.estimatedArrivalTime;
  }

  let lastSeenArrival = arrivalAtTarget ? arrivalAtTarget.estimatedArrivalTime : Infinity;
  const durationsForLine = averageDurations.lineAverageDurations[lineShortName];

  if (durationsForLine) {
    for (let N = 1; N <= targetStopIndex && finalArrivals.length < MAX_ARRIVALS_TO_RETURN; N++) {
      const currentIndex = targetStopIndex - N;
      const currentStop = currentStopSequence[currentIndex];
      const arrivalAtCurrentStop = bestArrivalPerStopId.get(currentStop.stopId);

      if (!arrivalAtCurrentStop || arrivalAtCurrentStop.estimatedArrivalTime <= headerTime) {
        lastSeenArrival = Infinity;
        continue;
      }

      if (arrivalAtCurrentStop.estimatedArrivalTime > lastSeenArrival) {
        const travelTime = getTotalTravelTime(
          currentStop.stopId,
          stopId,
          currentStopSequence,
          durationsForLine
        );

        if (travelTime !== null) {
          const dwellTime = N * DWELL_TIME_SECONDS;
          const projectedArrival = arrivalAtCurrentStop.estimatedArrivalTime + travelTime + dwellTime;

          if (projectedArrival > headerTime && projectedArrival > lastRelevantArrivalTime) {
            finalArrivals.push({
              status: arrivalAtCurrentStop.status,
              delaySeconds: arrivalAtCurrentStop.delaySeconds,
              tripId: `ESTIMATE_${N}_FROM_${currentStop.stopId}`,
              routeId,
              estimatedArrivalTime: projectedArrival,
              isEstimate: true,
            });

            lastRelevantArrivalTime = projectedArrival;
          }
        }
      }

      lastSeenArrival = arrivalAtCurrentStop.estimatedArrivalTime;
    }
  }

  finalArrivals.sort((a, b) => a.estimatedArrivalTime - b.estimatedArrivalTime);
  const limitedArrivals = finalArrivals.slice(0, MAX_ARRIVALS_TO_RETURN);

  const lineStopsWithArrivals: StopWithArrival[] = currentStopSequence.map(stop => ({
    stopId: stop.stopId,
    stopName: stop.stopName,
    sequence: stop.sequence,
    nextArrival: bestArrivalPerStopId.get(stop.stopId),
  }));

  let frequency = undefined;
  if (tripIdForFrequency) {
    const currentFreq = getCurrentFrequency(tripIdForFrequency, frequencies);
    if (currentFreq) {
      frequency = {
        startTime: currentFreq.start_time,
        endTime: currentFreq.end_time,
        headwaySeconds: currentFreq.headway_secs,
      };
    }
  }

  return {
    arrivals: limitedArrivals,
    lineStopsWithArrivals,
    timestamp: headerTime * 1000,
    frequency,
    shouldShowNoDataMessage: !LINES_WITH_VALID_REPORTS.has(routeId),
  };
};
```

#### `src/features/arrivals/utils/get-travel-time.ts`

```typescript
import type { StopOnLine, AverageDuration } from '@/types';

export const getTotalTravelTime = (
  startStopId: string,
  endStopId: string,
  stopSequence: StopOnLine[],
  averageDurations: AverageDuration[]
): number | null => {
  const startIndex = stopSequence.findIndex(s => s.stopId === startStopId);
  const endIndex = stopSequence.findIndex(s => s.stopId === endStopId);

  if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
    return null;
  }

  let totalDuration = 0;

  for (let i = startIndex; i < endIndex; i++) {
    const current = stopSequence[i];
    const next = stopSequence[i + 1];

    const segment = averageDurations.find(
      d => d.from_stop_id === current.stopId && d.to_stop_id === next.stopId
    );

    if (!segment) return null;

    totalDuration += segment.average_duration_seconds;
  }

  return totalDuration;
};
```

#### `src/features/arrivals/utils/get-frequency.ts`

```typescript
import type { Frequency } from '@/types';

export const getCurrentFrequency = (tripId: string, frequencies: Frequency[]): Frequency | null => {
  const now = new Date();
  const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  return frequencies.find(f => {
    if (f.trip_id !== tripId) return false;

    const startParts = f.start_time.split(':').map(Number);
    const endParts = f.end_time.split(':').map(Number);

    const startSeconds = startParts[0] * 3600 + startParts[1] * 60 + (startParts[2] || 0);
    const endSeconds = endParts[0] * 3600 + endParts[1] * 60 + (endParts[2] || 0);

    return currentSeconds >= startSeconds && currentSeconds <= endSeconds;
  }) || null;
};
```

---

## Utilidades Compartidas

### `src/lib/utils/colors.ts`

```typescript
export const isColorBright = (color: string): boolean => {
  const hex = color.replace('#', '');
  if (hex.length !== 6 && hex.length !== 3) return false;

  let r_hex: string, g_hex: string, b_hex: string;

  if (hex.length === 3) {
    r_hex = hex[0] + hex[0];
    g_hex = hex[1] + hex[1];
    b_hex = hex[2] + hex[2];
  } else {
    r_hex = hex.substring(0, 2);
    g_hex = hex.substring(2, 4);
    b_hex = hex.substring(4, 6);
  }

  const r = parseInt(r_hex, 16);
  const g = parseInt(g_hex, 16);
  const b = parseInt(b_hex, 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) return false;

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
};

export const getTextColorForBackground = (bgColor: string, textColor?: string): string => {
  const bright = isColorBright(bgColor);
  if (textColor) return `#${textColor}`;
  return bright ? '#000000' : '#FFFFFF';
};
```

### `src/lib/utils/time.ts`

```typescript
export const formatTime = (timestampInSeconds: number | undefined, includeSeconds = false): string => {
  if (timestampInSeconds === null || timestampInSeconds === undefined || isNaN(timestampInSeconds)) {
    return 'N/A';
  }

  const date = new Date(timestampInSeconds * 1000);
  if (isNaN(date.getTime())) return 'Hora Inválida';

  return date.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
  });
};

export const getTimeUntilArrival = (
  arrivalTimestampInSeconds: number | undefined,
  currentTime: Date
): string => {
  if (arrivalTimestampInSeconds === undefined || isNaN(arrivalTimestampInSeconds)) {
    return 'N/A';
  }

  const arrivalTimeMs = arrivalTimestampInSeconds * 1000;
  const diffMs = arrivalTimeMs - currentTime.getTime();
  const diffSecondsTotal = Math.round(diffMs / 1000);

  if (diffSecondsTotal <= 10) return 'Llegando';
  if (diffSecondsTotal < 0) return 'Llegando';
  if (diffSecondsTotal < 60) return '>1 min';

  const minutes = Math.ceil(diffSecondsTotal / 60);
  return `${minutes} min`;
};
```

### `src/lib/utils/cn.ts`

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};
```

### `src/hooks/use-current-time.ts`

```typescript
import { useState, useEffect } from 'react';

export const useCurrentTime = (updateInterval = 1000): Date => {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, updateInterval);

    return () => clearInterval(timer);
  }, [updateInterval]);

  return currentTime;
};
```

### `src/hooks/use-debounced-value.ts`

```typescript
import { useState, useEffect } from 'react';

export const useDebouncedValue = <T>(value: T, delay = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};
```

---

## API Client (Client-Side)

### `src/lib/api/fetch-realtime.ts`

```typescript
import type { RealtimeResponse } from '@/types';
import { calculateArrivals } from '@/features/arrivals/utils/calculate-arrivals';

export const fetchRealtime = async (
  routeId: string,
  stopId: string,
  direction: string
): Promise<RealtimeResponse> => {
  const CLIENT_ID = import.meta.env.VITE_SUBTE_API_CLIENT_ID;
  const CLIENT_SECRET = import.meta.env.VITE_SUBTE_API_CLIENT_SECRET;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('API credentials not configured');
  }

  const externalResponse = await fetch(
    `https://apitransporte.buenosaires.gob.ar/subtes/forecastGTFS?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`
  );

  if (!externalResponse.ok) {
    throw new Error(`External API error: ${externalResponse.status}`);
  }

  const externalData = await externalResponse.json();

  const [routeToStops, averageDurations, frequencies] = await Promise.all([
    fetch('/data/route-to-stops.json').then(r => r.json()),
    fetch('/data/tiempo-promedio-entre-estaciones.json').then(r => r.json()),
    fetch('/data/frequencies.json').then(r => r.json()),
  ]);

  return calculateArrivals(externalData, routeId, stopId, direction, routeToStops, averageDurations, frequencies);
};
```

### `src/lib/api/fetch-routes.ts`

```typescript
import { routesSchema } from '@/schemas/gtfs-schema';
import { ALLOWED_LINES } from '@/constants';
import type { Route } from '@/types';

export const fetchRoutes = async (): Promise<Route[]> => {
  const response = await fetch('/data/routes.json');
  const data = await response.json();
  const validated = routesSchema.parse(data);
  return validated.filter(route => ALLOWED_LINES.includes(route.route_id));
};
```

---

## PWA Configuration

### `public/manifest.json`

```json
{
  "name": "¿Dónde está el Subte?",
  "short_name": "Subte BA",
  "description": "Consulta arribos en tiempo real del subterráneo de Buenos Aires",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

---

## Secuencia de Implementación

### Fase 1: Setup (Día 1)

1. Crear proyecto Vite + React
2. Instalar dependencias
3. Configurar Tailwind + shadcn
4. Setup PWA plugin
5. Copiar datos GTFS a public/data/

### Fase 2: Core Utils (Día 2)

1. Crear tipos en `src/types/`
2. Crear schemas en `src/schemas/`
3. Crear utils (colors, time, cn)
4. Crear hooks (use-current-time, use-debounced-value)
5. Crear constants

### Fase 3: Features (Día 3-7)

1. **Lines feature** (día 3)
2. **Stops feature** (día 4)
3. **Directions feature** (día 5)
4. **Arrivals feature** (día 6-7) - más complejo
5. **Search feature** (día 7)

### Fase 4: Routes & Layout (Día 8)

1. Configurar TanStack Router
2. Crear routes
3. Crear layout components
4. Integrar features

### Fase 5: Polish & PWA (Día 9-10)

1. Error boundaries
2. Loading states
3. PWA testing
4. Offline support
5. Deploy

---

## Anti-Patterns a Evitar

### ❌ NO: useEffect para data fetching

```typescript
// MAL
const [data, setData] = useState(null);
useEffect(() => {
  fetch('/api').then(r => r.json()).then(setData);
}, []);

// BIEN
const { data } = useQuery({ queryKey: ['data'], queryFn: fetchData });
```

### ❌ NO: Clases

```typescript
// MAL
class Calculator { ... }

// BIEN
const calculateTotal = (a: number, b: number) => a + b;
```

### ❌ NO: Código duplicado

```typescript
// MAL - duplicado en varios archivos
const bright = (color.r + color.g + color.b) / 3 > 127;

// BIEN - utilidad compartida
import { isColorBright } from '@/lib/utils/colors';
```

---

## Testing

```typescript
// src/features/arrivals/utils/__tests__/calculate-arrivals.test.ts
import { describe, it, expect } from 'vitest';
import { getTotalTravelTime } from '../get-travel-time';

describe('getTotalTravelTime', () => {
  it('should calculate total travel time correctly', () => {
    const result = getTotalTravelTime(/* ... */);
    expect(result).toBe(expectedDuration);
  });
});
```

---

## Deployment

### Vercel

```bash
vercel
```

### Netlify

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Checklist Final

- [ ] Todos los archivos en kebab-case
- [ ] Feature-based organization
- [ ] Solo arrow functions / function declarations
- [ ] Nombres descriptivos
- [ ] Sin comentarios innecesarios
- [ ] Sin código duplicado
- [ ] PWA funcional
- [ ] Solo líneas A, B, E con datos
- [ ] Algoritmo de arribos preservado
- [ ] Deploy exitoso

---
