"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Eye,
  Clock,
  FileImage,
  Image as ImageIcon,
} from "lucide-react";

interface ImageItem {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  tags: string[];
  uploadDate: string;
}

interface ImageGridProps {
  searchTags: string[];
  refreshTrigger: number;
}

export function ImageGrid({ searchTags, refreshTrigger }: ImageGridProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<string>("png");
  const [downloadSize, setDownloadSize] = useState<string>("100");
  const [quickDownloadFormat, setQuickDownloadFormat] = useState<string>("png");

  const sizes = [
    { value: "8", label: "8x8" },
    { value: "16", label: "16x16" },
    { value: "24", label: "24x24" },
    { value: "32", label: "32x32" },
    { value: "40", label: "40x40" },
    { value: "48", label: "48x48" },
    { value: "56", label: "56x56" },
    { value: "64", label: "64x64" },
    { value: "72", label: "72x72" },
    { value: "80", label: "80x80" },
    { value: "88", label: "88x88" },
    { value: "96", label: "96x96" },
    { value: "100", label: "100x100" },
  ];

  const formats = [
    { value: "png", label: "PNG" },
    { value: "bmp", label: "BMP" },
    { value: "ico", label: "ICO" },
    { value: "svg", label: "SVG" },
  ];

  const fetchImages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTags.length > 0) params.append("tags", searchTags.join(","));
      const res = await fetch(`/api/images/search?${params}`);
      const result = await res.json();
      if (result.success) setImages(result.images);
      else console.error(result.error || "Errore caricamento immagini");
    } catch {
      console.error("Errore caricamento immagini");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [searchTags.join(","), refreshTrigger]);

  const handleDownload = async (
    imageId: string,
    originalName: string,
    format?: string,
    size?: string
  ) => {
    try {
      const f = format || quickDownloadFormat;
      const s = size || "100";
      const params = new URLSearchParams({ id: imageId, format: f, size: s });
      const res = await fetch(`/api/images/download?${params}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
        a.download = `${nameWithoutExt}_${s}x${s}.${f}`;
        a.href = url;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else console.error("Errore durante il download");
    } catch {
      console.error("Errore durante il download");
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("it-IT", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatFileSize = (b: number) => {
    if (b === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return `${(b / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (loading)
    return (
      <div className="h-full p-6">
        <div className="grid-responsive h-full">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-blue-100/50 aspect-square rounded-2xl"
            />
          ))}
        </div>
      </div>
    );

  if (images.length === 0)
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center animate-float">
            <FileImage className="h-10 w-10 text-blue-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              Nessuna immagine
            </h3>
            <p className="text-slate-500">
              {searchTags.length > 0
                ? "Modifica i filtri di ricerca"
                : "Carica la prima immagine"}
            </p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="h-full flex flex-col">
      {/* Download rapido header */}
      <div className="p-4 border-b border-blue-100/50 bg-white/40 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-slate-700">
              Download rapido:
            </span>
          </div>
          <Select
            value={quickDownloadFormat}
            onValueChange={setQuickDownloadFormat}
          >
            <SelectTrigger className="w-24 h-8 bg-white/80 border-blue-200/50 rounded-lg text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {formats.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Griglia immagini */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid-responsive">
          {images.map((img) => (
            <div key={img.id} className="group relative">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover-lift border border-blue-100/30">
                <div className="relative w-[100px] h-[100px] mx-auto">
                  <img
                    src={`/api/images/${img.id}`}
                    alt={img.originalName}
                    className="w-[100px] h-[100px] object-contain rounded-xl bg-white"
                  />

                  {/* Overlay con pulsanti */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="bg-white/90 hover:bg-white text-slate-700 backdrop-blur-sm rounded-xl h-8 w-8 p-0 shadow-lg"
                        onClick={() => setSelectedImage(img)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="bg-white/90 hover:bg-white text-slate-700 backdrop-blur-sm rounded-xl h-8 w-8 p-0 shadow-lg"
                        onClick={() => handleDownload(img.id, img.originalName)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Tags compatti */}
                <div className="p-2">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {img.tags.slice(0, 1).map((tag, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200/50 rounded-full"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {img.tags.length > 1 && (
                      <Badge
                        variant="outline"
                        className="text-xs px-2 py-0.5 rounded-full border-blue-200/50 text-blue-600"
                      >
                        +{img.tags.length - 1}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dialog dettagli */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={(open) => {
          if (!open) setSelectedImage(null);
        }}
      >
        <DialogContent className="max-w-lg p-0 rounded-3xl shadow-2xl bg-white border-blue-200/50 overflow-hidden">
          <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-blue-50 to-blue-100/50 border-b border-blue-200/30">
            <DialogTitle className="text-xl font-semibold text-slate-800">
              {selectedImage?.originalName}
            </DialogTitle>
          </DialogHeader>

          {selectedImage && (
            <div className="p-6 space-y-6">
              <div className="relative flex justify-center">
                <img
                  src={`/api/images/${selectedImage.id}`}
                  alt={selectedImage.originalName}
                  className="w-[100px] h-[100px] object-contain rounded-xl shadow-lg bg-gradient-to-br from-blue-50 to-white border border-blue-100/50"
                />
              </div>

              <div className="bg-gradient-to-r from-blue-50/50 to-white rounded-2xl p-4 space-y-4 border border-blue-100/30">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-slate-600">
                      Dimensione:
                    </span>
                    <p className="text-slate-800">
                      {formatFileSize(selectedImage.size)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Tipo:</span>
                    <p className="text-slate-800">{selectedImage.mimetype}</p>
                  </div>
                </div>

                <div>
                  <span className="font-medium text-slate-600">Upload:</span>
                  <p className="text-slate-800 flex items-center gap-2">
                    <Clock className="h-3 w-3 text-blue-500" />
                    {formatDate(selectedImage.uploadDate)}
                  </p>
                </div>

                <div>
                  <span className="font-medium text-slate-600 mb-2 block">
                    Tags:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedImage.tags.map((t, i) => (
                      <Badge
                        key={i}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full"
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Download personalizzato */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 p-4 rounded-2xl border border-blue-200/30">
                <h4 className="font-medium text-slate-800 mb-3">
                  Download personalizzato
                </h4>
                <div className="flex gap-3">
                  <Select
                    value={downloadFormat}
                    onValueChange={setDownloadFormat}
                  >
                    <SelectTrigger className="flex-1 bg-white/80 border-blue-200/50 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formats.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={downloadSize} onValueChange={setDownloadSize}>
                    <SelectTrigger className="flex-1 bg-white/80 border-blue-200/50 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sizes.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() =>
                      handleDownload(
                        selectedImage.id,
                        selectedImage.originalName,
                        downloadFormat,
                        downloadSize
                      )
                    }
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Scarica
                  </Button>
                </div>
              </div>

                            {/* Azioni immagine */}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (!selectedImage) return;
                    if (!confirm('Sei sicuro di voler eliminare questa immagine?')) return;
                    await fetch(`/api/images/${selectedImage.id}`, { method: 'DELETE' });
                    setSelectedImage(null);
                    fetchImages();
                  }}
                  className="text-red-600 border-red-300 hover:bg-red-50 rounded-xl"
                >
                  Elimina
                </Button>

                <Button
                  onClick={() => {
                    if (!selectedImage) return;
                    const newTags = prompt(
                      'Modifica i tag (separati da virgola):',
                      selectedImage.tags.join(', ')
                    );
                    if (newTags !== null) {
                      const tags = newTags
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean);
                      fetch(`/api/images/${selectedImage.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ tags }),
                      }).then(() => {
                        setSelectedImage(null);
                        fetchImages();
                      });
                    }
                  }}
                  className="bg-blue-500 text-white hover:bg-blue-600 rounded-xl"
                >
                  Modifica tag
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
