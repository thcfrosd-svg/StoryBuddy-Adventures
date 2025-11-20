import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Setting } from '../types';
import { ArrowLeft, Globe, Moon, Sun, Rocket, Ghost, Landmark, Music, Shield, Users, Building2 } from 'lucide-react';

const SETTINGS: Setting[] = [
  // Magical
  { id: 'forest', name: 'Fairy Forest', description: 'Glowing mushrooms and talking trees.', emoji: '🍄', category: 'Magical' },
  { id: 'castle', name: 'Royal Castle', description: 'Knights, dragons, and secret towers.', emoji: '🏰', category: 'Magical' },
  { id: 'candy', name: 'Candy Kingdom', description: 'Rivers of chocolate and lollipop trees.', emoji: '🍭', category: 'Magical' },
  { id: 'clouds', name: 'Cloud City', description: 'A city floating high in the blue sky.', emoji: '☁️', category: 'Magical' },
  { id: 'toy', name: 'Toy Land', description: 'Where toys come to life and play.', emoji: '🧸', category: 'Magical' },
  { id: 'winter', name: 'Ice Palace', description: 'A frozen wonderland of snow.', emoji: '❄️', category: 'Magical' },
  { id: 'beanstalk', name: 'Giant Beanstalk', description: 'Climbing high above the clouds.', emoji: '🌱', category: 'Magical' },
  { id: 'wizard_tower', name: 'Wizard Tower', description: 'Full of spell books and potions.', emoji: '🔮', category: 'Magical' },

  // Nature
  { id: 'jungle', name: 'Wild Jungle', description: 'Big leaves, vines, and roaring animals.', emoji: '🌴', category: 'Nature' },
  { id: 'beach', name: 'Sunny Beach', description: 'Sandcastles, crabs, and ocean waves.', emoji: '🏖️', category: 'Nature' },
  { id: 'underwater', name: 'Coral Reef', description: 'Fish, mermaids, and sunken ships.', emoji: '🐠', category: 'Nature' },
  { id: 'dino', name: 'Dino Valley', description: 'Giant ferns and stomping dinosaurs.', emoji: '🦕', category: 'Nature' },
  { id: 'mountain', name: 'Snowy Peak', description: 'High mountains with eagles and goats.', emoji: '🏔️', category: 'Nature' },
  { id: 'safari', name: 'Safari Plains', description: 'Lions, zebras, and giraffes running free.', emoji: '🦓', category: 'Nature' },
  { id: 'desert', name: 'Sandy Desert', description: 'Camels, oasis, and endless sand.', emoji: '🐪', category: 'Nature' },
  { id: 'volcano', name: 'Volcano Island', description: 'Hot lava (safe distance!) and palm trees.', emoji: '🌋', category: 'Nature' },
  { id: 'arctic', name: 'Arctic Ice', description: 'Polar bears, penguins, and auroras.', emoji: '🧊', category: 'Nature' },

  // Space
  { id: 'space', name: 'Deep Space', description: 'Stars, planets, and comets.', emoji: '🌌', category: 'Space' },
  { id: 'moon', name: 'Moon Base', description: 'Walking on the moon with low gravity.', emoji: '🌖', category: 'Space' },
  { id: 'mars', name: 'Red Planet', description: 'Dusty red rocks and alien rovers.', emoji: '🪐', category: 'Space' },
  { id: 'alien', name: 'Alien City', description: 'Flying saucers and green friends.', emoji: '👽', category: 'Space' },
  { id: 'station', name: 'Space Station', description: 'Floating labs and looking at Earth.', emoji: '🛰️', category: 'Space' },

  // Music (New)
  { id: 'concert', name: 'Mega Concert', description: 'Bright lights, loud music, and dancing crowds.', emoji: '🎤', category: 'Music' },
  { id: 'neon_city', name: 'Neon Seoul', description: 'Glowing streets and tall skyscrapers at night.', emoji: '🌃', category: 'Music' },
  { id: 'recording', name: 'Music Studio', description: 'Microphones and mixing boards for hit songs.', emoji: '🎧', category: 'Music' },

  // Heroes (New)
  { id: 'hero_base', name: 'Secret Base', description: 'High-tech gadgets and mission screens.', emoji: '🛡️', category: 'Heroes' },
  { id: 'rooftops', name: 'City Rooftops', description: 'Jumping between buildings under the stars.', emoji: '🌃', category: 'Heroes' },

  // Community (New)
  { id: 'fire_station', name: 'Fire Station', description: 'Red trucks, poles to slide down, and Dalmatians.', emoji: '🚒', category: 'Community' },
  { id: 'hospital', name: 'City Hospital', description: 'Helping people get better with kindness.', emoji: '🏥', category: 'Community' },
  { id: 'bakery', name: 'Sweet Bakery', description: 'Smells like fresh bread and yummy cupcakes.', emoji: '🥖', category: 'Community' },
  { id: 'construction', name: 'Building Site', description: 'Cranes, hard hats, and big digging machines.', emoji: '🏗️', category: 'Community' },

  // Places
  { id: 'school', name: 'Magic School', description: 'Classes for flying and potion making.', emoji: '📚', category: 'Places' },
  { id: 'city', name: 'Super City', description: 'Tall buildings and heroes flying by.', emoji: '🏙️', category: 'Places' },
  { id: 'pirate', name: 'Pirate Ship', description: 'Sailing the sea for buried treasure.', emoji: '🏴‍☠️', category: 'Places' },
  { id: 'farm', name: 'Happy Farm', description: 'Cows, chickens, and tractor rides.', emoji: '🚜', category: 'Places' },
  { id: 'zoo', name: 'City Zoo', description: 'Seeing all the animals in the city.', emoji: '🐒', category: 'Places' },
  { id: 'circus', name: 'Big Circus', description: 'Clowns, acrobats, and popcorn.', emoji: '🎪', category: 'Places' },
  { id: 'playground', name: 'Super Park', description: 'Slides, swings, and climbing frames.', emoji: '🎠', category: 'Places' },
  { id: 'library', name: 'Grand Library', description: 'Millions of books and secret passages.', emoji: '📖', category: 'Places' },
  { id: 'store', name: 'Supermarket', description: 'Yummy food and riding in the cart.', emoji: '🛒', category: 'Places' },
  { id: 'studio', name: 'Movie Studio', description: 'Cameras, lights, and action!', emoji: '🎬', category: 'Places' },

  // Spooky (Fun)
  { id: 'haunted', name: 'Spooky House', description: 'Friendly ghosts and creaky floors.', emoji: '👻', category: 'Spooky' },
  { id: 'halloween', name: 'Pumpkin Patch', description: 'Jack-o-lanterns and black cats.', emoji: '🎃', category: 'Spooky' },
  { id: 'cave', name: 'Dark Cave', description: 'Bats, echoes, and glowing crystals.', emoji: '🦇', category: 'Spooky' },
  
  // History
  { id: 'pyramid', name: 'Ancient Pyramid', description: 'Mummies and hidden gold treasure.', emoji: '🏺', category: 'History' },
  { id: 'viking', name: 'Viking Ship', description: 'Shields, oars, and stormy seas.', emoji: '🛡️', category: 'History' },
  { id: 'west', name: 'Wild West', description: 'Horses, cowboys, and campfires.', emoji: '🤠', category: 'History' },
];

