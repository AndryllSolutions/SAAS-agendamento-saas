'use client'

interface LineChartProps {
  data: Array<{
    label: string
    value: number
  }>
  height?: number
  color?: string
  showValues?: boolean
}

export function LineChart({ data, height = 100, color = '#6366f1', showValues = false }: LineChartProps) {
  if (!data || data.length === 0) return null

  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue || 1

  // Create SVG path
  const width = 100
  const padding = 10
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1 || 1)) * (width - 2 * padding) + padding
    const y = height - ((item.value - minValue) / range) * (height - 2 * padding) - padding
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="relative w-full" style={{ height: `${height}px` }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {/* Gradient */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.05 }} />
          </linearGradient>
        </defs>

        {/* Area under line */}
        <polygon
          points={`${padding},${height} ${points} ${width - padding},${height}`}
          fill="url(#lineGradient)"
        />

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {data.map((item, index) => {
          const x = (index / (data.length - 1 || 1)) * (width - 2 * padding) + padding
          const y = height - ((item.value - minValue) / range) * (height - 2 * padding) - padding
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="1.5"
              fill="white"
              stroke={color}
              strokeWidth="1.5"
            />
          )
        })}
      </svg>
    </div>
  )
}
