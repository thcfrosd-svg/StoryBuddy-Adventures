import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { BookOpen, Globe, User, AlertCircle } from 'lucide-react';

const SHOWCASE_CHARACTERS = [
  { emoji: '🦁', color: 'bg-yellow-200', text: 'text-yellow-600', name: 'Lion King' },
  { emoji: '🕷️', color: 'bg-red-100', text: 'text-red-600', name: 'Spider Hero' },
  { emoji: '🧜‍♀️', color: 'bg-teal-100', text: 'text-teal-600', name: 'Mermaid' },
  { emoji: '🤖', color: 'bg-red-200', text: 'text-red-600', name: 'Iron Tech' },
  { emoji: '🦄', color: 'bg-pink-100', text: 'text-pink-600', name: 'Unicorn' },
  { emoji: '🦖', color: 'bg-green-200', text: 'text-green-600', name: 'T-Rex' },
  { emoji: '🧚‍♀️', color: 'bg-green-50', text: 'text-green-600', name: 'Fairy' },
  { emoji: '🚀', color: 'bg-lime-100', text: 'text-lime-600', name: 'Space Ranger' },
];

const LANGUAGES = [
  { code: 'English', label: 'English', flag: '🇺🇸' },
  { code: 'Spanish', label: 'Español', flag: '🇪🇸' },
  { code: 'French', label: 'Français', flag: '🇫🇷' },
  { code: 'German', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'Italian', label: 'Italiano', flag: '🇮🇹' },
  { code: 'Japanese', label: '日本語', flag: '🇯🇵' },
  { code: 'Chinese', label: '中文', flag: '🇨🇳' },
  { code: 'Portuguese', label: 'Português', flag: '🇧🇷' },
  { code: 'Hindi', label: 'हिन्दी', flag: '🇮🇳' },
];

// Basic list of inappropriate words for a children's app
const PROFANITY_LIST = [
  'fuck', 'shit', 'bitch', 'cunt', 'whore', 'slut', 'dick', 'pussy', 'bastard', 
  'nigger', 'faggot', 'cock', 'sex', 'porn', 'xxx', 'asshole', 'damn', 'piss', 'crap'
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [language, setLanguage] = useState(localStorage.getItem('storyLanguage') || 'English');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SHOWCASE_CHARACTERS.length);
    }, 2500); // Change every 2.5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    localStorage.setItem('storyLanguage', newLang);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setUserName(newName);
    localStorage.setItem('userName', newName);
    if (nameError) setNameError('');
  };

  const validateName = (name: string) => {
    if (!name) return true;
    const lowerName = name.toLowerCase();
    // Check if name contains any bad words
    const hasProfanity = PROFANITY_LIST.some(word => lowerName.includes(word));
    return !hasProfanity;
  };

  const handleStart = () => {
    if (!validateName(userName)) {
      setNameError("Let's choose a kinder name for our adventure! 🌟");
      return;
    }
    navigate('/character');
  };

  const currentHero = SHOWCASE_CHARACTERS[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-indigo-50 flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      
      {/* Language Selector */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8 z-30">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Globe className="h-5 w-5 text-indigo-600" />
          </div>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-white/80 backdrop-blur-md border-2 border-indigo-200 text-indigo-900 text-lg font-bold rounded-2xl pl-10 pr-10 py-3 outline-none focus:ring-4 focus:ring-indigo-200 cursor-pointer appearance-none shadow-lg hover:bg-white transition-all"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-indigo-400 text-sm">▼</span>
          </div>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute top-10 left-10 text-7xl opacity-20 animate-bounce" style={{ animationDuration: '4s' }}>☁️</div>
      <div className="absolute bottom-20 right-10 text-7xl opacity-20 animate-bounce" style={{ animationDuration: '5s' }}>🌟</div>
      <div className="absolute top-1/3 right-10 text-5xl opacity-10 animate-pulse">✨</div>
      <div className="absolute bottom-1/3 left-10 text-5xl opacity-10 animate-pulse" style={{ animationDelay: '1s'}}>✨</div>

      <div className="max-w-3xl w-full bg-white/80 backdrop-blur-md rounded-[3rem] shadow-2xl p-8 md:p-14 border-4 border-indigo-100 transform transition-all duration-500 relative z-10">
        
        {/* Animated Hero Showcase */}
        <div className="flex justify-center mb-10 h-40 relative">
           {SHOWCASE_CHARACTERS.map((hero, idx) => {
             const isCurrent = idx === currentIndex;
             return (
               <div 
                  key={idx}
                  className={`absolute transition-all duration-700 ease-in-out transform ${
                    isCurrent 
                      ? 'opacity-100 scale-110 translate-y-0 rotate-0' 
                      : 'opacity-0 scale-50 translate-y-8 -rotate-12'
                  }`}
               >
                  <div className={`${hero.color} w-40 h-40 rounded-full flex items-center justify-center text-8xl shadow-xl border-8 border-white ring-4 ring-indigo-50`}>
                    {hero.emoji}
                  </div>
               </div>
             );
           })}
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-indigo-900 mb-6 tracking-tight font-comic drop-shadow-sm">
          StoryBuddy <span className="text-indigo-500">Adventures</span>
          <span className="inline-block ml-3 align-top transform -rotate-12 mt-2">
            <span className="bg-yellow-400 text-yellow-900 text-sm md:text-xl px-3 py-1 rounded-full border-4 border-white shadow-lg font-bold tracking-wider">
              BETA
            </span>
          </span>
        </h1>
        
        <p className="text-2xl md:text-3xl text-slate-600 mb-8 leading-relaxed font-bold">
          Join <span className={`inline-block transition-colors duration-500 ${currentHero.text}`}>{currentHero.name}</span> and friends on a magical journey!
        </p>

        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className={`h-6 w-6 ${nameError ? 'text-red-400' : 'text-indigo-400'}`} />
            </div>
            <input 
              type="text"
              placeholder="What is your name?"
              value={userName}
              onChange={handleNameChange}
              className={`w-full bg-white border-2 ${nameError ? 'border-red-300 focus:border-red-400 focus:ring-red-200 text-red-900 placeholder-red-300' : 'border-indigo-200 focus:border-indigo-400 focus:ring-indigo-200 text-indigo-900 placeholder-indigo-300'} text-xl md:text-2xl font-bold rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 transition-all shadow-inner text-center`}
            />
          </div>
          {nameError && (
            <div className="mt-3 flex items-center justify-center text-red-500 font-bold animate-bounce">
                <AlertCircle className="w-5 h-5 mr-2" />
                {nameError}
            </div>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
          <Button 
            onClick={handleStart} 
            size="lg" 
            className="w-full md:w-auto text-2xl px-12 py-6 shadow-indigo-300 hover:shadow-indigo-400 transform hover:-translate-y-1 hover:scale-105 transition-all duration-300"
          >
            <span className="flex items-center gap-3">
              <BookOpen className="w-8 h-8" />
              Start Adventure
            </span>
          </Button>
        </div>
      </div>
      
      <footer className="mt-12 text-indigo-400 font-bold text-lg">
        Powered by Gemini AI ✨
      </footer>
    </div>
  );
};