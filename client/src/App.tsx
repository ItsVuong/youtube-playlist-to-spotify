import React, { useEffect } from 'react';
import './App.css';
import FrontPage from './components/FrontPage/FrontPage';

function App() {
  useEffect(() => {
    document.title = "MagicalTaco";
  }, []);

  return (
    <div>
      <FrontPage />
    </div>
  );
}

export default App;
