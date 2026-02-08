import { useState, useEffect } from 'react'
import { useDebounce } from './useDebounce'

export function usePersistentState(key, defaultValue, delay = 500) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : defaultValue
    } catch {
      return defaultValue
    }
  })
  
  const debouncedSave = useDebounce((value) => {
    localStorage.setItem(key, JSON.stringify(value))
  }, delay)
  
  useEffect(() => {
    debouncedSave(state)
  }, [state, debouncedSave])
  
  return [state, setState]
}

export function usePersistentNumber(key, defaultValue, delay = 500) {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(key)
    return saved ? parseInt(saved, 10) : defaultValue
  })
  
  const debouncedSave = useDebounce((value) => {
    localStorage.setItem(key, value.toString())
  }, delay)
  
  useEffect(() => {
    debouncedSave(state)
  }, [state, debouncedSave])
  
  return [state, setState]
}

export function usePersistentBoolean(key, defaultValue = false) {
  const [state, setState] = useState(() => {
    return localStorage.getItem(key) === 'true' || defaultValue
  })
  
  useEffect(() => {
    localStorage.setItem(key, state.toString())
  }, [key, state])
  
  return [state, setState]
}

export function usePersistentString(key, defaultValue = '') {
  const [state, setState] = useState(() => {
    return localStorage.getItem(key) || defaultValue
  })
  
  useEffect(() => {
    localStorage.setItem(key, state)
  }, [key, state])
  
  return [state, setState]
}
