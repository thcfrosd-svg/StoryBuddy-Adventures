import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Character } from '../types';
import { ArrowLeft, Star, Zap,  Cat, Tv, Briefcase, User, Wand2 } from 'lucide-react';

// Voice options: 'Puck' (Deep/Male), 'Charon' (Deep), 'Kore' (Soft/Female), 'Fenrir' (Intense/Male), 'Zephyr' (Clear/Female)

const CHARACTERS: Character[] = [
  // K-Pop Demon Hunters (Now in Heroes)
  { id: 'hana', name: 'Hana (The Star)', description: 'Sings powerful notes that blast monsters away.', emoji: '🎤', color: 'bg-pink-200', category: 'Heroes', voice: 'Zephyr' },
  { id: 'ken', name: 'Ken (The Breaker)', description: 'Breakdances to create protective energy shields.', emoji: '🧢', color: 'bg-purple-200', category: 'Heroes', voice: 'Fenrir' },
  { id: 'minji', name: 'Minji (The Hunter)', description: 'Uses neon fans to catch sneaky spirits.', emoji: '🪭', color: 'bg-cyan-200', category: 'Heroes', voice: 'Kore' },
  { id: 'coco', name: 'Coco (The Stylist)', description: 'Her magical outfit changes to suit any battle.', emoji: '✨', color: 'bg-fuchsia-100', category: 'Heroes', voice: 'Zephyr' },

  // Heroes
  { id: 'spider', name: 'Spider Hero', description: 'Climbs walls and shoots webs!', emoji: '🕷️', color: 'bg-red-100', category: 'Heroes', voice: 'Fenrir' },
  { id: 'bat', name: 'Bat Knight', description: 'Protects the city from shadows.', emoji: '🦇', color: 'bg-slate-200', category: 'Heroes', voice: 'Puck' },
  { id: 'wonder', name: 'Wonder Princess', description: 'Strong, fast, and flies with magic!', emoji: '⭐', color: 'bg-blue-100', category: 'Heroes', voice: 'Zephyr' },
  { id: 'captain', name: 'Captain Shield', description: 'Leads the team with a mighty shield.', emoji: '🛡️', color: 'bg-blue-200', category: 'Heroes', voice: 'Fenrir' },
  { id: 'iron', name: 'Iron Tech', description: 'Flies in a super cool robot suit.', emoji: '🤖', color: 'bg-red-200', category: 'Heroes', voice: 'Charon' },
  { id: 'green', name: 'Green Giant', description: 'Huge, green, and super strong!', emoji: '💪', color: 'bg-green-100', category: 'Heroes', voice: 'Puck' },
  { id: 'speed', name: 'Speedster', description: 'Runs faster than a lightning bolt.', emoji: '⚡', color: 'bg-yellow-100', category: 'Heroes', voice: 'Zephyr' },
  { id: 'panther', name: 'Jungle King', description: 'A brave protector of the hidden jungle.', emoji: '🐆', color: 'bg-purple-100', category: 'Heroes', voice: 'Puck' },
  { id: 'ninja', name: 'Ninja Shadow', description: 'Sneaky, silent, and very skilled.', emoji: '🥷', color: 'bg-stone-200', category: 'Heroes', voice: 'Charon' },
  { id: 'solar', name: 'Solar Flare', description: 'Controls the power of the sun!', emoji: '☀️', color: 'bg-orange-100', category: 'Heroes', voice: 'Kore' },

  // Magic
  { id: 'elsa', name: 'Ice Queen', description: 'Makes snow and ice castles.', emoji: '❄️', color: 'bg-cyan-100', category: 'Magic', voice: 'Zephyr' },
  { id: 'harry', name: 'Young Wizard', description: 'Learns spells at a magic castle.', emoji: '🧙‍♂️', color: 'bg-amber-100', category: 'Magic', voice: 'Zephyr' },
  { id: 'fairy', name: 'Tinker Fairy', description: 'Fixes things with pixie dust.', emoji: '🧚‍♀️', color: 'bg-green-50', category: 'Magic', voice: 'Kore' },
  { id: 'mermaid', name: 'Mermaid Princess', description: 'Swims with dolphins under the sea.', emoji: '🧜‍♀️', color: 'bg-teal-100', category: 'Magic', voice: 'Kore' },
  { id: 'unicorn', name: 'Sparkle Unicorn', description: 'A magical horse with a rainbow horn.', emoji: '🦄', color: 'bg-pink-100', category: 'Magic', voice: 'Kore' },
  { id: 'dragon', name: 'Friendly Dragon', description: 'Breathes fire but loves marshmallows.', emoji: '🐲', color: 'bg-orange-100', category: 'Magic', voice: 'Puck' },
  { id: 'genie', name: 'Blue Genie', description: 'Grants wishes and tells funny jokes.', emoji: '🧞‍♂️', color: 'bg-blue-50', category: 'Magic', voice: 'Fenrir' },
  { id: 'phoenix', name: 'Fire Bird', description: 'A beautiful bird made of magical fire.', emoji: '🦅', color: 'bg-red-50', category: 'Magic', voice: 'Kore' },
  { id: 'gnome', name: 'Garden Gnome', description: 'Protects the garden and finds treasure.', emoji: '🍄', color: 'bg-green-100', category: 'Magic', voice: 'Charon' },
  { id: 'witch', name: 'Good Witch', description: 'Brews kind potions and flies on a broom.', emoji: '🧹', color: 'bg-purple-200', category: 'Magic', voice: 'Zephyr' },
  
  // Animals
  { id: 'lion', name: 'Lion King', description: 'The ruler of the Pride Lands.', emoji: '🦁', color: 'bg-yellow-200', category: 'Animals', voice: 'Puck' },
  { id: 'tiger', name: 'Striped Tiger', description: 'Stealthy, strong, and loves to pounce.', emoji: '🐅', color: 'bg-orange-200', category: 'Animals', voice: 'Fenrir' },
  { id: 'bear', name: 'Big Bear', description: 'Loves honey and long naps.', emoji: '🐻', color: 'bg-stone-200', category: 'Animals', voice: 'Puck' },
  { id: 'bluey', name: 'Blue Puppy', description: 'Plays games with her sister.', emoji: '🐶', color: 'bg-blue-100', category: 'Animals', voice: 'Zephyr' },
  { id: 'peppa', name: 'Pink Piggy', description: 'Loves jumping in muddy puddles.', emoji: '🐷', color: 'bg-pink-200', category: 'Animals', voice: 'Kore' },
  { id: 'shark', name: 'Baby Shark', description: 'Doo doo doo doo doo doo!', emoji: '🦈', color: 'bg-cyan-200', category: 'Animals', voice: 'Zephyr' },
  { id: 'dino', name: 'T-Rex', description: 'The king of the dinosaurs!', emoji: '🦖', color: 'bg-green-200', category: 'Animals', voice: 'Fenrir' },
  { id: 'panda', name: 'Kung Fu Panda', description: 'Loves dumplings and karate.', emoji: '🐼', color: 'bg-stone-100', category: 'Animals', voice: 'Puck' },
  { id: 'sonic', name: 'Blue Hedgehog', description: 'Gotta go fast!', emoji: '🦔', color: 'bg-blue-300', category: 'Animals', voice: 'Zephyr' },
  { id: 'elephant', name: 'Gentle Giant', description: 'Has a long trunk and never forgets.', emoji: '🐘', color: 'bg-slate-300', category: 'Animals', voice: 'Puck' },
  { id: 'monkey', name: 'Cheeky Monkey', description: 'Loves bananas and swinging in trees.', emoji: '🐒', color: 'bg-yellow-100', category: 'Animals', voice: 'Zephyr' },
  { id: 'owl', name: 'Wise Owl', description: 'Knows everything and flies at night.', emoji: '🦉', color: 'bg-stone-200', category: 'Animals', voice: 'Charon' },
  { id: 'kitten', name: 'Super Kitten', description: 'Small, cute, but very brave!', emoji: '🐱', color: 'bg-pink-50', category: 'Animals', voice: 'Kore' },
  { id: 'bunny', name: 'Hop Bunny', description: 'Hops high and eats fresh carrots.', emoji: '🐰', color: 'bg-orange-50', category: 'Animals', voice: 'Kore' },
  { id: 'fox', name: 'Clever Fox', description: 'Smart, fast, and a little tricky.', emoji: '🦊', color: 'bg-orange-200', category: 'Animals', voice: 'Zephyr' },

  // TV Stars
  { id: 'mickey', name: 'Mouse Detective', description: 'Solves mysteries with his pals.', emoji: '🕵️‍♂️', color: 'bg-red-50', category: 'TV Stars', voice: 'Zephyr' },
  { id: 'buzz', name: 'Space Ranger', description: 'To infinity and beyond!', emoji: '🚀', color: 'bg-lime-100', category: 'TV Stars', voice: 'Fenrir' },
  { id: 'woody', name: 'Sheriff Cowboy', description: 'There is a snake in his boot!', emoji: '🤠', color: 'bg-yellow-50', category: 'TV Stars', voice: 'Fenrir' },
  { id: 'mario', name: 'Jumpman', description: 'Jumps on turtles and saves princesses.', emoji: '🍄', color: 'bg-red-100', category: 'TV Stars', voice: 'Fenrir' },
  { id: 'spongebob', name: 'Square Sponge', description: 'Lives in a pineapple under the sea.', emoji: '🍍', color: 'bg-yellow-100', category: 'TV Stars', voice: 'Zephyr' },
  { id: 'minion', name: 'Yellow Helper', description: 'Loves bananas and mischief.', emoji: '🍌', color: 'bg-yellow-200', category: 'TV Stars', voice: 'Kore' },
  { id: 'pikachu', name: 'Electric Mouse', description: 'Pika Pika!', emoji: '⚡️', color: 'bg-yellow-200', category: 'TV Stars', voice: 'Kore' },
  { id: 'kitty', name: 'Hello Kitty', description: 'Cute, kind, and loves red bows.', emoji: '🎀', color: 'bg-pink-100', category: 'TV Stars', voice: 'Kore' },
  { id: 'grogu', name: 'Baby Alien', description: 'Uses the force and eats frogs.', emoji: '🐸', color: 'bg-green-50', category: 'TV Stars', voice: 'Kore' },

  // Adventurers
  { id: 'moana', name: 'Island Voyager', description: 'Sails the ocean to save her people.', emoji: '🌺', color: 'bg-orange-100', category: 'Adventurers', voice: 'Zephyr' },
  { id: 'lego', name: 'Master Builder', description: 'Everything is awesome!', emoji: '🧱', color: 'bg-orange-200', category: 'Adventurers', voice: 'Zephyr' },
  { id: 'dora', name: 'Explorer Girl', description: 'Backpack, map, and adventures!', emoji: '🎒', color: 'bg-purple-100', category: 'Adventurers', voice: 'Kore' },
  { id: 'mcqueen', name: 'Race Car', description: 'Speed. I am speed.', emoji: '🏎️', color: 'bg-red-300', category: 'Adventurers', voice: 'Fenrir' },
  { id: 'ash', name: 'Monster Trainer', description: 'Gotta catch them all!', emoji: '🧢', color: 'bg-red-100', category: 'Adventurers', voice: 'Zephyr' },
  { id: 'astronaut', name: 'Space Pilot', description: 'Flies rockets to the moon.', emoji: '👩‍🚀', color: 'bg-indigo-100', category: 'Adventurers', voice: 'Kore' },
  { id: 'diver', name: 'Deep Diver', description: 'Explores sunken ships and reefs.', emoji: '🤿', color: 'bg-cyan-200', category: 'Adventurers', voice: 'Charon' },
  { id: 'pirate_kid', name: 'Kid Pirate', description: 'Searches for buried treasure maps.', emoji: '☠️', color: 'bg-red-50', category: 'Adventurers', voice: 'Fenrir' },

  // Community / Everyday
  { id: 'firefighter', name: 'Firefighter', description: 'Puts out fires and drives a big red truck.', emoji: '🚒', color: 'bg-red-200', category: 'Community', voice: 'Fenrir' },
  { id: 'police', name: 'Police Officer', description: 'Keeps the town safe and helps people.', emoji: '👮‍♀️', color: 'bg-blue-200', category: 'Community', voice: 'Zephyr' },
  { id: 'doctor', name: 'Friendly Doc', description: 'Helps people feel better.', emoji: '🩺', color: 'bg-teal-50', category: 'Community', voice: 'Kore' },
  { id: 'baker', name: 'Master Baker', description: 'Bakes the yummiest cakes and cookies.', emoji: '🧁', color: 'bg-pink-100', category: 'Community', voice: 'Kore' },
  { id: 'farmer', name: 'Happy Farmer', description: 'Grows food and takes care of animals.', emoji: '🚜', color: 'bg-yellow-100', category: 'Community', voice: 'Puck' },
  { id: 'teacher', name: 'Super Teacher', description: 'Teaches reading, writing, and fun games.', emoji: '🏫', color: 'bg-indigo-50', category: 'Community', voice: 'Zephyr' },
  { id: 'construction', name: 'Builder', description: 'Builds tall towers with big machines.', emoji: '👷', color: 'bg-orange-200', category: 'Community', voice: 'Fenrir' },
  { id: 'chef', name: 'Top Chef', description: 'Cooks delicious spaghetti and soup.', emoji: '👨‍🍳', color: 'bg-slate-100', category: 'Community', voice: 'Charon' },
];

