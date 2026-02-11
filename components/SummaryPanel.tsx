
import React from 'react';
import { useStore } from '../store';
import { Download, PieChart, Wallet, ShoppingCart, TrendingDown, TrendingUp, Trash2, List, Settings } from 'lucide-react';

export const SummaryPanel: React.FC = () => {
  const { locations, currentLocationId, selectedId, setSelectedId, removePlacedItem } = useStore();
  const currentLocation = locations.find(l => l.id === currentLocationId);

  if (!currentLocation) return <div className="w-80 border-l bg-slate-50" />;

  const placedItems = currentLocation.items;
  const selectedItem = placedItems.find(i => i.instanceId === selectedId);

  const totalCost = placedItems.reduce((sum, i) => sum + i.priceSnapshot, 0);
  const totalAreaM2 = currentLocation.floorPlan.width * currentLocation.floorPlan.depth;
  const usedAreaM2 = placedItems.reduce((sum, i) => sum + (i.widthMSnapshot * i.depthMSnapshot), 0);
  const utilizationPercent = Math.min(100, Math.round((usedAreaM2 / totalAreaM2) * 100));

  const bom = placedItems.reduce((acc: any, curr) => {
    const sku = curr.skuSnapshot;
    if (!acc[sku]) {
      acc[sku] = {
        name: curr.nameSnapshot,
        price: curr.priceSnapshot,
        qty: 0,
        subtotal: 0,
        category: curr.categoryNameSnapshot
      };
    }
    acc[sku].qty += 1;
    acc[sku].subtotal += curr.priceSnapshot;
    return acc;
  }, {});

  const exportBOM = () => {
    const headers = ['SKU 編號', '項目名稱', '類別', '單價', '數量', '小計'];
    const rows = Object.entries(bom).map(([sku, data]: [string, any]) => [
      sku, data.name, data.category, data.price, data.qty, data.subtotal
    ]);
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `物料清單_${currentLocation.name}.csv`;
    link.click();
  };

  const isOverBudget = totalCost > currentLocation.budget;

  return (
    <div className="w-80 h-full bg-white border-l flex flex-col shadow-sm overflow-y-auto scrollbar-hide">
      {selectedItem && (
        <div className="p-4 bg-slate-900 text-white animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 mb-3 text-blue-400">
            <Settings className="w-4 h-4" /><h3 className="text-xs font-bold uppercase tracking-widest">選取項目屬性</h3>
          </div>
          <div className="space-y-3">
            <div><div className="text-[10px] text-slate-400 font-bold">項目名稱</div><div className="text-sm font-bold">{selectedItem.nameSnapshot}</div></div>
            <div className="grid grid-cols-2 gap-2">
              <div><div className="text-[10px] text-slate-400 font-bold">X 座標</div><div className="text-sm font-mono">{selectedItem.x.toFixed(2)}m</div></div>
              <div><div className="text-[10px] text-slate-400 font-bold">Y 座標</div><div className="text-sm font-mono">{selectedItem.y.toFixed(2)}m</div></div>
            </div>
            <button onClick={() => removePlacedItem(currentLocation.id, selectedItem.instanceId)} className="w-full flex items-center justify-center gap-2 py-2 bg-red-500 text-white rounded-lg text-xs font-bold mt-2"><Trash2 className="w-4 h-4" />刪除此物件</button>
          </div>
        </div>
      )}

      <div className="p-4 border-b">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><PieChart className="w-5 h-5 text-blue-600" />分行數據統計</h2>
        <div className={`p-4 rounded-2xl ${isOverBudget ? 'bg-red-50' : 'bg-blue-50'}`}>
          <div className="text-xs font-semibold text-slate-500 uppercase">總預估成本</div>
          <div className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-blue-700'}`}>${totalCost.toLocaleString()}</div>
          <div className="text-[10px] mt-2 flex justify-between">
            <span>預算: ${currentLocation.budget.toLocaleString()}</span>
            <span className={isOverBudget ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
              {isOverBudget ? `超支 $${(totalCost - currentLocation.budget).toLocaleString()}` : `餘額 $${(currentLocation.budget - totalCost).toLocaleString()}`}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 border-b bg-slate-50/50 flex-1 overflow-y-auto">
        <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 mb-3"><List className="w-3 h-3" />已放置物件清單</h3>
        <div className="space-y-1">
          {placedItems.map(item => (
            <div key={item.instanceId} onClick={() => setSelectedId(item.instanceId)} className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border ${selectedId === item.instanceId ? 'bg-blue-50 border-blue-200' : 'bg-white border-transparent hover:border-slate-200'}`}>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-slate-700 truncate">{item.nameSnapshot}</div>
                <div className="text-[9px] text-slate-400 font-mono">({item.x.toFixed(1)}, {item.y.toFixed(1)})</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); removePlacedItem(currentLocation.id, item.instanceId); }} className="p-1 hover:bg-red-50 rounded text-slate-300 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-white border-t">
        <div className="flex items-center justify-between mb-3"><h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><ShoppingCart className="w-3 h-3" />物料清單 (BOM)</h3><button onClick={exportBOM} className="text-blue-600 p-1 rounded-lg hover:bg-blue-50"><Download className="w-4 h-4" /></button></div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {Object.entries(bom).map(([sku, data]: [string, any]) => (
            <div key={sku} className="flex justify-between items-start border-b border-slate-50 pb-1">
              <div className="flex-1"><h4 className="text-[11px] font-bold text-slate-800">{data.name}</h4><p className="text-[9px] text-slate-400 font-mono">{sku}</p></div>
              <div className="text-right"><span className="text-[9px] font-bold bg-slate-100 px-1 rounded text-slate-600">x{data.qty}</span><div className="text-[11px] font-bold text-slate-800">${data.subtotal.toLocaleString()}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
