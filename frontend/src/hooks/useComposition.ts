import { useRef, useState } from 'react'

export function useComposition<T extends HTMLElement>() {
  const [isComposing, setIsComposing] = useState(false)
  const compositionEndTimeoutRef = useRef<NodeJS.Timeout>()

  const handleCompositionStart = () => {
    setIsComposing(true)
  }

  const handleCompositionEnd = () => {
    setIsComposing(false)
  }

  return {
    isComposing,
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
  }
}
