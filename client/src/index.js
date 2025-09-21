// index.js
import React, { useEffect } from 'react'; // Import useEffect
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/global.css';  // Global styles for your app

const root = ReactDOM.createRoot(document.getElementById('root'));

const RootComponent = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Refreshing page every 3 minutes...');
      window.location.reload();
    }, 180000); // 180000 milliseconds = 3 minutes

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, []);

  return (
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
};

root.render(<RootComponent />);