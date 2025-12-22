
import React, { useState, useRef, useCallback } from 'react';
import { AspectRatio, StylePreset, GenerationState } from './types';
import { SCENE_OPTIONS } from './constants';
import { generateLiuqiuMemory } from './services/geminiService';

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<{ base64: string; mimeType: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scene, setScene] = useState(SCENE_OPTIONS[0].value);
  const [customPrompt, setCustomPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.PORTRAIT_IG);
  const [stylePreset, setStylePreset] = useState<StylePreset>(StylePreset.NATURAL);
  const [generation, setGeneration] = useState<GenerationState>({
    loading: false,
    error: null,
    resultUrl: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setGeneration(prev => ({ ...prev, error: '照片過大，請選擇 10MB 以下的照片' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setSelectedImage({ base64, mimeType: file.type });
      setPreviewUrl(reader.result as string);
      setGeneration(prev => ({ ...prev, error: null }));
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!selectedImage) {
      setGeneration(prev => ({ ...prev, error: '請先上傳照片' }));
      return;
    }

    setGeneration({ loading: true, error: null, resultUrl: null });

    try {
      const finalScene = customPrompt.trim() || scene;
      const result = await generateLiuqiuMemory(
        selectedImage.base64,
        selectedImage.mimeType,
        finalScene,
        aspectRatio,
        stylePreset
      );
      setGeneration({ loading: false, error: null, resultUrl: result });
    } catch (err: any) {
      setGeneration({ loading: false, error: err.message, resultUrl: null });
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadImage = () => {
    if (!generation.resultUrl) return;
    const link = document.createElement('a');
    link.href = generation.resultUrl;
    link.download = `Xiao_Liu_Qiu_Memory_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareToFB = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, 'facebook-share-dialog', 'width=800,height=600');
  };

  // Helper for dynamic aspect ratio class
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case AspectRatio.SQUARE: return 'aspect-[1/1]';
      case AspectRatio.LANDSCAPE: return 'aspect-[16/9]';
      case AspectRatio.STORY: return 'aspect-[9/16]';
      case AspectRatio.PORTRAIT_IG: return 'aspect-[4/5]';
      default: return 'aspect-[4/5]';
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 flex items-start justify-center">
      <div className="w-full max-w-5xl bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-10 my-4 shadow-[0_20px_60px_rgba(0,139,139,0.15)] border border-white/50">
        
        {/* Header */}
        <header className="text-center mb-10">
          <div className="text-cyan-600 font-bold text-lg sm:text-xl tracking-widest mb-2">形世代 X 浪琉研</div>
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-800 mb-3 flex items-center justify-center gap-3">
            <span className="text-4xl">🐢</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600">
              小琉球湛藍回憶
            </span>
            <span className="text-2xl text-cyan-500 font-light hidden sm:inline-block">| AI Travel</span>
          </h1>
          <p className="text-gray-500 text-lg">
            上傳您的照片，AI 瞬間帶您<span className="font-bold text-cyan-600">與海龜共游</span>、<span className="font-bold text-cyan-600">搭乘玻璃船</span>、體驗<span className="font-bold text-orange-400">海島落日</span>。
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Controls Column */}
          <div className="space-y-6">
            
            {/* Step 1: Upload */}
            <div className="relative bg-blue-50/50 p-6 rounded-2xl border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors group">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
              
              <div className="relative z-10 pointer-events-none">
                <label className="block text-xl font-bold text-gray-700 mb-2 flex items-center">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm mr-3">1</span>
                  上傳旅客照片
                  <span className="ml-auto text-xs font-normal px-2 py-1 bg-white text-blue-400 rounded-md shadow-sm border border-blue-100">支援 10MB 內</span>
                </label>
                {!previewUrl && (
                  <div className="mt-3 min-h-[120px] flex flex-col justify-center text-center">
                    <p className="text-blue-400 group-hover:text-blue-600 font-medium text-lg">📸 點擊此處上傳照片</p>
                    <p className="text-xs text-gray-400 mt-2">支援手機照片 (JPG, PNG, HEIC)</p>
                  </div>
                )}
              </div>

              {previewUrl && (
                <div className="mt-4 relative z-30">
                  <img src={previewUrl} className="h-40 w-full object-contain rounded-lg bg-white/50 border border-blue-100" alt="Preview" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); clearImage(); }}
                    className="absolute top-2 right-2 bg-gray-800/50 hover:bg-red-500 text-white rounded-full p-1 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Options */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
              <label className="block text-xl font-bold text-gray-700 flex items-center">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm mr-3">2</span>
                選擇打卡景點
              </label>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">照片比例</label>
                  <select 
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                    className="w-full p-3 bg-gray-50 border-0 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value={AspectRatio.PORTRAIT_IG}>4:5 (IG 貼文)</option>
                    <option value={AspectRatio.SQUARE}>1:1 (正方形)</option>
                    <option value={AspectRatio.STORY}>9:16 (限時動態)</option>
                    <option value={AspectRatio.LANDSCAPE}>16:9 (橫式寬景)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">氛圍濾鏡</label>
                  <select 
                    value={stylePreset}
                    onChange={(e) => setStylePreset(e.target.value as StylePreset)}
                    className="w-full p-3 bg-gray-50 border-0 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value={StylePreset.NATURAL}>☀️ 自然陽光</option>
                    <option value={StylePreset.CINEMATIC}>🎬 電影質感</option>
                    <option value={StylePreset.SOFT}>☁️ 柔和日系</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">熱門景點</label>
                <div className="relative">
                  <select 
                    value={scene}
                    onChange={(e) => setScene(e.target.value)}
                    className="w-full p-3 bg-gray-50 border-0 rounded-xl text-gray-700 font-medium appearance-none focus:ring-2 focus:ring-blue-400 outline-none pr-10"
                  >
                    {/* Groups are rendered based on SCENE_OPTIONS groups */}
                    {Array.from(new Set(SCENE_OPTIONS.map(s => s.group))).map(group => (
                      <optgroup key={group} label={group}>
                        {SCENE_OPTIONS.filter(s => s.group === group).map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="relative">
                <input 
                  type="text" 
                  placeholder="或輸入自訂行程 (例如：在白燈塔前跳躍)" 
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="w-full p-3 bg-transparent border-b-2 border-gray-200 text-gray-700 placeholder-gray-400 focus:border-blue-400 outline-none transition-colors"
                />
              </div>
            </div>
            
            {/* Generate Button */}
            <button 
              onClick={handleGenerate}
              disabled={generation.loading || !selectedImage}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-bold py-4 rounded-xl shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              {generation.loading ? (
                <>
                  <span className="mr-3">正在潛入深藍...</span>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </>
              ) : (
                <span>✨ 出發去小琉球</span>
              )}
            </button>
            
            {generation.error && (
              <p className="text-red-500 text-sm text-center p-3 bg-red-50 rounded-lg border border-red-100 whitespace-pre-wrap">
                哎呀！海浪太大連線不穩：{generation.error}
              </p>
            )}
          </div>
          
          {/* Result Column */}
          <div className="flex flex-col items-center justify-start pt-4">
            <div className="relative w-full max-w-md perspective-1000">
              <div className={`bg-white p-4 pb-16 shadow-2xl rotate-1 transition-all duration-500 relative group ${getAspectRatioClass()} flex items-center justify-center overflow-hidden border border-gray-100`}>
                
                {/* Decorative Tape */}
                <div className="absolute top-[-15px] left-1/2 transform -translate-x-1/2 w-32 h-8 bg-blue-200/50 rotate-[-2deg] shadow-sm z-10 backdrop-blur-sm"></div>

                {!generation.resultUrl && !generation.loading && (
                  <div className="text-center p-8 space-y-4">
                    <div className="text-6xl animate-bounce">🐢</div>
                    <h3 className="text-xl font-bold text-gray-400">尚未生成照片</h3>
                    <p className="text-gray-400 text-sm">請上傳照片並選擇景點<br />AI 將為您合成小琉球之旅</p>
                  </div>
                )}

                {generation.loading && (
                  <div className="absolute inset-0 bg-gray-100/50 flex flex-col items-center justify-center animate-pulse">
                    <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-cyan-600 font-medium">照片合成中...</p>
                  </div>
                )}

                {generation.resultUrl && (
                  <img src={generation.resultUrl} className="w-full h-full object-cover animate-fade-in" alt="AI Generated Memory" />
                )}
                
                {generation.resultUrl && (
                  <div className="absolute bottom-4 right-6 text-gray-400 font-serif italic transform -rotate-2 opacity-60">
                    形世代 X 浪琉研
                  </div>
                )}
              </div>
            </div>

            {generation.resultUrl && (
              <div className="flex flex-wrap justify-center gap-3 mt-8 w-full max-w-md animate-slide-up">
                <button onClick={downloadImage} className="flex-1 bg-gray-800 text-white font-medium py-3 px-6 rounded-xl hover:bg-black transition-colors flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  下載回憶
                </button>
                <button onClick={shareToFB} className="flex-1 bg-[#1877F2] text-white font-medium py-3 px-6 rounded-xl hover:bg-[#166fe5] transition-colors flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  分享
                </button>
              </div>
            )}

            {/* Footer Links */}
            <div className="mt-8 text-center flex flex-col items-center space-y-3">
              <a href="https://www.facebook.com/cirda1994" target="_blank" className="inline-flex items-center text-cyan-600 hover:text-cyan-800 font-medium transition-colors text-sm">
                <span>🏝️ 中華民國形象研究發展協會</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </a>
              <a href="https://e-seed.com.tw/" target="_blank" className="inline-flex items-center text-gray-500 hover:text-cyan-600 font-medium transition-colors text-sm">
                <span>🚀 AI策略行銷</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;
