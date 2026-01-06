import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ConfigProvider } from 'antd'
import './App.css'
import { AuthProvider } from './contexts/AuthProvider.tsx'
import { ToastProvider } from './contexts/ToastContext.tsx'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
  theme={{
    token: {
      colorPrimary: "#8C2131",   // Calvin maroon
      colorLink: "#8C2131",
      colorBgBase: "#F8F6F4",
      fontFamily: "Inter, sans-serif",
      borderRadius: 8,
    },
    components: {
      Menu: {
        itemSelectedBg: "rgba(140,33,49,0.1)",
        itemSelectedColor: "#8C2131",
        itemHoverColor: "#8C2131",
      },
        Segmented: {
          itemSelectedBg: "rgba(140,33,49,0.1)",
          itemSelectedColor: "#8C2131",
itemHoverColor: "rgb(130,28,49)"


    }
    },
  }}
>
  <ToastProvider>
      <AuthProvider>
      <App />
    </AuthProvider>
    </ToastProvider>
    </ConfigProvider>
  </StrictMode>,
)
