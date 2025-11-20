export interface Character {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  category: string;
  voice: string; // 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr'
}

export interface StoryState {
  narrative: string;
  choices: string[];
  imagePrompt: string;
}

export interface AdventureHistoryItem {
  role: 'user' | 'model';
  text: string;
}

export interface Setting {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: string;
}