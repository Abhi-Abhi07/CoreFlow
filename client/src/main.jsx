import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux'
import store from './redux/store.js';
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'
import ThemeProvider from './components/ThemeProvider.jsx';

let persistor = persistStore(store)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
        <App />
        <Toaster 
            position="bottom-right"
            reverseOrder={false}
          />
        </ThemeProvider>
        </PersistGate>
    </Provider>
  </StrictMode>,
)