
import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Group, Line } from 'react-konva';
import { useStore } from '../store';
import { PIXELS_PER_METER, GRID_SIZE } from '../constants';
import { CatalogItem, PlacedItem } from '../types';
import { RotateCcw, Trash2, Copy } from 'lucide-react';

interface Props {
  snapEnabled: boolean;
}

export const EditorCanvas: React.FC<Props> = ({ snapEnabled }) => {
  const { locations, currentLocationId, selectedId, setSelectedId, updatePlacedItem, addItemToLayout, removePlacedItem, catalog, categories } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const currentLocation = locations.find(l => l.id === currentLocationId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && currentLocationId) {
        e.preventDefault();
        removePlacedItem(currentLocationId, selectedId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, currentLocationId, removePlacedItem]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  if (!currentLocation) return (
    <div className="flex-1 flex items-center justify-center bg-slate-100 text-slate-400">請選擇一個地點開始規劃</div>
  );

  const floorWidthPx = currentLocation.floorPlan.width * PIXELS_PER_METER;
  const floorDepthPx = currentLocation.floorPlan.depth * PIXELS_PER_METER;
  const offsetX = (dimensions.width - floorWidthPx) / 2;
  const offsetY = (dimensions.height - floorDepthPx) / 2;

  const renderGrid = () => {
    if (!snapEnabled) return null;
    
    const lines = [];
    const color = '#f1f5f9'; // Subtle grid line
    const accentColor = '#e2e8f0'; // Every 1 meter line

    // Vertical grid lines
    for (let i = 0; i <= currentLocation.floorPlan.width; i += GRID_SIZE) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i * PIXELS_PER_METER, 0, i * PIXELS_PER_METER, floorDepthPx]}
          stroke={i % 1 === 0 ? accentColor : color}
          strokeWidth={1}
          listening={false}
        />
      );
    }

    // Horizontal grid lines
    for (let i = 0; i <= currentLocation.floorPlan.depth; i += GRID_SIZE) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i * PIXELS_PER_METER, floorWidthPx, i * PIXELS_PER_METER]}
          stroke={i % 1 === 0 ? accentColor : color}
          strokeWidth={1}
          listening={false}
        />
      );
    }
    
    return lines;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!stageRef.current) return;
    const itemData = e.dataTransfer.getData('catalogItem');
    if (!itemData) return;

    const item: CatalogItem = JSON.parse(itemData);
    const category = categories.find(c => c.id === item.categoryId);
    const stage = stageRef.current;
    stage.setPointersPositions(e);
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;

    const layerX = pointerPos.x - offsetX;
    const layerY = pointerPos.y - offsetY;
    let relativeX = (layerX / PIXELS_PER_METER) - (item.widthM / 2);
    let relativeY = (layerY / PIXELS_PER_METER) - (item.depthM / 2);

    if (snapEnabled) {
      relativeX = Math.round(relativeX / GRID_SIZE) * GRID_SIZE;
      relativeY = Math.round(relativeY / GRID_SIZE) * GRID_SIZE;
    }

    const newItem: PlacedItem = {
      instanceId: `inst-${Date.now()}`,
      catalogItemId: item.id,
      x: relativeX,
      y: relativeY,
      rotation: 0,
      nameSnapshot: item.name,
      skuSnapshot: item.sku,
      widthMSnapshot: item.widthM,
      depthMSnapshot: item.depthM,
      priceSnapshot: item.price,
      categoryNameSnapshot: category?.name || '未分類'
    };

    addItemToLayout(currentLocation.id, newItem);
    setSelectedId(newItem.instanceId);
  };

  const onDragEnd = (instanceId: string, e: any) => {
    let x = e.target.x() / PIXELS_PER_METER;
    let y = e.target.y() / PIXELS_PER_METER;
    if (snapEnabled) {
      x = Math.round(x / GRID_SIZE) * GRID_SIZE;
      y = Math.round(y / GRID_SIZE) * GRID_SIZE;
    }
    updatePlacedItem(currentLocationId!, instanceId, { x, y });
  };

  return (
    <div 
      className="flex-1 relative bg-slate-100 overflow-hidden outline-none" 
      ref={containerRef}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => setSelectedId(null)}
      tabIndex={0}
    >
      <Stage ref={stageRef} width={dimensions.width} height={dimensions.height}>
        <Layer x={offsetX} y={offsetY}>
          {/* Floor background */}
          <Rect width={floorWidthPx} height={floorDepthPx} fill="white" cornerRadius={4} shadowBlur={10} shadowOpacity={0.05} />
          
          {/* Grid lines */}
          {renderGrid()}

          {/* Floor border - set to not intercepting to allow drag/drop on background */}
          <Rect width={floorWidthPx} height={floorDepthPx} stroke="#94a3b8" strokeWidth={2} listening={false} />
          
          {currentLocation.items.map((pi) => {
            const isSelected = selectedId === pi.instanceId;
            const catItem = catalog.find(c => c.id === pi.catalogItemId);
            const color = catItem?.color || '#94a3b8';
            const w = pi.widthMSnapshot * PIXELS_PER_METER;
            const h = pi.depthMSnapshot * PIXELS_PER_METER;

            return (
              <Group
                key={pi.instanceId}
                x={pi.x * PIXELS_PER_METER}
                y={pi.y * PIXELS_PER_METER}
                rotation={pi.rotation}
                draggable
                onDragEnd={(e) => onDragEnd(pi.instanceId, e)}
                onClick={(e) => { e.cancelBubble = true; setSelectedId(pi.instanceId); }}
              >
                <Rect width={w} height={h} fill={color} opacity={0.7} cornerRadius={2} stroke={isSelected ? '#3b82f6' : '#1e293b'} strokeWidth={isSelected ? 3 : 1} />
                <Text text={pi.nameSnapshot} fontSize={10} fill="white" width={w} align="center" padding={2} wrap="none" ellipsis fontStyle="bold" />
              </Group>
            );
          })}
        </Layer>
      </Stage>
      {selectedId && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white p-3 rounded-2xl shadow-2xl border flex items-center gap-4 animate-in slide-in-from-bottom-4 z-20">
           <div className="border-r pr-4">
             <h4 className="text-sm font-bold text-slate-800">{currentLocation.items.find(i => i.instanceId === selectedId)?.nameSnapshot}</h4>
             <p className="text-[10px] text-slate-500 uppercase">當前選取物件</p>
           </div>
           <div className="flex gap-2">
             <button onClick={() => {
               const item = currentLocation.items.find(i => i.instanceId === selectedId);
               if (item) updatePlacedItem(currentLocation.id, item.instanceId, { rotation: (item.rotation + 90) % 360 });
             }} className="p-2 hover:bg-slate-100 rounded-lg flex flex-col items-center gap-1">
               <RotateCcw className="w-4 h-4 text-slate-600" /><span className="text-[9px] font-medium">旋轉</span>
             </button>
             <button onClick={() => removePlacedItem(currentLocation.id, selectedId)} className="p-2 hover:bg-red-50 rounded-lg flex flex-col items-center gap-1 group">
               <Trash2 className="w-4 h-4 text-red-500" /><span className="text-[9px] font-medium text-red-500">刪除</span>
             </button>
           </div>
         </div>
      )}
    </div>
  );
};
