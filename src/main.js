import './styles/global.css';import './styles/responsive.css';import './app.js';

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(error => console.warn('App offline support could not start:', error));
  });
}
