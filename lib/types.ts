export type VehicleBrand = "ford" | "lincoln" | "other";
export type VehicleCondition = "new" | "used" | "cpo";
export type VehicleStatus = "in_stock" | "in_transit" | "sold" | "hidden";
export type LeadType = "sales" | "service" | "finance" | "trade";
export type LeadStage = "new" | "contacted" | "appointment" | "proposal" | "sold" | "lost";

export type Vehicle = {
  id: string;
  vin: string | null;
  stock_number: string | null;
  brand: VehicleBrand;
  condition: VehicleCondition;
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  body_style: string | null;
  drivetrain: string | null;
  engine: string | null;
  transmission: string | null;
  fuel: string | null;
  mpg_city: number | null;
  mpg_hwy: number | null;
  mileage: number | null;
  exterior_color: string | null;
  interior_color: string | null;
  status: VehicleStatus;
  msrp: number | null;
  internet_price: number | null;
  discount: number | null;
  incentives: unknown;
  features: unknown;
  description: string | null;
  source_url: string | null;
  source_site: string | null;
  vehicle_images?: VehicleImage[];
  vehicle_ratings?: VehicleRating[];
};

export type VehicleImage = {
  id: string;
  vehicle_id: string;
  url: string;
  alt: string | null;
  sort_order: number;
};

export type VehicleRating = {
  id: string;
  vehicle_id: string;
  source: string;
  score: number | null;
  rating_count: number | null;
};
