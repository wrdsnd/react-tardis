import React, { useState } from 'react'
import { useHistory, HistoryProvider } from '../src'

const generateRandomColor = () =>
  '#' + Math.floor(Math.random() * 16777215).toString(16)

export type HistoryTypes = {
  addColor: {
    code: string
  }
}

export const AsyncExample = () => {
  const [colors, setColors] = useState<string[]>([])

  const addColor = (code: string) => setColors([...colors, code])
  const dropLastColor = () => setColors(colors.slice(0, -1))

  return (
    <HistoryProvider<HistoryTypes>
      config={{
        addColor: {
          redo: () => {},
          undo: () => {
            return new Promise<void>((resolve) => {
              setTimeout(() => {
                dropLastColor()
                resolve()
              }, 1000)
            })
          },
        },
      }}
    >
      <ColorBlocks addColor={addColor} colors={colors} />
      <hr />
      <Debug />
    </HistoryProvider>
  )
}

type BlocksProps = {
  colors: string[]
  addColor: (code: string) => void
}
const ColorBlocks = ({ colors, addColor }: BlocksProps) => {
  const history = useHistory<HistoryTypes>()

  return (
    <div>
      {colors.map((code) => (
        <div key={code} style={{ backgroundColor: code }}>
          {code}
        </div>
      ))}
      <button
        onClick={() => {
          history.undo()
        }}
      >
        undo last push
      </button>
      <button
        onClick={() => {
          const code = generateRandomColor()
          history.add({ type: 'addColor', code })
          addColor(code)
        }}
      >
        push new color
      </button>
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
        {getPast().map((record, index) => (
          <span key={index} style={{ color: record.code, marginRight: 5 }}>
            {record.code}
          </span>
        ))}
      </div>
      <div>
        Future:{' '}
        {getFuture().map((record, index) => (
          <span key={index} style={{ color: record.code, marginRight: 5 }}>
            {record.code}
          </span>
        ))}
      </div>
      <button onClick={clearHistory}>clear history</button>
    </div>
  )
}
