import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './app/store'
import { setTheme } from './features/theme/themeSlice'
import './index.css'
import App from './App.tsx'

const initialTheme = store.getState().theme.theme
document.documentElement.setAttribute('data-theme', initialTheme)
store.dispatch(setTheme(initialTheme))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)