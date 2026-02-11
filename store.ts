
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LocationProject, CatalogItem, PlacedItem, AppState, Category } from './types';
import { INITIAL_CATALOG, INITIAL_LOCATION, INITIAL_CATEGORIES } from './constants';

interface AppStore extends AppState {
  // Actions
  addLocation: (location: Partial<LocationProject>) => void;
  updateLocation: (id: string, updates: Partial<LocationProject>) => void;
  duplicateLocation: (id: string) => void;
  deleteLocation: (id: string) => void;
  setCurrentLocation: (id: string | null) => void;
  setSelectedId: (id: string | null) => void;
  
  // Catalog Management
  addCategory: (name: string) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (id: string, direction: 'up' | 'down') => void;
  
  addCatalogItem: (item: Omit<CatalogItem, 'id' | 'isActive'>) => void;
  updateCatalogItem: (id: string, updates: Partial<CatalogItem>, syncExisting?: boolean) => void;
  deleteCatalogItem: (id: string) => void;
  duplicateCatalogItem: (id: string) => void;

  // Layout Actions
  addItemToLayout: (locationId: string, item: PlacedItem) => void;
  updatePlacedItem: (locationId: string, instanceId: string, updates: Partial<PlacedItem>) => void;
  removePlacedItem: (locationId: string, instanceId: string) => void;
  
  // History
  saveHistory: () => void;
  undo: () => void;
  redo: () => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      locations: [INITIAL_LOCATION],
      categories: INITIAL_CATEGORIES,
      catalog: INITIAL_CATALOG,
      currentLocationId: INITIAL_LOCATION.id,
      selectedId: null,
      history: [{ locations: [INITIAL_LOCATION], categories: INITIAL_CATEGORIES, catalog: INITIAL_CATALOG }],
      historyIndex: 0,

