import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { createId } from './createId'

const NavigationContext = createContext(null)
const STATE_KEY = 'skillaiNavigation'
const initialView = () => ({ page: 'dashboard', mobileOpen: false, search: '' })

// Keep the router's own history state intact; portal steps share its existing URL.
export function PortalNavigation({ children }) {
  const stored = window.history.state?.[STATE_KEY]
  const session = useRef(null)
  if (session.current === null) session.current = stored?.session || createId()
  const [view, setView] = useState(() => stored?.view || initialView())
  const current = useRef(view)
  const write = useCallback((next, replace = false) => {
    current.current = next
    setView(next)
    window.history[replace ? 'replaceState' : 'pushState'](
      { ...window.history.state, [STATE_KEY]: { session: session.current, view: next } },
      '', window.location.href,
    )
  }, [])

  useEffect(() => {
    write(current.current, true)
    const onPop = event => {
      const entry = event.state?.[STATE_KEY]
      if (entry?.session !== session.current) {
        write(initialView(), true)
        return
      }
      current.current = entry.view
      setView(entry.view)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [write])

  const change = useCallback((key, value, fallback) => {
    const prev = current.current
    const before = prev[key] ?? fallback
    const next = typeof value === 'function' ? value(before) : value
    if (Object.is(before, next)) return
    if (key === 'page') {
      // Choosing a destination replaces its open menu/search step.
      write({ ...initialView(), page: next }, Boolean(prev.mobileOpen || prev.search))
    } else if ((next === fallback || !next) && before) {
      // Explicit Close and phone Back consume the very same step.
      window.history.back()
    } else {
      write({ ...prev, [key]: next }, key === 'search' && Boolean(before))
    }
  }, [write])

  const reset = useCallback(() => {
    session.current = createId()
    write(initialView(), true)
  }, [write])

  return <NavigationContext.Provider value={{ view, change, reset }}>{children}</NavigationContext.Provider>
}

export function usePortalState(key, fallback) {
  const navigation = useContext(NavigationContext)
  if (!navigation) throw new Error('PortalNavigation is required')
  const setValue = useCallback(value => navigation.change(key, value, fallback), [navigation.change, key, fallback])
  return [navigation.view[key] ?? fallback, setValue]
}

export function useResetNavigation() {
  const navigation = useContext(NavigationContext)
  if (!navigation) throw new Error('PortalNavigation is required')
  return navigation.reset
}