const CATEGORIES = [
  { id: 'All', icon: Star, label: 'All' },
  { id: 'Heroes', icon: Zap, label: 'Heroes' },
  { id: 'Magic', icon: Wand2, label: 'Magic' },
  { id: 'Animals', icon: Cat, label: 'Animals' },
  { id: 'TV Stars', icon: Tv, label: 'TV Stars' },
  { id: 'Adventurers', icon: Briefcase, label: 'Action' },
  { id: 'Community', icon: User, label: 'People' },
];

export const CharacterSelect: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredCharacters = selectedCategory === 'All' 
    ? CHARACTERS 
    : CHARACTERS.filter(c => c.category === selectedCategory);

  const handleSelect = (char: Character) => {
    localStorage.setItem('selectedCharacter', JSON.stringify(char));
    navigate('/setting');
  };

  return (
    <div className="min-h-screen bg-indigo-50 p-6 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 w-6 h-6" /> <span className="text-xl font-bold">Back</span>
          </Button>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-6xl font-black text-indigo-900 mb-4 tracking-tight">Choose Your Hero</h2>
          <p className="text-xl md:text-2xl text-indigo-600 font-bold">Who will go on an adventure today?</p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10 sticky top-4 z-20 bg-indigo-50/95 p-3 rounded-3xl backdrop-blur-sm shadow-sm">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center px-5 py-2.5 rounded-full text-base md:text-lg font-bold transition-all transform active:scale-95 ${
                  isSelected 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                    : 'bg-white text-slate-600 hover:bg-indigo-100 border-2 border-indigo-100'
                }`}
              >
                <Icon className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredCharacters.map((char) => (
            <button
              key={char.id}
              onClick={() => handleSelect(char)}
              className={`${char.color} group relative overflow-hidden rounded-[2.5rem] p-8 text-left transition-all hover:scale-[1.02] hover:shadow-2xl border-4 border-white hover:border-indigo-300 shadow-lg ring-1 ring-black/5`}
            >
              {/* Background Pattern */}
              <div className="absolute right-[-20px] top-[-20px] text-[10rem] opacity-10 group-hover:opacity-20 group-hover:rotate-12 transition-all select-none pointer-events-none">
                {char.emoji}
              </div>
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-7xl filter drop-shadow-md transform group-hover:scale-110 transition-transform duration-300">{char.emoji}</span>
                  <span className="text-sm font-black bg-white/50 px-3 py-1.5 rounded-xl text-slate-600 uppercase tracking-wider">{char.category}</span>
                </div>
                
                <div className="mt-auto">
                  <h3 className="text-3xl font-black text-slate-800 mb-2 leading-none">{char.name}</h3>
                  <p className="text-slate-800/80 text-lg font-bold leading-tight">{char.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};