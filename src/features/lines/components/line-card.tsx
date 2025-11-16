import { Link } from "@tanstack/react-router";

import type { Route } from "@/types";

import { Card } from "@/components/ui/card";
import { getTextColorForBackground } from "@/lib/utils/colors";

type LineCardProps = {
  route: Route;
};

export const LineCard = ({ route }: LineCardProps) => {
  const bgColor = route.route_color || "CCCCCC";
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
              Línea
              {" "}
              {route.route_short_name}
            </h3>
            <p className="text-sm opacity-90">{route.route_long_name}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
};
