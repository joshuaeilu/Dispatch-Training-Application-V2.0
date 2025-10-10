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
    token: {
      colorPrimary: "#8C2131",   // Calvin maroon
      colorLink: "#8C2131",
      colorBgBase: "#f9f9f9",
      fontFamily: "Inter, sans-serif",
      borderRadius: 8,
    },
    components: {
      Menu: {
        itemSelectedBg: "rgba(140,33,49,0.1)",
        itemSelectedColor: "#8C2131",
        itemHoverColor: "#8C2131",
      },
    },
  }}
>
      <AuthProvider>
      <App />
    </AuthProvider>
    </ConfigProvider>
  </StrictMode>,
)
