import { useState, useCallback, useRef, type ReactNode } from 'react'
import { AppContext, type AppState } from './useStore'
import type { Reporte, Area, User } from '@/types'

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const u = localStorage.getItem('pbi_user')
    return u ? JSON.parse(u) : null
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('pbi_token'))
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('resumen')
  const [dirFilter, setDirFilter] = useState('')
  const [searchQ, setSearchQ] = useState('')
  const [colFilter, setColFilter] = useState('')
  const [toast, setToast] = useState<{ msg: string; icon: string } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const login = useCallback((t: string, u: User) => {
    setToken(t)
    setUser(u)
    localStorage.setItem('pbi_token', t)
    localStorage.setItem('pbi_user', JSON.stringify(u))
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('pbi_token')
    localStorage.removeItem('pbi_user')
  }, [])

  const updateReporte = useCallback((r: Reporte) => {
    setReportes(prev => prev.map(x => (x.id === r.id ? r : x)))
  }, [])

  const removeReporte = useCallback((id: string) => {
    setReportes(prev => prev.filter(x => x.id !== id))
  }, [])

  const addReporte = useCallback((r: Reporte) => {
    setReportes(prev => [...prev, r])
  }, [])

  const showToast = useCallback((msg: string, icon = '\u2713') => {
    clearTimeout(toastTimer.current)
    setToast({ msg, icon })
    toastTimer.current = setTimeout(() => setToast(null), 2800)
  }, [])

  const value: AppState = {
    user, token, login, logout,
    reportes, areas, setReportes, setAreas,
    updateReporte, removeReporte, addReporte,
    activeId, activeTab, dirFilter, searchQ, colFilter,
    setActiveId, setActiveTab, setDirFilter, setSearchQ, setColFilter,
    toast, showToast,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
