export const first = <T>(array: Array<T>): T => {
  const [f] = array
  return f
}

export const last = <T>(array: Array<T>): T => {
  const l = array[array.length - 1]
  return l
}

export const tail = <T>(array: Array<T>): Array<T> => {
  const [, ...rest] = array
  return rest
}

export const initial = <T>(array: Array<T>): Array<T> => {
  return array.slice(0, -1)
}
