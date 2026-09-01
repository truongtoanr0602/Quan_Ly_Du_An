import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { cartService } from '../services/cartService'
import type { Cart } from '../types/cart'

const emptyCart: Cart = { items: [], totalItems: 0, totalAmount: 0 }

export interface CartContextValue {
  cart: Cart
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  add: (productID: number, quantity: number) => Promise<void>
  update: (productID: number, quantity: number) => Promise<void>
  remove: (productID: number) => Promise<void>
  clear: () => Promise<void>
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState<Cart>(emptyCart)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async (operation: () => Promise<Cart | void>) => {
    setError(null)
    try {
      const result = await operation()
      if (result) setCart(result)
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Khong the cap nhat gio hang.')
      throw reason
    }
  }

  const refresh = async () => {
    if (!isAuthenticated) {
      setCart(emptyCart)
      return
    }
    setIsLoading(true)
    try {
      await run(() => cartService.get())
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void refresh().catch(() => undefined)
  }, [isAuthenticated])

  const value = useMemo<CartContextValue>(() => ({
    cart,
    isLoading,
    error,
    refresh,
    add: (productID, quantity) => run(() => cartService.add(productID, quantity)),
    update: (productID, quantity) => run(() => cartService.update(productID, quantity)),
    remove: async (productID) => {
      await run(() => cartService.remove(productID))
      await refresh()
    },
    clear: async () => {
      await run(() => cartService.clear())
      setCart(emptyCart)
    },
  }), [cart, isLoading, error, isAuthenticated])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}
