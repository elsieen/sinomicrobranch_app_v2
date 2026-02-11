
export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface CatalogItem {
  id: string;
  categoryId: string;
  name: string;
  sku: string;
  widthM: number; // in meters
  depthM: number; // in meters
  price: number;
  notes?: string;
  color: string;
  isActive: boolean;
}

export interface PlacedItem {
  instanceId: string;
  catalogItemId: string;
  x: number; 
  y: number;
  rotation: number;
  // Snapshots for stability
  nameSnapshot: string;
  skuSnapshot: string;
  widthMSnapshot: number;
  depthMSnapshot: number;
  priceSnapshot: number;
  categoryNameSnapshot: string;
}

export interface FloorPlan {
  width: number;
  depth: number;
  points: { x: number; y: number }[];
}

export interface LocationProject {
  id: string;
  name: string;
  address: string;
  notes: string;
  budget: number;
  floorPlan: FloorPlan;
  items: PlacedItem[];
  lastModified: number;
}

export interface AppState {
  locations: LocationProject[];
  categories: Category[];
  catalog: CatalogItem[];
  currentLocationId: string | null;
  selectedId: string | null;
  history: { locations: LocationProject[], categories: Category[], catalog: CatalogItem[] }[];
  historyIndex: number;
}
