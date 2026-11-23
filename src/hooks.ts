import { useCallback, useEffect, useState } from 'react'

export function usePersistentState<T extends string>(key: string, initial: () => T) {
  const [value, setValue] = useState<T>(() => {
    try {
      return (localStorage.getItem(key) as T | null) ?? initial()
    } catch {
      return initial()
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, value)
    } catch {
      return
    }
  }, [key, value])

  return [value, setValue] as const
}

const readHash = () => new URLSearchParams(window.location.hash.replace(/^#/, ''))

export function useHashParams() {
  const [params, setParams] = useState(readHash)

  useEffect(() => {
    const onChange = () => setParams(readHash())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const update = useCallback((next: URLSearchParams, { push = false } = {}) => {
    const hash = next.toString()
    const url = `${window.location.pathname}${window.location.search}${hash ? `#${hash}` : ''}`
    window.history[push ? 'pushState' : 'replaceState'](null, '', url)
    setParams(new URLSearchParams(hash))
  }, [])

  return [params, update] as const
}
