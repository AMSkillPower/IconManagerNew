'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Plus, ImageIcon, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface UploadDialogProps {
  onUploadComplete: () => void;
}

export function UploadDialog({ onUploadComplete }: UploadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
        if (img.width === 100 && img.height === 100) {
          setValidationStatus('valid');
          resolve(true);
        } else {
          setValidationStatus('invalid');
          resolve(false);
        }
      };
      img.onerror = () => {
        setValidationStatus('invalid');
        resolve(false);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const sanitizeFileName = (fileName: string) => fileName.replace(/_\d+x\d+/, '');

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (!droppedFile.type.startsWith('image/')) return;
      const isValid = await validateImage(droppedFile);
      if (isValid) setFile(droppedFile);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const selectedFile = e.target.files[0];
    const isValid = await validateImage(selectedFile);
    if (isValid) setFile(selectedFile);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || tags.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      const sanitizedFile = new File([file], sanitizeFileName(file.name), { type: file.type });
      formData.append('image', sanitizedFile);
      formData.append('tags', tags.join(','));

      const res = await fetch('/api/images/upload', { method: 'POST', body: formData });
      const result = await res.json();

      if (result.success) {
        setFile(null); 
        setTags([]); 
        setTagInput(''); 
        setImageDimensions(null); 
        setValidationStatus('idle');
        setIsOpen(false);
        onUploadComplete();
      }
    } catch {
      console.error('Errore durante l\'upload');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setTags([]);
    setTagInput('');
    setImageDimensions(null);
    setValidationStatus('idle');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl px-6 py-2.5">
          <Upload className="h-4 w-4 mr-2"/>
          Carica
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-lg p-0 rounded-3xl shadow-2xl overflow-hidden bg-white border-blue-200/50">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-blue-50 to-blue-100/50 border-b border-blue-200/30">
          <DialogTitle className="text-xl font-semibold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
              <Upload className="h-5 w-5 text-white" />
            </div>
            Carica Immagine
          </DialogTitle>
          <p className="text-sm text-slate-600 mt-2">Solo immagini 100×100 pixel</p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Drag & Drop Area */}
          <div
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 relative overflow-hidden
              ${dragActive 
                ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100/50 scale-[1.02]' 
                : validationStatus === 'valid'
                  ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50'
                  : validationStatus === 'invalid'
                    ? 'border-red-400 bg-gradient-to-br from-red-50 to-pink-50'
                    : 'border-blue-200 hover:border-blue-300 bg-gradient-to-br from-blue-50/30 to-white hover:shadow-lg'
            }`}
            onDragEnter={handleDrag} 
            onDragLeave={handleDrag} 
            onDragOver={handleDrag} 
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              onChange={handleFileSelect} 
              className="hidden"
            />
            
            {file ? (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center">
                  {validationStatus === 'valid' ? (
                    <CheckCircle className="h-8 w-8 text-green-500"/>
                  ) : validationStatus === 'invalid' ? (
                    <AlertCircle className="h-8 w-8 text-red-500"/>
                  ) : (
                    <ImageIcon className="h-8 w-8 text-blue-500"/>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-slate-800">{sanitizeFileName(file.name)}</p>
                  {imageDimensions && (
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <span className={`px-3 py-1 rounded-full font-medium ${
                        validationStatus === 'valid' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {imageDimensions.width}×{imageDimensions.height}px
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                        {(file.size/1024).toFixed(1)} KB
                      </span>
                    </div>
                  )}
                  {validationStatus === 'invalid' && (
                    <p className="text-sm text-red-600 font-medium">
                      L'immagine deve essere 100×100 pixel
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center animate-float">
                  <Upload className="h-8 w-8 text-blue-500"/>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-slate-700">
                    Trascina o clicca per selezionare
                  </p>
                  <p className="text-sm text-slate-500">
                    Solo immagini 100×100 px • PNG, JPG, GIF
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tags Section */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              Tag dell'immagine
            </Label>
            
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Input 
                  value={tagInput} 
                  onChange={e => setTagInput(e.target.value)}
                  placeholder="Aggiungi un tag..." 
                  className="pr-12 bg-white/80 border-blue-200/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl"
                  onKeyPress={e => {
                    if(e.key === 'Enter'){
                      e.preventDefault(); 
                      addTag();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={addTag}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-blue-500 hover:bg-blue-50 rounded-lg"
                  disabled={!tagInput.trim()}
                >
                  <Plus className="h-4 w-4"/>
                </Button>
              </div>
            </div>
            
            {/* Tags display */}
            {tags.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50/50 to-white p-4 rounded-2xl border border-blue-100/30">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-slate-700">Tag aggiunti:</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                    {tags.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((t, i) => (
                    <Badge 
                      key={i} 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-full px-3 py-1 text-sm flex items-center gap-2 transition-all duration-200"
                    >
                      {t} 
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-200 transition-colors" 
                        onClick={() => removeTag(t)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottoni */}
          <div className="flex justify-end gap-3 pt-4 border-t border-blue-100/30">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="px-6 py-2 border-blue-200/50 text-slate-700 hover:bg-blue-50 rounded-xl"
            >
              Annulla
            </Button>
            <Button 
              type="submit" 
              disabled={isUploading || !file || tags.length === 0 || validationStatus !== 'valid'}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Caricamento...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4"/>
                  Carica
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}