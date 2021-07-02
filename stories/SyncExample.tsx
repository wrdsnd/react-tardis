import React, { useState } from 'react'
import { useHistory, HistoryProvider } from '../src'

const generateId = () => Math.random().toString(36).substr(2, 9)

export type HistoryTypes = {
  addUser: {
    user: User
  }
  removeUser: {
    index: number
    user: User
  }
}

type User = {
  id: string
  name: string
}

export const SyncExample = () => {
  const [users, setUsers] = useState<User[]>([])

  const addUser = (user: User) => setUsers([...users, user])
  const dropLastUser = () => setUsers(users.slice(0, -1))
  const dropUserById = (id: string) =>
    setUsers(users.filter((user) => user.id !== id))

  return (
    <HistoryProvider<HistoryTypes>
      config={{
        addUser: {
          redo: (record) => addUser(record.user),
          undo: () => dropLastUser(),
        },
        removeUser: {
          redo: (record) => {
            users.splice(record.index, 1)
          },
          undo: (record) => {
            users.splice(record.index, 0, record.user)
          },
        },
      }}
    >
      <Controls pushToList={addUser} />
      <List list={users} removeUser={dropUserById} />
      <hr />
      <Debug />
    </HistoryProvider>
  )
}

type ControlsProps = {
  pushToList: (user: User) => void
}

const Controls = ({ pushToList }: ControlsProps) => {
  const history = useHistory<HistoryTypes>()
  const [name, setName] = useState('')

  const handleUserSubmit = () => {
    if (!name) {
      return
    }

    setName('')

    const user = {
      name,
      id: generateId(),
    }

    history.add({ type: 'addUser', user })

    pushToList(user)
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleUserSubmit()
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={handleUserSubmit}>Add</button>
      </form>
      <button disabled={!history.canUndo} onClick={() => history.undo()}>
        undo
      </button>
      <button disabled={!history.canRedo} onClick={() => history.redo()}>
        redo
      </button>
    </div>
  )
}

type ListProps = {
  list: User[]
  removeUser: (id: string) => void
}
const List = ({ list, removeUser }: ListProps) => {
  const history = useHistory<HistoryTypes>()

  return (
    <div>
      <h3>Names list</h3>
      {list.length > 0 ? (
        <ul>
          {list.map((user, index) => (
            <li key={user.id}>
              {user.name}{' '}
              <button
                onClick={() => {
                  history.add({ type: 'removeUser', user, index })
                  removeUser(user.id)
                }}
              >
                remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        "Hey, let's add a name!"
      )}
    </div>
  )
}

const Debug = () => {
  const { getFuture, getPast, clearHistory } = useHistory<HistoryTypes>()

  return (
    <div>
      <h3>Debug area</h3>
      <div>
        Past:{' '}
        {getPast()
          .map((record) => record.type + ': ' + record.user.name)
          .join(', ')}
      </div>
      <div>
        Future:{' '}
        {getFuture()
          .map((record) => record.type + ': ' + record.user.name)
          .join(', ')}
      </div>
      <button onClick={clearHistory}>clear history</button>
    </div>
  )
}
