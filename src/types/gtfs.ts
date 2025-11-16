export type Stop = {
  stop_id: string;
  stop_name: string;
  stop_lat?: string;
  stop_lon?: string;
  location_type?: string;
  parent_station?: string;
  wheelchair_boarding?: string;
};

export type Route = {
  route_id: string;
  agency_id?: string;
  route_short_name: string;
  route_long_name: string;
  route_type?: string;
  route_color?: string;
  route_text_color?: string;
};

export type Trip = {
  route_id: string;
  service_id: string;
  trip_id: string;
  trip_headsign?: string;
  direction_id: string;
  shape_id?: string;
};

export type Frequency = {
  trip_id: string;
  start_time: string;
  end_time: string;
  headway_secs: number;
  exact_times: number;
};
