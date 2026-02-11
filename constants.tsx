
import { CatalogItem, Category, LocationProject } from './types';

export const PIXELS_PER_METER = 50;
export const GRID_SIZE = 0.5;

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: '櫃檯服務站', order: 1 },
  { id: 'cat-2', name: '自助服務區', order: 2 },
  { id: 'cat-3', name: '辦公傢俱', order: 3 },
  { id: 'cat-4', name: '廣告看板', order: 4 },
  { id: 'cat-5', name: '安防監控', order: 5 },
  { id: 'cat-6', name: '科技電力', order: 6 },
  { id: 'cat-7', name: '空間裝飾', order: 7 },
];

export const INITIAL_CATALOG: CatalogItem[] = [
  { id: 'c1', categoryId: 'cat-1', name: '標準櫃檯辦公桌', widthM: 1.8, depthM: 0.8, price: 1200, sku: 'TL-001', color: '#3b82f6', isActive: true },
  { id: 'c2', categoryId: 'cat-2', name: '快捷 ATM 自動櫃員機', widthM: 0.8, depthM: 0.8, price: 4500, sku: 'ATM-E1', color: '#10b981', isActive: true },
  { id: 'c3', categoryId: 'cat-3', name: '客戶等候椅', widthM: 0.6, depthM: 0.6, price: 250, sku: 'CH-W02', color: '#f59e0b', isActive: true },
  { id: 'c4', categoryId: 'cat-4', name: '數位分行地圖導覽螢幕', widthM: 1.2, depthM: 0.1, price: 1800, sku: 'DS-B01', color: '#8b5cf6', isActive: true },
  { id: 'c5', categoryId: 'cat-6', name: '安全平板互動支架', widthM: 0.4, depthM: 0.4, price: 450, sku: 'TS-S99', color: '#ef4444', isActive: true },
];

export const INITIAL_LOCATION: LocationProject = {
  id: 'loc-1',
  name: '中山北路快捷分行',
  address: '台北市中山區中山北路二段 123 號',
  notes: '高流量區域的小坪數示範分行模型。',
  budget: 25000,
  floorPlan: { width: 8, depth: 6, points: [] },
  items: [
    { 
      instanceId: 'inst-1', 
      catalogItemId: 'c1', 
      x: 1, y: 1, rotation: 0,
      nameSnapshot: '標準櫃檯辦公桌',
      skuSnapshot: 'TL-001',
      widthMSnapshot: 1.8,
      depthMSnapshot: 0.8,
      priceSnapshot: 1200,
      categoryNameSnapshot: '櫃檯服務站'
    },
    { 
      instanceId: 'inst-2', 
      catalogItemId: 'c2', 
      x: 6, y: 1, rotation: 90,
      nameSnapshot: '快捷 ATM 自動櫃員機',
      skuSnapshot: 'ATM-E1',
      widthMSnapshot: 0.8,
      depthMSnapshot: 0.8,
      priceSnapshot: 4500,
      categoryNameSnapshot: '自助服務區'
    },
  ],
  lastModified: Date.now()
};
