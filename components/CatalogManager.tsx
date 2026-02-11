
import React, { useState } from 'react';
import { useStore } from '../store';
import { Category, CatalogItem } from '../types';
import { X, Plus, Trash2, Edit2, Copy, ArrowUp, ArrowDown, Save, Search, AlertCircle, Check } from 'lucide-react';

export const CatalogManager: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { categories, catalog, addCategory, updateCategory, deleteCategory, reorderCategories, addCatalogItem, updateCatalogItem, deleteCatalogItem, duplicateCatalogItem } = useStore();
  const [activeTab, setActiveTab] = useState<'categories' | 'items'>('items');
  const [itemSearch, setItemSearch] = useState('');
  
  // Create Form State
  const [isCreating, setIsCreating] = useState(false);
  const [newForm, setNewForm] = useState({
    name: '',
    sku: '',
    categoryId: '',
    widthM: 1.0,
    depthM: 1.0,
    price: 1000,
    color: '#3b82f6'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!newForm.name.trim()) newErrors.name = '請輸入名稱';
    if (!newForm.categoryId) newErrors.categoryId = '請選擇類別';
    if (newForm.widthM <= 0) newErrors.widthM = '寬度必須大於 0';
    if (newForm.depthM <= 0) newErrors.depthM = '深度必須大於 0';
    if (newForm.price < 0) newErrors.price = '價格不能為負數';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenCreate = () => {
    if (categories.length === 0) {
      alert('請先建立類別');
      return;
    }
    setNewForm({
      name: '',
      sku: 'SKU-' + Date.now().toString().slice(-4),
      categoryId: categories[0]?.id || '',
      widthM: 1.0,
      depthM: 1.0,
      price: 1000,
      color: '#3b82f6'
    });
    setErrors({});
    setIsCreating(true);
  };

  const handleSaveNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    addCatalogItem({
      categoryId: newForm.categoryId,
      name: newForm.name,
      sku: newForm.sku || ('SKU-' + Math.random().toString(36).substr(2, 4).toUpperCase()),
      widthM: Number(newForm.widthM),
      depthM: Number(newForm.depthM),
      price: Number(newForm.price),
      color: newForm.color
    });

    setIsCreating(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const filteredItems = catalog.filter(i => 
    i.name.toLowerCase().includes(itemSearch.toLowerCase()) || 
    i.sku.toLowerCase().includes(itemSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 z-[60] animate-in slide-in-from-top-4">
          <Check className="w-5 h-5" />
          <span className="font-bold">模組已成功建立！</span>
        </div>
      )}

      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">物件庫管理</h2>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => { setActiveTab('items'); setIsCreating(false); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'items' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                模組清單
              </button>
              <button 
                onClick={() => { setActiveTab('categories'); setIsCreating(false); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'categories' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                類別設定
              </button>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'categories' ? (
            <div className="space-y-4 max-w-2xl mx-auto">
              <button 
                onClick={() => {
                  const name = prompt('請輸入類別名稱:');
                  if (name) addCategory(name);
                }}
                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all font-bold"
              >
                <Plus className="w-5 h-5" />
                新增類別
              </button>
              <div className="space-y-2">
                {categories.sort((a, b) => a.order - b.order).map((cat, idx) => (
                  <div key={cat.id} className="flex items-center gap-3 p-4 bg-slate-50 border rounded-2xl group">
                    <span className="text-xs font-black text-slate-300 w-6">#{cat.order}</span>
                    <input 
                      type="text" 
                      value={cat.name}
                      onChange={(e) => updateCategory(cat.id, { name: e.target.value })}
                      className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-slate-700"
                    />
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => reorderCategories(cat.id, 'up')} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-blue-500"><ArrowUp className="w-4 h-4" /></button>
                      <button onClick={() => reorderCategories(cat.id, 'down')} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-blue-500"><ArrowDown className="w-4 h-4" /></button>
                      <button onClick={() => deleteCategory(cat.id)} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Toolbar */}
              {!isCreating && (
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="搜尋名稱或 SKU..." 
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500"
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={handleOpenCreate}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                  >
                    <Plus className="w-5 h-5" />
                    新增模組
                  </button>
                </div>
              )}

              {/* Create Form Section */}
              {isCreating && (
                <div className="bg-slate-50 border-2 border-blue-100 rounded-3xl p-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-top-4">
                  <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-600" />
                    建立新模組項目
                  </h3>
                  <form onSubmit={handleSaveNewItem} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">模組名稱 *</label>
                        <input 
                          type="text" 
                          placeholder="例如：多功能櫃檯"
                          className={`w-full p-3 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors.name ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                          value={newForm.name}
                          onChange={(e) => setNewForm({...newForm, name: e.target.value})}
                        />
                        {errors.name && <p className="text-[10px] text-red-500 mt-1 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">SKU 編號</label>
                        <input 
                          type="text" 
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none"
                          value={newForm.sku}
                          onChange={(e) => setNewForm({...newForm, sku: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">類別 *</label>
                        <select 
                          className={`w-full p-3 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none ${errors.categoryId ? 'border-red-500' : 'border-slate-200'}`}
                          value={newForm.categoryId}
                          onChange={(e) => setNewForm({...newForm, categoryId: e.target.value})}
                        >
                          <option value="">請選擇類別...</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        {errors.categoryId && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.categoryId}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">寬度 (M)</label>
                        <input 
                          type="number" step="0.1"
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm"
                          value={newForm.widthM}
                          onChange={(e) => setNewForm({...newForm, widthM: Number(e.target.value)})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">深度 (M)</label>
                        <input 
                          type="number" step="0.1"
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm"
                          value={newForm.depthM}
                          onChange={(e) => setNewForm({...newForm, depthM: Number(e.target.value)})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">預估單價 ($)</label>
                        <input 
                          type="number"
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm"
                          value={newForm.price}
                          onChange={(e) => setNewForm({...newForm, price: Number(e.target.value)})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">色彩標識</label>
                        <div className="flex items-center gap-3">
                          <input 
                            type="color" 
                            className="w-full h-11 p-1 bg-white border border-slate-200 rounded-xl cursor-pointer"
                            value={newForm.color}
                            onChange={(e) => setNewForm({...newForm, color: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                      <button 
                        type="button"
                        onClick={() => setIsCreating(false)}
                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                      >
                        取消
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <Save className="w-5 h-5" />
                        儲存模組
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Grid of Items */}
              {!isCreating && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map(item => (
                    <div key={item.id} className={`p-4 border rounded-3xl transition-all ${item.isActive ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 border-slate-200 grayscale opacity-60'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <input 
                            type="text" 
                            value={item.name}
                            onChange={(e) => updateCatalogItem(item.id, { name: e.target.value })}
                            className="w-full text-base font-black text-slate-800 bg-transparent border-none p-0 focus:ring-0"
                          />
                          <div className="flex items-center gap-2 mt-1">
                            <input 
                              type="text" 
                              value={item.sku}
                              onChange={(e) => updateCatalogItem(item.id, { sku: e.target.value })}
                              className="text-[10px] font-mono text-slate-400 uppercase bg-transparent border-none p-0 focus:ring-0 w-24"
                            />
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => duplicateCatalogItem(item.id)} title="複製" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><Copy className="w-4 h-4" /></button>
                          <button onClick={() => deleteCatalogItem(item.id)} title="刪除" className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">類別</label>
                          <select 
                            value={item.categoryId}
                            onChange={(e) => updateCatalogItem(item.id, { categoryId: e.target.value })}
                            className="w-full text-xs font-bold bg-slate-50 border-none rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                          >
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">價格</label>
                          <input 
                            type="number" 
                            value={item.price}
                            onChange={(e) => updateCatalogItem(item.id, { price: Number(e.target.value) })}
                            className="w-full text-xs font-bold bg-slate-50 border-none rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">寬度 (M)</label>
                          <input 
                            type="number" step="0.1"
                            value={item.widthM}
                            onChange={(e) => updateCatalogItem(item.id, { widthM: Number(e.target.value) })}
                            className="w-full text-xs font-bold bg-slate-50 border-none rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">深度 (M)</label>
                          <input 
                            type="number" step="0.1"
                            value={item.depthM}
                            onChange={(e) => updateCatalogItem(item.id, { depthM: Number(e.target.value) })}
                            className="w-full text-xs font-bold bg-slate-50 border-none rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                           <input 
                            type="color" 
                            value={item.color}
                            onChange={(e) => updateCatalogItem(item.id, { color: e.target.value })}
                            className="w-6 h-6 rounded-md border-none cursor-pointer"
                          />
                          <span className="text-[10px] font-bold text-slate-400">顏色標識</span>
                        </div>
                        <button 
                          onClick={() => {
                            if (confirm('更新現有佈局中的所有該項目實例？此操作不可逆。')) {
                              updateCatalogItem(item.id, {}, true);
                            }
                          }}
                          className="text-[10px] font-black text-blue-500 hover:text-blue-700 underline"
                        >
                          套用至現有佈局
                        </button>
                      </div>
                    </div>
                  ))}

                  {filteredItems.length === 0 && !isCreating && (
                    <div className="col-span-full py-20 text-center">
                      <div className="text-slate-300 mb-2">
                        <Search className="w-12 h-12 mx-auto opacity-20" />
                      </div>
                      <p className="text-sm font-bold text-slate-400">找不到相符的模組</p>
                      <button onClick={handleOpenCreate} className="mt-4 text-blue-600 text-sm font-black hover:underline">立即建立一個？</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
