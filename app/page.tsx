'use client';
import { useState } from 'react';
import { UploadDialog } from './components/upload-dialog';
import { SearchBar } from './components/search-bar';
import { ImageGrid } from './components/image-grid';
import { Upload, Search, Image as ImageIcon, Sparkles } from 'lucide-react';
import NextImage from 'next/image';

export default function Home() {
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-white via-blue-50/30 to-blue-100/20 overflow-hidden">
      {/* Header minimalista */}
      <header className="glass border-b border-blue-100/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group">
                  <NextImage
                    src="/SkillPower.svg"
                    alt="SkillPower"
                    width={32}
                    height={32}
                    className="h-8 w-8 text-white"
                  />
              </div>
              <div>
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                  SkillPower Gallery
                </h1>
                <p className="text-sm text-slate-500 hidden sm:block">
                  Gestione intelligente delle immagini
                </p>
              </div>
            </div>

            <UploadDialog onUploadComplete={handleUploadComplete} />
          </div>
        </div>
      </header>

      {/* Layout principale fullscreen */}
      <div className="h-[calc(100vh-80px)] flex flex-col lg:flex-row">
        {/* Sidebar sinistra - Search */}
        <div className="lg:w-80 xl:w-96 bg-white/60 backdrop-blur-sm border-r border-blue-100/50 flex flex-col">
          <div className="p-6 border-b border-blue-100/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                <Search className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Ricerca</h2>
                <p className="text-sm text-slate-500">Filtra per tag</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <SearchBar onSearch={setSearchTags} searchTags={searchTags} />
          </div>
        </div>

        {/* Area principale - Griglia immagini */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-white/80 to-blue-50/40">
          <div className="p-6 border-b border-blue-100/50 bg-white/40 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                  <ImageIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    {searchTags.length > 0 ? 'Risultati' : 'Collezione'}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {searchTags.length > 0 
                      ? `${searchTags.length} filtri attivi` 
                      : 'Tutte le immagini'
                    }
                  </p>
                </div>
              </div>
              
              {searchTags.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse-soft"></div>
                  <span className="text-sm font-medium text-blue-700">
                    Filtrato
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <ImageGrid searchTags={searchTags} refreshTrigger={refreshTrigger} />
          </div>
        </div>

        {/* Sidebar destra - Info/Stats */}
        <div className="hidden xl:flex xl:w-80 bg-white/60 backdrop-blur-sm border-l border-blue-100/50 flex-col">
          <div className="p-6 border-b border-blue-100/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Info</h2>
                <p className="text-sm text-slate-500">Dettagli sistema</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-6 space-y-6">
            {/* Stats cards */}
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-2xl p-4 border border-blue-200/30">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">100×100</div>
                  <div className="text-xs text-blue-500 uppercase tracking-wide">Formato Ottimale</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-2xl p-4 border border-slate-200/30">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-600 mb-1">PNG/ICO</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Multi Formato</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-2xl p-4 border border-blue-200/30">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">16-512px</div>
                  <div className="text-xs text-blue-500 uppercase tracking-wide">Dimensioni</div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Funzionalità</h3>
              
              <div className="flex items-center gap-3 p-3 bg-white/80 rounded-xl border border-blue-100/50">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-slate-600">Upload sicuro</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/80 rounded-xl border border-blue-100/50">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-slate-600">Ricerca intelligente</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/80 rounded-xl border border-blue-100/50">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-slate-600">Conversione avanzata</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}