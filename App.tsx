
import React, { useState } from 'react';
import { TopHeader } from './components/TopHeader';
import { CatalogSidebar } from './components/CatalogSidebar';
import { EditorCanvas } from './components/EditorCanvas';
import { SummaryPanel } from './components/SummaryPanel';

const App: React.FC = () => {
  const [snapEnabled, setSnapEnabled] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50">
      {/* Top toolbar and location manager */}
      <TopHeader snapEnabled={snapEnabled} setSnapEnabled={setSnapEnabled} />

      <main className="flex-1 flex overflow-hidden">
        {/* Left sidebar: Draggable modules */}
        <CatalogSidebar />

        {/* Center: Visual editor */}
        <div className="flex-1 flex flex-col relative">
          <EditorCanvas snapEnabled={snapEnabled} />
        </div>

        {/* Right sidebar: Real-time cost & BOM */}
        <SummaryPanel />
      </main>
      
      {/* Footer / Status bar */}
      <footer className="h-8 bg-white border-t border-slate-200 px-4 flex items-center justify-between text-[10px] font-medium text-slate-400 uppercase tracking-widest z-30">
        <div className="flex gap-4">
          <span>Sino Micro-branch 標準模組系統 v1.5.0</span>
          <span>系統狀態: <span className="text-emerald-500 font-bold">運行良好</span></span>
        </div>
        <div>
          資料已自動儲存至瀏覽器本地空間
        </div>
      </footer>
    </div>
  );
};

export default App;
