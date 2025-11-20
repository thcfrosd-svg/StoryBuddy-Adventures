import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { CharacterSelect } from './pages/CharacterSelect';
import { SettingSelect } from './pages/SettingSelect';
import { Adventure } from './pages/Adventure';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/character" element={<CharacterSelect />} />
        <Route path="/setting" element={<SettingSelect />} />
        <Route path="/adventure" element={<Adventure />} />
      </Routes>
    </Router>
  );
};

export default App;
