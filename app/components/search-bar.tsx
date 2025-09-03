'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Tag, Plus } from 'lucide-react';

interface SearchBarProps {
  onSearch: (tags: string[]) => void;
  searchTags: string[];
}

export function SearchBar({ onSearch, searchTags }: SearchBarProps) {
  const [searchInput, setSearchInput] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/images/tags');
        const result = await response.json();
        if (result.success) {
          setAvailableTags(result.tags);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchTags();
  }, []);

  const handleSearch = () => {
    if (searchInput.trim()) {
      const newTags = searchInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      const allTags = Array.from(new Set([...searchTags, ...newTags]));
      onSearch(allTags);
      setSearchInput('');
      setShowSuggestions(false);
    }
  };

  const addTag = (tag: string) => {
    if (!searchTags.includes(tag)) {
      onSearch([...searchTags, tag]);
    }
    setSearchInput('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onSearch(searchTags.filter(tag => tag !== tagToRemove));
  };

  const clearSearch = () => {
    onSearch([]);
    setSearchInput('');
    setShowSuggestions(false);
  };

  const filteredSuggestions = availableTags.filter(tag => 
    tag.toLowerCase().includes(searchInput.toLowerCase()) && 
    !searchTags.includes(tag)
  );

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Barra di ricerca */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
            <Input
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Cerca per tag..."
              className="pl-10 bg-white/80 border-blue-200/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={!searchInput.trim()}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl px-4 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Suggerimenti */}
        {showSuggestions && searchInput && filteredSuggestions.length > 0 && (
          <div className="absolute z-20 w-full mt-2 bg-white/95 backdrop-blur-sm border border-blue-200/50 rounded-xl shadow-xl max-h-48 overflow-y-auto">
            {filteredSuggestions.slice(0, 6).map((tag, index) => (
              <div
                key={index}
                className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition-colors"
                onClick={() => addTag(tag)}
              >
                <Tag className="h-3 w-3 text-blue-500" />
                <span className="text-sm text-slate-700">{tag}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tag attivi */}
      {searchTags.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Filtri attivi</span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearSearch}
              className="text-slate-500 hover:text-slate-700 h-6 px-2"
            >
              <X className="h-3 w-3 mr-1" />
              Pulisci
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchTags.map((tag, index) => (
              <Badge 
                key={index} 
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-full px-3 py-1 cursor-pointer group"
              >
                {tag}
                <X
                  className="ml-2 h-3 w-3 opacity-70 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Tag popolari */}
      {searchTags.length === 0 && availableTags.length > 0 && (
        <div className="flex-1 space-y-4">
          <h3 className="text-sm font-medium text-slate-700">Tag popolari</h3>
          <div className="grid grid-cols-1 gap-2">
            {availableTags.slice(0, 8).map((tag, index) => (
              <button
                key={index}
                onClick={() => addTag(tag)}
                className="text-left p-3 bg-white/80 hover:bg-blue-50 border border-blue-100/50 hover:border-blue-200 rounded-xl transition-all hover-lift text-sm text-slate-600 hover:text-blue-600"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}