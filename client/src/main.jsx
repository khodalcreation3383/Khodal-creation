import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { store } from './store/store.js'
import { SettingsProvider } from './context/SettingsContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <SettingsProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { background: '#1a237e', color: '#fff', borderRadius: '8px' },
              success: { style: { background: '#2e7d32', color: '#fff' } },
              error: { style: { background: '#c62828', color: '#fff' } }
            }}
          />
        </SettingsProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)
