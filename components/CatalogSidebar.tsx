
import React, { useState } from 'react';
import { useStore } from '../store';
import { CatalogItem } from '../types';
import { Search, Package, PlusCircle, LayoutGrid, Info } from 'lucide-react';

export const CatalogSidebar: React.FC = () => {
  const { catalog, categories } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | '全部'>('全部');

  const filteredItems = catalog.filter(item => {
    if (!item.isActive) return false;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryId === '全部' || item.categoryId === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  const onDragStart = (e: React.DragEvent, item: CatalogItem) => {
    e.dataTransfer.setData('catalogItem', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-80 h-full bg-white border-r flex flex-col shadow-sm z-10">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
          <Package className="w-5 h-5 text-blue-600" />
          標準模組目錄
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="搜尋名稱或 SKU 編號..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="px-4 py-2 border-b flex gap-1 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setSelectedCategoryId('全部')}
          className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selectedCategoryId === '全部' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-slate-50 text-slate-500 hover:bg-slate-200'
          }`}
        >
          全部
        </button>
        {categories.sort((a, b) => a.order - b.order).map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategoryId(cat.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedCategoryId === cat.id 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-slate-50 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredItems.map(item => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => onDragStart(e, item)}
            className="group relative p-3 border border-slate-200 rounded-xl bg-white hover:border-blue-400 hover:shadow-md cursor-grab active:cursor-grabbing transition-all"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider">
                {categories.find(c => c.id === item.categoryId)?.name || '未分類'}
              </span>
              <span className="text-xs font-bold text-blue-600">${item.price.toLocaleString()}</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-800">{item.name}</h3>
            <p className="text-[10px] text-slate-500 mt-1">
              SKU: {item.sku} • 尺寸: {item.widthM}m x {item.depthM}m
            </p>
            
            <div 
              className="mt-2 w-full h-1.5 rounded-full opacity-50"
              style={{ backgroundColor: item.color }}
            />

            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-blue-500 text-white p-1 rounded-full shadow-lg">
                <PlusCircle className="w-3 h-3" />
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-10">
            <LayoutGrid className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-medium">找不到相符項目</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50 text-[11px] text-slate-400 flex items-center gap-2">
        <Info className="w-3 h-3" />
        <span>將項目拖曳至畫布即可放置</span>
      </div>
    </div>
  );
};
