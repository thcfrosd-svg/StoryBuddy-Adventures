import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Character, Setting, StoryState, AdventureHistoryItem } from '../types';
import { generateStoryTurn, generateSceneImage, generateNarration } from '../services/geminiService';
import { AudioPlayer } from '../services/audioUtils';
import { Home, Volume2, VolumeX, Play, ArrowLeft, Mic } from 'lucide-react';

// --- Karaoke Component ---
const KaraokeText: React.FC<{ text: string, isPlaying: boolean, duration: number, emoji: string }> = ({ text, isPlaying, duration, emoji }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [ballState, setBallState] = useState({ x: 0, y: 0, opacity: 0, activeIndex: -1 });
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const lastIndexRef = useRef<number>(-1);

  // Split text into words and calculate approximate timing intervals based on length
  const { words, wordBoundaries, totalChars } = useMemo(() => {
    const wordsArray = text.trim().split(/\s+/);
    let charCount = 0;
    const boundaries = wordsArray.map(word => {
      const start = charCount;
      // We treat each word segment as effectively contiguous for animation purposes
      // The "length" includes the following space to prevent gaps in the animation timeline
      const length = word.length + 1; 
      const end = start + length;
      charCount += length;
      return { start, end };
    });
    return { words: wordsArray, wordBoundaries: boundaries, totalChars: charCount };
  }, [text]);

  useEffect(() => {
    if (!isPlaying || duration <= 0) {
       setBallState(prev => ({ ...prev, opacity: 0, activeIndex: -1 }));
       lastIndexRef.current = -1;
       if (requestRef.current) cancelAnimationFrame(requestRef.current);
       return;
    }

    startTimeRef.current = performance.now();
    lastIndexRef.current = -1;

    const animate = () => {
      const now = performance.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      
      if (elapsed >= duration) {
         setBallState(prev => ({ ...prev, opacity: 0, activeIndex: -1 }));
         return;
      }

      const progress = elapsed / duration;
      const targetCharIndex = progress * totalChars;
      
      // Find closest word boundary. 
      let index = wordBoundaries.findIndex(b => targetCharIndex < b.end);
      
      // Fallback for end of sentence rounding errors
      if (index === -1 && targetCharIndex >= totalChars) {
          index = words.length - 1;
      }

      if (index !== -1 && index !== lastIndexRef.current) {
         lastIndexRef.current = index;
         const el = wordRefs.current[index];
         
         if (el && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const wordRect = el.getBoundingClientRect();
            
            // Calculate relative position
            const x = (wordRect.left - containerRect.left) + (wordRect.width / 2) - 16; // Center (icon width 32 / 2 = 16)
            const y = (wordRect.top - containerRect.top) - 36; 

            setBallState({ x, y, opacity: 1, activeIndex: index });
         }
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, duration, totalChars, wordBoundaries, words.length]);

  return (
    <div className="relative inline-block w-full" ref={containerRef}>
      {/* Positioning Container - moves x/y independent of bounce */}
      <div 
        className="absolute left-0 top-0 z-10 transition-transform duration-75 ease-linear will-change-transform pointer-events-none"
        style={{ 
          transform: `translate(${ballState.x}px, ${ballState.y}px)`, 
          opacity: ballState.opacity === 1 ? 0.6 : 0,
        }} 
      >
        {/* Bouncing Container - handles up/down animation */}
        <div className="w-8 h-8 flex items-center justify-center text-2xl animate-[bounce_0.5s_infinite]">
           {emoji}
        </div>
      </div>
      
      {words.map((word, i) => (
        <span 
          key={i} 
          ref={el => { wordRefs.current[i] = el; }} 
          className={`inline-block whitespace-pre-wrap mr-1.5 transition-colors duration-200 ${i === ballState.activeIndex ? 'text-indigo-700' : ''}`}
        >
          {word}
        </span>
      ))}
    </div>
  );
};


export const Adventure: React.FC = () => {
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [setting, setSetting] = useState<Setting | null>(null);
  const [history, setHistory] = useState<AdventureHistoryItem[]>([]);
  const [currentScene, setCurrentScene] = useState<StoryState | null>(null);
  const [language, setLanguage] = useState('English');
  const [userName, setUserName] = useState('');
  
  const [loadingStory, setLoadingStory] = useState(true);
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [bookOpen, setBookOpen] = useState(false);
  
  const audioPlayer = useRef<AudioPlayer>(new AudioPlayer());
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize
  useEffect(() => {
    const savedChar = localStorage.getItem('selectedCharacter');
    const savedSetting = localStorage.getItem('selectedSetting');
    const savedLang = localStorage.getItem('storyLanguage') || 'English';
    const savedName = localStorage.getItem('userName') || '';
    
    setLanguage(savedLang);
    setUserName(savedName);

    if (!savedChar || !savedSetting) {
      navigate('/');
      return;
    }

    const charData = JSON.parse(savedChar);
    const setSettings = JSON.parse(savedSetting);
    setCharacter(charData);
    setSetting(setSettings);

    // Start the first turn
    handleTurn(
      charData, 
      setSettings, 
      [],
      savedLang,
      savedName
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history, loadingStory]);

  const handleTurn = async (
    charData: Character, 
    settingData: Setting,
    currentHistory: AdventureHistoryItem[],
    lang: string,
    name: string
  ) => {
    setLoadingStory(true);
    setAudioSrc(null);
    setIsPlaying(false);
    setAudioDuration(0);
    audioPlayer.current.stop();

    try {
      // 1. Generate Text
      const sceneData = await generateStoryTurn(
        charData.name, 
        charData.description, 
        settingData.name, 
        settingData.description, 
        currentHistory,
        lang,
        name
      );
      setCurrentScene(sceneData);
      
      // Update history immediately
      setHistory([...currentHistory, { role: 'model', text: sceneData.narrative }]);
      setLoadingStory(false);

      // 2. Generate Image & Audio in parallel (Independent)
      
      // Image Handling
      setLoadingImage(true);
      generateSceneImage(sceneData.imagePrompt).then((img) => {
          if (img) setImageSrc(img);
          setLoadingImage(false);
      }).catch(() => setLoadingImage(false));

      // Audio Handling
      setLoadingAudio(true);
      generateNarration(sceneData.narrative, charData.voice).then(async (audio) => {
          if (audio) {
              setAudioSrc(audio);
              if (audioEnabled) {
                  const duration = await audioPlayer.current.play(audio);
                  setAudioDuration(duration);
                  setIsPlaying(true);
                  setTimeout(() => {
                      setIsPlaying(false);
                  }, duration * 1000);
              }
          }
          setLoadingAudio(false);
      }).catch(() => setLoadingAudio(false));

    } catch (error) {
      console.error("Adventure error:", error);
      setLoadingStory(false);
      setLoadingImage(false);
      setLoadingAudio(false);
      // Fallback simple scene if error
      setCurrentScene({
        narrative: "Oh no! The story magic got a little tangled. Let's try again.",
        choices: ["Try Again"],
        imagePrompt: ""
      });
    }
  };

  const handleChoice = (choice: string) => {
    if (!character || !setting) return;
    
    if (choice === "Try Again") {
      window.location.reload();
      return;
    }

    const newHistory: AdventureHistoryItem[] = [
      ...history, 
      { role: 'user', text: choice }
    ];
    setHistory(newHistory);
    
    setTimeout(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, 100);
    
    handleTurn(character, setting, newHistory, language, userName);
  };

  const toggleAudio = async () => {
    if (isPlaying) {
      audioPlayer.current.stop();
      setIsPlaying(false);
    } else if (audioSrc) {
      const duration = await audioPlayer.current.play(audioSrc);
      setAudioDuration(duration);
      setIsPlaying(true);
      setTimeout(() => {
        setIsPlaying(false);
      }, duration * 1000);
    }
  };

  if (!character || !setting) return null;

  const getGradientClass = (bgClass: string) => {
    return bgClass.replace('bg-', 'from-');
  };

  return (
    <div className="fixed inset-0 bg-white flex flex-col font-sans overflow-hidden">
      
      {/* --- BOOK COVER OVERLAY --- */}
      <div 
          className={`absolute inset-0 z-[100] bg-slate-900 flex items-center justify-center transition-all duration-1000 [perspective:2000px] ${bookOpen ? 'pointer-events-none bg-opacity-0' : 'bg-opacity-95'}`}
      >
          <div 
              onClick={() => setBookOpen(true)}
              className={`
                  relative w-[85vw] max-w-[400px] aspect-[3/4] 
                  transition-all duration-1000 ease-in-out origin-left [transform-style:preserve-3d] cursor-pointer
                  ${bookOpen ? '[transform:rotateY(-180deg)_translateX(-100%)] opacity-0' : 'hover:scale-[1.02]'}
              `}
          >
              {/* Front Cover */}
              <div className={`absolute inset-0 ${character.color} rounded-r-xl rounded-l-sm shadow-[20px_20px_60px_rgba(0,0,0,0.5)] border-l-8 border-black/10 flex flex-col items-center justify-center text-center p-6 md:p-10 [backface-visibility:hidden] overflow-hidden`}>
                   
                   {/* Spine Highlight */}
                   <div className="absolute left-0 top-0 bottom-0 w-4 bg-black/20 blur-sm"></div>
                   {/* Cover Texture */}
                   <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/20 pointer-events-none"></div>
                   
                   <div className="relative z-10 w-full h-full flex flex-col items-center justify-between py-8 border-2 border-white/30 rounded-lg p-4">
                       
                       <div className="w-full">
                          <h1 className="font-comic font-black text-4xl md:text-5xl lg:text-6xl text-slate-900 leading-[0.95] drop-shadow-sm mb-6">
                              {setting.name}
                          </h1>
                          <div className="w-32 h-32 bg-white/80 rounded-full flex items-center justify-center text-7xl shadow-inner mx-auto ring-8 ring-white/40">
                              {setting.emoji}
                          </div>
                       </div>

                       <div className="w-full">
                           <div className="w-full h-0.5 bg-slate-900/20 mb-4"></div>
                           <p className="text-slate-800 font-serif italic text-xl mb-2">A Story By</p>
                           
                           <div className="flex flex-col items-center gap-1 transform rotate-[-2deg]">
                             <div className="flex items-center justify-center gap-3 bg-white/90 px-6 py-2 rounded-2xl shadow-md">
                                 <span className="text-3xl">{character.emoji}</span>
                                 <span className="text-2xl font-black text-slate-900">{character.name}</span>
                             </div>
                             
                             {userName && (
                               <>
                                 <p className="text-slate-600 font-serif italic text-lg my-1">&</p>
                                 <div className="bg-white/90 px-6 py-2 rounded-2xl shadow-md border border-indigo-100">
                                     <span className="text-2xl font-black text-indigo-600">{userName}</span>
                                 </div>
                               </>
                             )}
                           </div>
                       </div>
                       
                   </div>

                   <div className="absolute bottom-4 text-slate-700/60 font-bold text-sm animate-pulse">
                       Tap to Open Book
                   </div>
              </div>

              {/* Pages Effect (Side visible when closed) */}
              <div className="absolute top-2 bottom-2 right-0 w-4 bg-white rounded-r-sm transform translate-x-full shadow-md z-[-1]">
                  <div className="absolute inset-y-1 right-px w-px bg-slate-300"></div>
                  <div className="absolute inset-y-1 right-[3px] w-px bg-slate-300"></div>
                  <div className="absolute inset-y-1 right-[5px] w-px bg-slate-300"></div>
              </div>
          </div>
      </div>
      {/* --- END BOOK COVER --- */}

      {/* Ambient Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {imageSrc ? (
          <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out animate-fadeIn">
            {/* Clearer scene image */}
            <img 
              src={imageSrc} 
              alt="Background" 
              className="w-full h-full object-cover opacity-25" 
            />
            {/* Lighter gradient to ensure text is readable but image is visible */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/60 to-white/40" />
          </div>
        ) : (
          <div className={`w-full h-full bg-gradient-to-b ${getGradientClass(character.color)} via-white to-white opacity-40`} />
        )}
        
        {/* Character Watermark - Massive emoji in the background */}
        <div className="absolute right-[-10%] bottom-[-10%] md:right-10 md:bottom-10 opacity-[0.15] transform rotate-[-15deg] pointer-events-none transition-all duration-1000">
            <span className="text-[80vw] md:text-[35vw] leading-none filter drop-shadow-2xl">{character.emoji}</span>
        </div>
      </div>

      {/* Top Header */}
      <div className={`h-20 bg-white/70 backdrop-blur-md border-b border-white/50 flex items-center justify-between px-4 shrink-0 z-20 shadow-sm transition-opacity duration-500 ${bookOpen ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center">
          <button onClick={() => navigate('/setting')} className="mr-3 p-3 hover:bg-black/5 rounded-full text-slate-600 transition-colors">
            <ArrowLeft className="w-8 h-8" />
          </button>
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full ${character.color} flex items-center justify-center text-3xl mr-3 border border-black/10 shadow-sm`}>
              {character.emoji}
            </div>
            <div>
              <h1 className="font-bold text-xl md:text-2xl text-slate-800 leading-none">{character.name}</h1>
              <span className="text-sm md:text-base text-slate-600 font-medium">{setting.name}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-3 rounded-full transition-colors ${audioEnabled ? 'bg-indigo-100/80 text-indigo-600' : 'bg-slate-100/80 text-slate-400'}`}
          >
            {audioEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>
          <button onClick={() => navigate('/')} className="p-3 hover:bg-black/5 rounded-full text-slate-600 transition-colors">
            <Home className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex relative z-10">
        
        {/* Chat Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 pb-48 md:pr-[22rem] lg:pr-[28rem] scroll-smooth"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {bookOpen && (
            <div className="text-center my-6 animate-fade-in">
              <div className="inline-block bg-indigo-100/80 text-indigo-800 px-6 py-2 rounded-full text-sm font-bold mb-2 backdrop-blur-sm">
                Adventure Started
              </div>
              <p className="text-slate-400 text-sm">Today at {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
          )}

          {/* History */}
          {history.map((item, index) => {
            const isLatestModelMessage = item.role === 'model' && index === history.length - 1;
            
            return (
              <div key={index} className={`flex mb-6 ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                
                {item.role === 'model' && (
                  <div className={`w-10 h-10 rounded-full ${character.color} flex items-center justify-center text-2xl mr-3 shrink-0 self-end mb-2 border border-black/10 shadow-sm`}>
                    {character.emoji}
                  </div>
                )}

                <div className={`max-w-[90%] md:max-w-[85%] rounded-3xl px-6 py-4 shadow-sm backdrop-blur-[2px] ${
                  item.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-200 text-lg md:text-2xl leading-relaxed' 
                    : 'bg-white/95 text-slate-800 border border-white/50 rounded-bl-none font-medium story-font text-xl md:text-3xl leading-[2.5]'
                }`}>
                   {isLatestModelMessage ? (
                     <KaraokeText text={item.text} isPlaying={isPlaying} duration={audioDuration} emoji={character.emoji} />
                   ) : (
                     item.text
                   )}
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {loadingStory && bookOpen && (
             <div className="flex justify-start mb-6">
                <div className={`w-10 h-10 rounded-full ${character.color} flex items-center justify-center text-2xl mr-3 shrink-0 self-end mb-2 border border-black/10`}>
                  {character.emoji}
                </div>
                <div className="bg-white/80 rounded-3xl rounded-bl-none px-6 py-4 border border-white/50 shadow-sm flex items-center gap-2">
                  <span className="w-3 h-3 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-3 h-3 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-3 h-3 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
             </div>
          )}
          
          <div className="h-72"></div>
        </div>

        {/* Desktop Side Panel for Image */}
        <div className={`hidden md:block absolute right-8 top-24 w-80 lg:w-96 aspect-[3/4] bg-white rounded-3xl shadow-2xl border-[8px] border-white transform rotate-2 overflow-hidden pointer-events-none transition-all duration-500 z-10 ${bookOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}>
           {imageSrc ? (
             <img src={imageSrc} alt="Scene" className="w-full h-full object-cover" />
           ) : (
             <div className={`w-full h-full bg-gradient-to-br ${getGradientClass(character.color)} to-white flex items-center justify-center`}>
               <span className="text-9xl opacity-50 filter drop-shadow-lg transform hover:scale-110 transition-transform duration-700">
                 {character.emoji}
               </span>
             </div>
           )}
           
           {loadingImage && (
             <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-sm">
               <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
             </div>
           )}

           {/* Audio Play Button Overlay */}
           {audioSrc && (
               <div className="absolute bottom-4 right-4 pointer-events-auto">
                  <button 
                    onClick={toggleAudio}
                    className="bg-white/90 backdrop-blur text-indigo-600 p-3 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center w-16 h-16 border border-indigo-100"
                  >
                    {isPlaying ? (
                      <div className="flex gap-1 h-6 items-end">
                        <div className="w-1.5 bg-current animate-[bounce_1s_infinite] h-3"></div>
                        <div className="w-1.5 bg-current animate-[bounce_1.2s_infinite] h-6"></div>
                        <div className="w-1.5 bg-current animate-[bounce_0.8s_infinite] h-4"></div>
                      </div>
                    ) : (
                      <Play className="w-8 h-8 ml-1" />
                    )}
                  </button>
               </div>
           )}
        </div>
      </div>

      {/* Bottom Controls (Choices) */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-white/50 p-4 pb-8 z-30 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] transition-transform duration-700 ${bookOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-4xl mx-auto">
           
           {/* Audio Loading Bar */}
           {loadingAudio && (
             <div className="mb-4 bg-indigo-50/90 rounded-xl p-3 flex items-center gap-3 border border-indigo-100 animate-in fade-in slide-in-from-bottom-2 shadow-sm backdrop-blur-md">
                <div className="flex gap-1 h-4 items-end ml-2">
                    <div className="w-1 bg-indigo-500 animate-[bounce_1s_infinite] h-2"></div>
                    <div className="w-1 bg-indigo-500 animate-[bounce_1.2s_infinite] h-4"></div>
                    <div className="w-1 bg-indigo-500 animate-[bounce_0.8s_infinite] h-3"></div>
                </div>
                <div className="flex-1 pr-2">
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1 flex items-center gap-2">
                      Narrator Preparing...
                    </p>
                    <div className="h-2 bg-indigo-200 rounded-full overflow-hidden w-full relative">
                        <div className="absolute inset-y-0 left-0 bg-indigo-500 animate-[shimmer_2s_infinite] w-1/3 rounded-full" style={{ width: '40%' }}></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1s_infinite]"></div>
                    </div>
                </div>
             </div>
           )}

           {!loadingStory && currentScene?.choices && (
             <div className="flex flex-col gap-3">
               <p className="text-sm font-black text-slate-400 uppercase tracking-wider mb-1 ml-1">
                 {userName ? `What should we do, ${userName}?` : 'What should we do?'}
               </p>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                 {currentScene.choices.map((choice, idx) => (
                   <button
                     key={idx}
                     onClick={() => handleChoice(choice)}
                     disabled={loadingStory}
                     className="bg-white hover:bg-indigo-50 border-2 border-slate-200 hover:border-indigo-300 text-left p-4 rounded-2xl text-lg md:text-xl font-bold text-slate-700 hover:text-indigo-700 transition-all active:scale-95 flex items-center group shadow-sm"
                   >
                     <span className="w-8 h-8 rounded-full bg-slate-100 text-indigo-600 text-base flex items-center justify-center mr-3 font-black shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                       {idx + 1}
                     </span>
                     <span className="leading-tight">{choice}</span>
                   </button>
                 ))}
               </div>
             </div>
           )}
           
           {loadingStory && (
             <div className="flex items-center justify-center h-32 text-slate-500 text-lg font-bold animate-pulse">
               Thinking of the next part of the story...
             </div>
           )}
        </div>
      </div>
    </div>
  );
};