      saveHistory: () => {
        const { locations, categories, catalog, history, historyIndex } = get();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
          locations: locations.map(l => ({ ...l, items: [...l.items] })),
          categories: [...categories],
          catalog: [...catalog]
        });
        
        if (newHistory.length > 50) newHistory.shift();
        set({ history: newHistory, historyIndex: newHistory.length - 1 });
      },

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          const entry = history[newIndex];
          set({ 
            locations: entry.locations, 
            categories: entry.categories,
            catalog: entry.catalog,
            historyIndex: newIndex,
            selectedId: null
          });
        }
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          const entry = history[newIndex];
          set({ 
            locations: entry.locations, 
            categories: entry.categories,
            catalog: entry.catalog,
            historyIndex: newIndex,
            selectedId: null
          });
        }
      },

      addLocation: (data) => {
        const newLoc: LocationProject = {
          id: `loc-${Date.now()}`,
          name: data.name || 'New Location',
          address: data.address || '',
          notes: data.notes || '',
          budget: data.budget || 50000,
          floorPlan: data.floorPlan || { width: 10, depth: 8, points: [] },
          items: [],
          lastModified: Date.now()
        };
        set(state => ({ 
          locations: [...state.locations, newLoc],
          currentLocationId: newLoc.id,
          selectedId: null
        }));
        get().saveHistory();
      },

      duplicateLocation: (id) => {
        const target = get().locations.find(l => l.id === id);
        if (!target) return;
        const newLoc: LocationProject = {
          ...target,
          id: `loc-${Date.now()}`,
          name: `${target.name} (Copy)`,
          lastModified: Date.now(),
          items: target.items.map(i => ({ ...i, instanceId: `inst-${Date.now()}-${Math.random()}` }))
        };
        set(state => ({ 
          locations: [...state.locations, newLoc],
          currentLocationId: newLoc.id,
          selectedId: null
        }));
        get().saveHistory();
      },

      updateLocation: (id, updates) => {
        set(state => ({
          locations: state.locations.map(l => l.id === id ? { ...l, ...updates, lastModified: Date.now() } : l)
        }));
        get().saveHistory();
      },

      deleteLocation: (id) => {
        set(state => {
          const newLocations = state.locations.filter(l => l.id !== id);
          return {
            locations: newLocations,
            currentLocationId: state.currentLocationId === id ? (newLocations[0]?.id || null) : state.currentLocationId,
            selectedId: null
          };
        });
        get().saveHistory();
      },

      setCurrentLocation: (id) => set({ currentLocationId: id, selectedId: null }),
      setSelectedId: (id) => set({ selectedId: id }),

      // Catalog Management
      addCategory: (name) => {
        const { categories } = get();
        const newCat: Category = {
          id: `cat-${Date.now()}`,
          name,
          order: categories.length + 1
        };
        set({ categories: [...categories, newCat] });
        get().saveHistory();
      },

      updateCategory: (id, updates) => {
        set(state => ({
          categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c)
        }));
        get().saveHistory();
      },

      deleteCategory: (id) => {
        const { catalog } = get();
        const hasItems = catalog.some(i => i.categoryId === id);
        if (hasItems) {
          alert('此類別尚有物品，無法刪除。請先移動物品至其他類別。');
          return;
        }
        set(state => ({
          categories: state.categories.filter(c => c.id !== id)
        }));
        get().saveHistory();
      },

      reorderCategories: (id, direction) => {
        const { categories } = get();
        const index = categories.findIndex(c => c.id === id);
        if (index === -1) return;
        const newCats = [...categories];
        if (direction === 'up' && index > 0) {
          [newCats[index], newCats[index - 1]] = [newCats[index - 1], newCats[index]];
        } else if (direction === 'down' && index < newCats.length - 1) {
          [newCats[index], newCats[index + 1]] = [newCats[index + 1], newCats[index]];
        }
        set({ categories: newCats.map((c, i) => ({ ...c, order: i + 1 })) });
        get().saveHistory();
      },

      addCatalogItem: (item) => {
        const newItem: CatalogItem = {
          ...item,
          id: `c-${Date.now()}`,
          isActive: true
        };
        set(state => ({ catalog: [...state.catalog, newItem] }));
        get().saveHistory();
      },

      updateCatalogItem: (id, updates, syncExisting = false) => {
        set(state => {
          const newCatalog = state.catalog.map(i => i.id === id ? { ...i, ...updates } : i);
          let newLocations = state.locations;

          if (syncExisting) {
            const updatedItem = newCatalog.find(i => i.id === id);
            const categoryName = state.categories.find(c => c.id === updatedItem?.categoryId)?.name || '未分類';
            if (updatedItem) {
              newLocations = state.locations.map(loc => ({
                ...loc,
                items: loc.items.map(pi => pi.catalogItemId === id ? {
                  ...pi,
                  nameSnapshot: updatedItem.name,
                  skuSnapshot: updatedItem.sku,
                  widthMSnapshot: updatedItem.widthM,
                  depthMSnapshot: updatedItem.depthM,
                  priceSnapshot: updatedItem.price,
                  categoryNameSnapshot: categoryName
                } : pi)
              }));
            }
          }
          return { catalog: newCatalog, locations: newLocations };
        });
        get().saveHistory();
      },

      deleteCatalogItem: (id) => {
        const isUsed = get().locations.some(l => l.items.some(pi => pi.catalogItemId === id));
        if (isUsed) {
          if (confirm('此物件已在佈局中使用，將會被隱藏（停用）而非刪除，現有佈局不受影響。確定嗎？')) {
            get().updateCatalogItem(id, { isActive: false });
          }
          return;
        }
        set(state => ({ catalog: state.catalog.filter(i => i.id !== id) }));
        get().saveHistory();
      },

      duplicateCatalogItem: (id) => {
        const target = get().catalog.find(i => i.id === id);
        if (!target) return;
        get().addCatalogItem({
          ...target,
          name: `${target.name} (複製)`,
          sku: `${target.sku}-copy`
        });
      },

      // Layout
      addItemToLayout: (locationId, item) => {
        set(state => ({
          locations: state.locations.map(l => 
            l.id === locationId ? { ...l, items: [...l.items, item], lastModified: Date.now() } : l
          )
        }));
        get().saveHistory();
      },

      updatePlacedItem: (locationId, instanceId, updates) => {
        set(state => ({
          locations: state.locations.map(l => 
            l.id === locationId ? { 
              ...l, 
              items: l.items.map(i => i.instanceId === instanceId ? { ...i, ...updates } : i),
              lastModified: Date.now()
            } : l
          )
        }));
        get().saveHistory();
      },

      removePlacedItem: (locationId, instanceId) => {
        set(state => ({
          locations: state.locations.map(l => 
            l.id === locationId ? { 
              ...l, 
              items: l.items.filter(i => i.instanceId !== instanceId),
              lastModified: Date.now() 
            } : l
          ),
          selectedId: state.selectedId === instanceId ? null : state.selectedId
        }));
        get().saveHistory();
      }
    }),
    { name: 'micro-branch-planner-v2-storage' }
  )
);
