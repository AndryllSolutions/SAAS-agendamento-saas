import { useRef, useState } from 'react'

export function useDialogComposition() {
  const [isComposing, setIsComposing] = useState(false)
  const justEndedRef = useRef(false)

  const setComposing = (value: boolean) => {
    setIsComposing(value)
    if (!value) {
      justEndedRef.current = false
    }
  }

  const markCompositionEnd = () => {
    justEndedRef.current = true
  }

  const justEndedComposing = () => {
    return justEndedRef.current
  }

  return {
    isComposing,
    setComposing,
    markCompositionEnd,
    justEndedComposing,
  }
}
