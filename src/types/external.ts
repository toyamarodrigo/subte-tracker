export type ExternalApiArrivalDepartureInfo = {
  time?: number;
  delay?: number;
};

export type ExternalApiStation = {
  stop_id: string;
  stop_name: string;
  arrival?: ExternalApiArrivalDepartureInfo;
  departure?: ExternalApiArrivalDepartureInfo;
};

export type ExternalApiTripLinea = {
  Trip_Id: string;
  Route_Id: string;
  Direction_ID: number | string;
  start_time: string;
  start_date: string;
  Estaciones: ExternalApiStation[];
};

export type ExternalApiEntity = {
  ID: string;
  Linea: ExternalApiTripLinea;
};

export type ExternalApiResponse = {
  Header: {
    timestamp: number;
  };
  Entity: ExternalApiEntity[];
};
