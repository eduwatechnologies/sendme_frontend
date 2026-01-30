'use client'
import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from '../lib/store'
import { loadUser } from '../lib/features/auth/authSlice'

export default function StoreProvider({
  children
}: {
  children: React.ReactNode
}) {
  const storeRef = useRef<AppStore>(null)
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
    // Attempt to load user from localStorage on initialization
    storeRef.current.dispatch(loadUser())
  }

  return <Provider store={storeRef.current}>{children}</Provider>
}
