import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './styles/ascenta.css';
import './styles/home-visuals.css';

const root = document.getElementById('root');
if (!root) throw new Error('ASCENTA root element is missing.');
createRoot(root).render(<StrictMode><BrowserRouter><App /></BrowserRouter></StrictMode>);
