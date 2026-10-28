import React, { useState } from 'react';
import { NavigationTab } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TheoryDrawer } from './components/TheoryDrawer';
import { OverviewPage } from './pages/OverviewPage';
import { CpuSchedulingPage } from './pages/CpuSchedulingPage';
import { ProducerConsumerPage } from './pages/ProducerConsumerPage';
import { BankerPage } from './pages/BankerPage';
import { MemoryPage } from './pages/MemoryPage';
import { IntegratedPipelinePage } from './pages/IntegratedPipelinePage';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);
  const [resetKey, setResetKey] = useState<number>(0);

  const handleResetAll = () => {
    setResetKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDocs={() => setIsDocsOpen(true)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          activeTab={activeTab}
          onResetAll={handleResetAll}
          onOpenDocs={() => setIsDocsOpen(true)}
        />

        <main className="flex-1 pb-16">
          <React.Fragment key={resetKey}>
            {activeTab === 'overview' && (
              <OverviewPage onNavigate={setActiveTab} />
            )}
            {activeTab === 'cpu-scheduling' && <CpuSchedulingPage />}
            {activeTab === 'producer-consumer' && <ProducerConsumerPage />}
            {activeTab === 'banker' && <BankerPage />}
            {activeTab === 'memory' && <MemoryPage />}
            {activeTab === 'integrated' && <IntegratedPipelinePage />}
          </React.Fragment>
        </main>
      </div>

      {/* Theory & Docs Side Drawer */}
      <TheoryDrawer isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
    </div>
  );
}
