
import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  Plus, 
  MapPin, 
  Undo2, 
  Redo2, 
  Copy, 
  Trash2, 
  Settings2,
  ChevronDown,
  Building2,
  Grid3X3,
  BookOpen
} from 'lucide-react';
import { CatalogManager } from './CatalogManager';

export const TopHeader: React.FC<{ snapEnabled: boolean; setSnapEnabled: (v: boolean) => void }> = ({ snapEnabled, setSnapEnabled }) => {
  const { 
    locations, 
    currentLocationId, 
    setCurrentLocation, 
    addLocation, 
    duplicateLocation, 
    deleteLocation,
    updateLocation,
    undo,
    redo,
    historyIndex,
    history
  } = useStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  const currentLocation = locations.find(l => l.id === currentLocationId);

  const handleCreateNew = () => {
    addLocation({ name: '新微型分行專案' });
    setIsDropdownOpen(false);
  };

  const handleDuplicate = () => {
    if (currentLocationId) {
      duplicateLocation(currentLocationId);
      setIsDropdownOpen(false);
    }
  };

  const handleDelete = () => {
    if (currentLocationId && window.confirm('確定要刪除此分行地點嗎？所有佈局資料將遺失。')) {
      deleteLocation(currentLocationId);
      setIsDropdownOpen(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 z-30 shadow-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 pr-6 border-r">
          <img src="unnamed.jpg" alt="Logo" className="h-8 w-auto object-contain rounded-md" />
          <h1 className="text-lg font-black text-slate-800 tracking-tight whitespace-nowrap">Sino Micro-branch</h1>
        </div>

        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 rounded-xl transition-colors group"
          >
            <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">當前專案</span>
              <span className="text-sm font-bold text-slate-800">{currentLocation?.name || '請選擇地點'}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
              <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95">
                <div className="max-h-60 overflow-y-auto mb-2 px-1">
                  {locations.map(loc => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        setCurrentLocation(loc.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl mb-1 flex items-center justify-between transition-all ${
                        loc.id === currentLocationId 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className={`w-4 h-4 ${loc.id === currentLocationId ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className="text-sm font-semibold">{loc.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{loc.items.length} 個項目</span>
                    </button>
                  ))}
                </div>
                
                <div className="border-t pt-2 mt-1 space-y-1">
                  <button 
                    onClick={handleCreateNew}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    建立新分行地點
                  </button>
                  <button 
                    onClick={handleDuplicate}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    複製當前佈局
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    刪除此地點
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsCatalogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all text-sm font-bold border border-blue-100"
        >
          <BookOpen className="w-4 h-4" />
          物件庫管理
        </button>

        <div className="h-8 w-px bg-slate-200 mx-2" />

        <button 
          onClick={() => setSnapEnabled(!snapEnabled)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
            snapEnabled 
              ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
          }`}
          title="自動對齊網格"
        >
          <Grid3X3 className="w-4 h-4" />
          <span>對齊網格: {snapEnabled ? '開啟' : '關閉'}</span>
        </button>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button 
            disabled={historyIndex <= 0}
            onClick={undo}
            className="p-2 hover:bg-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            title="復原 (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4 text-slate-600" />
          </button>
          <button 
            disabled={historyIndex >= history.length - 1}
            onClick={redo}
            className="p-2 hover:bg-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            title="重做 (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {currentLocation && (
          <div className="relative">
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors text-sm font-bold shadow-lg"
            >
              <Settings2 className="w-4 h-4" />
              地點設定
            </button>
            
            {isSettingsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsSettingsOpen(false)} />
                <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-6 animate-in fade-in slide-in-from-top-2">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">分行配置設定</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">分行名稱</label>
                      <input 
                        type="text" 
                        value={currentLocation.name}
                        onChange={(e) => updateLocation(currentLocation.id, { name: e.target.value })}
                        className="w-full p-2 bg-slate-50 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">平面尺寸 (公尺)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-400">寬度 (Width)</span>
                          <input 
                            type="number" 
                            value={currentLocation.floorPlan.width}
                            onChange={(e) => updateLocation(currentLocation.id, { floorPlan: { ...currentLocation.floorPlan, width: Number(e.target.value) } })}
                            className="w-full p-2 bg-slate-50 border rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400">深度 (Depth)</span>
                          <input 
                            type="number" 
                            value={currentLocation.floorPlan.depth}
                            onChange={(e) => updateLocation(currentLocation.id, { floorPlan: { ...currentLocation.floorPlan, depth: Number(e.target.value) } })}
                            className="w-full p-2 bg-slate-50 border rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">配置預算 ($)</label>
                      <input 
                        type="number" 
                        value={currentLocation.budget}
                        onChange={(e) => updateLocation(currentLocation.id, { budget: Number(e.target.value) })}
                        className="w-full p-2 bg-slate-50 border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <CatalogManager isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} />
    </header>
  );
};
