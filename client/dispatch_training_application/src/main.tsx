import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ConfigProvider, Button, Typography, theme, } from 'antd'
import './App.css'
import { AuthProvider } from './contexts/AuthProvider.tsx'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
     theme={{
      algorithm: theme.defaultAlgorithm,  
      token: {
        colorPrimary: '#8c2131',
        colorInfo: '#8c2131',
        fontFamily: 'Inter, sans-serif',
        
      }
     }}
    >
      <AuthProvider>
      <App />
    </AuthProvider>
    </ConfigProvider>
  </StrictMode>,
)
