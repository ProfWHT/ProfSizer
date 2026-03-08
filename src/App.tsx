/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  Maximize2, 
  Link as LinkIcon, 
  Unlink, 
  RefreshCcw, 
  Image as ImageIcon,
  Check,
  ChevronRight,
  Settings2,
  FileImage
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageDimensions {
  width: number;
  height: number;
}

export default function App() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });
  const [targetDimensions, setTargetDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [isResizing, setIsResizing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number; type: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadImage(file);
    }
  };

  const loadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setOriginalDimensions({ width: img.width, height: img.height });
        setTargetDimensions({ width: img.width, height: img.height });
        setFileInfo({
          name: file.name,
          size: file.size,
          type: file.type
        });
        generatePreview(img, img.width, img.height);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const generatePreview = (img: HTMLImageElement, width: number, height: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0, width, height);
      setPreviewUrl(canvas.toDataURL(fileInfo?.type || 'image/png'));
    }
  };

  const handleWidthChange = (val: string) => {
    const width = parseInt(val) || 0;
    if (lockAspectRatio && originalDimensions.width > 0) {
      const ratio = originalDimensions.height / originalDimensions.width;
      const height = Math.round(width * ratio);
      setTargetDimensions({ width, height });
    } else {
      setTargetDimensions(prev => ({ ...prev, width }));
    }
  };

  const handleHeightChange = (val: string) => {
    const height = parseInt(val) || 0;
    if (lockAspectRatio && originalDimensions.height > 0) {
      const ratio = originalDimensions.width / originalDimensions.height;
      const width = Math.round(height * ratio);
      setTargetDimensions({ width, height });
    } else {
      setTargetDimensions(prev => ({ ...prev, height }));
    }
  };

  const handleDownload = () => {
    if (!image || !previewUrl) return;
    
    const link = document.createElement('a');
    link.download = `resized-${fileInfo?.name || 'image.png'}`;
    link.href = previewUrl;
    link.click();
  };

  const reset = () => {
    setImage(null);
    setPreviewUrl(null);
    setFileInfo(null);
    setOriginalDimensions({ width: 0, height: 0 });
    setTargetDimensions({ width: 0, height: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    if (image && targetDimensions.width > 0 && targetDimensions.height > 0) {
      const timeoutId = setTimeout(() => {
        generatePreview(image, targetDimensions.width, targetDimensions.height);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [targetDimensions, image]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <header className="border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Maximize2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">ProfSizer</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium uppercase tracking-widest text-black/40">v1.0.0</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
              <div className="flex items-center gap-2 mb-6">
                <Settings2 className="w-4 h-4 text-black/60" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-black/60">Configuration</h2>
              </div>

              {!image ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative border-2 border-dashed border-black/10 rounded-xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-black/30 hover:bg-black/[0.02] transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-black/60" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Drop image here</p>
                    <p className="text-xs text-black/40 mt-1">or click to browse</p>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Dimensions Input */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-black/40">Width (px)</label>
                        <input 
                          type="number"
                          value={targetDimensions.width}
                          onChange={(e) => handleWidthChange(e.target.value)}
                          className="w-full bg-black/[0.03] border border-black/5 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-black/40">Height (px)</label>
                        <input 
                          type="number"
                          value={targetDimensions.height}
                          onChange={(e) => handleHeightChange(e.target.value)}
                          className="w-full bg-black/[0.03] border border-black/5 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => setLockAspectRatio(!lockAspectRatio)}
                      className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg border transition-all text-xs font-medium ${
                        lockAspectRatio 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white text-black/60 border-black/10 hover:border-black/30'
                      }`}
                    >
                      {lockAspectRatio ? <LinkIcon className="w-3 h-3" /> : <Unlink className="w-3 h-3" />}
                      {lockAspectRatio ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}
                    </button>
                  </div>

                  {/* Quick Presets */}
                  <div className="space-y-3 pt-4 border-t border-black/5">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-black/40">Presets</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: '50%', scale: 0.5 },
                        { label: '75%', scale: 0.75 },
                        { label: '150%', scale: 1.5 },
                        { label: '200%', scale: 2.0 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => {
                            const w = Math.round(originalDimensions.width * preset.scale);
                            const h = Math.round(originalDimensions.height * preset.scale);
                            setTargetDimensions({ width: w, height: h });
                          }}
                          className="px-3 py-2 text-[11px] font-medium bg-black/[0.03] border border-black/5 rounded-lg hover:bg-black hover:text-white transition-all"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-6 space-y-3">
                    <button 
                      onClick={handleDownload}
                      className="w-full bg-black text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-black/90 active:scale-[0.98] transition-all shadow-lg shadow-black/10"
                    >
                      <Download className="w-4 h-4" />
                      Download Image
                    </button>
                    <button 
                      onClick={reset}
                      className="w-full bg-white text-black/60 py-3 rounded-xl font-medium border border-black/10 flex items-center justify-center gap-2 hover:bg-black/5 transition-all"
                    >
                      <RefreshCcw className="w-4 h-4" />
                      Start Over
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* File Info Card */}
            {fileInfo && (
              <motion.section 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-black/5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <FileImage className="w-4 h-4 text-black/60" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-black/60">File Details</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-black/40">Name</span>
                    <span className="text-xs font-medium truncate max-w-[150px]">{fileInfo.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-black/40">Original Size</span>
                    <span className="text-xs font-mono">{formatSize(fileInfo.size)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-black/40">Dimensions</span>
                    <span className="text-xs font-mono">{originalDimensions.width} × {originalDimensions.height}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-black/40">Format</span>
                    <span className="text-xs font-medium uppercase">{fileInfo.type.split('/')[1]}</span>
                  </div>
                </div>
              </motion.section>
            )}
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-8">
            <section className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden flex flex-col h-full min-h-[600px]">
              <div className="p-4 border-b border-black/5 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-black/60" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-black/60">Live Preview</span>
                </div>
                {image && (
                  <div className="flex items-center gap-2 text-[10px] font-mono text-black/40">
                    <span>{targetDimensions.width}px</span>
                    <ChevronRight className="w-3 h-3" />
                    <span>{targetDimensions.height}px</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 bg-[#FAFAFA] relative overflow-hidden flex items-center justify-center p-8">
                {/* Grid Pattern Background */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
                />

                <AnimatePresence mode="wait">
                  {!previewUrl ? (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center space-y-4"
                    >
                      <div className="w-20 h-20 rounded-full bg-black/5 flex items-center justify-center mx-auto">
                        <ImageIcon className="w-10 h-10 text-black/10" />
                      </div>
                      <p className="text-sm text-black/30 font-medium italic">No image selected for preview</p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="preview"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group max-w-full max-h-full"
                    >
                      <div className="absolute -inset-4 bg-black/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="relative z-10 max-w-full max-h-[500px] object-contain rounded-lg shadow-2xl border border-black/5"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Floating Badge */}
                      <div className="absolute -top-3 -right-3 z-20 bg-black text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-lg">
                        Resized
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Status Bar */}
              <div className="p-4 bg-white border-t border-black/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${image ? 'bg-emerald-500 animate-pulse' : 'bg-black/10'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-black/40">
                      {image ? 'Ready' : 'Idle'}
                    </span>
                  </div>
                </div>
                {image && (
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-black/40">Processing Active</span>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-black/5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-40">
            <Maximize2 className="w-4 h-4" />
            <span className="text-xs font-semibold tracking-tighter">PROFSIZER</span>
          </div>
          <p className="text-xs text-black/40">© 2026 ProfSizer. Professional Image Processing.</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-black/40 hover:text-black transition-colors">Privacy</a>
            <a href="#" className="text-xs text-black/40 hover:text-black transition-colors">Terms</a>
            <a href="#" className="text-xs text-black/40 hover:text-black transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
