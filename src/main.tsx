import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#0066b3',
                    colorBgContainer: '#ffffff',
                    borderRadius: 8,
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                },
            }}
        >
            <App />
        </ConfigProvider>
    </StrictMode>,
)