const CATEGORIES = [
  { id: 'All', icon: Globe, label: 'All' },
  { id: 'Magical', icon: Sun, label: 'Magical' },
  { id: 'Nature', icon: Globe, label: 'Nature' },
  { id: 'Space', icon: Rocket, label: 'Space' },
  { id: 'Music', icon: Music, label: 'Music' },
  { id: 'Heroes', icon: Shield, label: 'Heroes' },
  { id: 'Community', icon: Users, label: 'Community' },
  { id: 'Places', icon: Building2, label: 'Places' },
  { id: 'History', icon: Landmark, label: 'History' },
  { id: 'Spooky', icon: Ghost, label: 'Spooky' },
];

export const SettingSelect: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredSettings = selectedCategory === 'All'
    ? SETTINGS
    : SETTINGS.filter(s => s.category === selectedCategory);

  const handleSelect = (setting: Setting) => {
    localStorage.setItem('selectedSetting', JSON.stringify(setting));
    navigate('/adventure');
  };

  return (
    <div className="min-h-screen bg-indigo-50 p-6 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/character')}>
            <ArrowLeft className="mr-2 w-6 h-6" /> <span className="text-xl font-bold">Back</span>
          </Button>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-6xl font-black text-indigo-900 mb-4 tracking-tight">Where to?</h2>
          <p className="text-xl md:text-2xl text-indigo-600 font-bold">Pick a world to explore!</p>
        </div>

         {/* Category Tabs */}
         <div className="flex flex-wrap justify-center gap-3 mb-10 sticky top-4 z-20 bg-indigo-50/95 p-3 rounded-3xl backdrop-blur-sm">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center px-6 py-3 rounded-full text-base md:text-lg font-bold transition-all transform hover:scale-105 ${
                  isSelected 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                    : 'bg-white text-slate-600 hover:bg-indigo-100 border-2 border-indigo-100'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSettings.map((setting) => (
            <button
              key={setting.id}
              onClick={() => handleSelect(setting)}
              className="bg-white group relative rounded-[2.5rem] p-8 text-left transition-all hover:scale-[1.02] hover:shadow-xl border-4 border-indigo-50 hover:border-indigo-400 ring-1 ring-black/5"
            >
               <div className="flex items-center justify-between mb-4">
                  <span className="text-6xl bg-indigo-50 p-4 rounded-2xl shadow-inner">{setting.emoji}</span>
                  <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                    <ArrowLeft className="rotate-180 text-indigo-600 w-8 h-8" />
                  </div>
               </div>
              
              <h3 className="text-3xl font-black text-indigo-900 mb-2">{setting.name}</h3>
              <p className="text-slate-600 text-lg font-bold leading-snug">{setting.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};