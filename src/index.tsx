import React, { createContext, useContext, ReactNode, useState } from 'react'
import { first, last, tail, initial } from './utils'

type Record<T extends string, P> = {
  type: T
} & P

type Config<C> = {
  [K in keyof C & string]: {
    undo: (r: Record<K, C[K]>) => void | Promise<void>
    redo: (r: Record<K, C[K]>) => void | Promise<void>
  }
}

export type History<
  C extends {},
  K extends keyof C & string = keyof C & string
> = {
  getFuture: () => Record<K, C[K]>[]
  getPast: () => Record<K, C[K]>[]
  add: <RK extends K>(record: Record<RK, C[RK]>) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  clearHistory: () => void
}

type HistoryProviderProps<C extends {}> = {
  children: ReactNode
  config: Config<C>
}

const HistoryContext = createContext<History<any, any> | undefined>(undefined)

export const HistoryProvider = <C extends {}>({
  children,
  config,
}: HistoryProviderProps<C>) => {
  const [past, setPast] = useState<
    Record<keyof C & string, C[keyof C & string]>[]
  >([])
  const [future, setFuture] = useState<
    Record<keyof C & string, C[keyof C & string]>[]
  >([])

  return (
    <HistoryContext.Provider
      value={{
        getFuture: () => future,
        getPast: () => past,
        canRedo: future.length > 0,
        canUndo: past.length > 0,
        add: (record) => {
          setPast([...past, record])
          setFuture([])
        },
        undo: async () => {
          const lastPastRecord = last(past)
          if (!lastPastRecord) {
            return
          }

          const undoer = config[lastPastRecord.type].undo
          await undoer(lastPastRecord)

          if (past.length === 1) {
            setPast([])
          } else {
            setPast(initial(past))
          }

          setFuture([lastPastRecord, ...future])
        },
        redo: async () => {
          const firstFutureRecord = first(future)
          if (!firstFutureRecord) {
            return
          }

          const redoer = config[firstFutureRecord.type].redo
          await redoer(firstFutureRecord)

          if (future.length === 1) {
            setFuture([])
          } else {
            setFuture(tail(future))
          }

          setPast([...past, firstFutureRecord])
        },
        clearHistory: () => {
          setPast([])
          setFuture([])
        },
      }}
    >
      {children}
    </HistoryContext.Provider>
  )
}

export const HistoryConsumer = <C extends {}>({
  children,
}: {
  children: (context: History<C>) => ReactNode
}) => {
  return (
    <HistoryContext.Consumer>
      {(context?: History<C>) => {
        if (context === undefined) {
          throw new Error(
            'HistoryConsumer must be used within a HistoryProvider',
          )
        }
        return children(context)
      }}
    </HistoryContext.Consumer>
  )
}

export const useHistory = <C extends {}>() => {
  const history = useContext(HistoryContext) as History<C> | undefined

  if (typeof history === 'undefined') {
    throw new Error('useHistory must be used within a HistoryProvider')
  }

  return history
}
