import { createContext, useContext, useEffect, useState } from 'react'

export type SiteView = 'standard' | 'salesforce'

interface ViewContextType {
  view: SiteView
  setView: (v: SiteView) => void
  toggleView: () => void
}

const ViewContext = createContext<ViewContextType>({
  view: 'standard',
  setView: () => {},
  toggleView: () => {},
})

// Record-page deep links (e.g. /#tab-details_accordion-experience) always open the Salesforce view
const SF_DEEP_LINK = /^#tab-/

export function ViewProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<SiteView>(() => {
    if (SF_DEEP_LINK.test(window.location.hash)) return 'salesforce'
    return localStorage.getItem('site-view') === 'salesforce' ? 'salesforce' : 'standard'
  })

  useEffect(() => {
    localStorage.setItem('site-view', view)
    document.documentElement.classList.toggle('sf-mode', view === 'salesforce')
  }, [view])

  const toggleView = () => setView(v => (v === 'salesforce' ? 'standard' : 'salesforce'))

  return (
    <ViewContext.Provider value={{ view, setView, toggleView }}>
      {children}
    </ViewContext.Provider>
  )
}

export const useView = () => useContext(ViewContext)
