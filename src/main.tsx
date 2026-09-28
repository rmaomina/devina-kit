import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { JiraAuthProvider } from './contexts/JiraAuthContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <JiraAuthProvider>
          <App />
        </JiraAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
