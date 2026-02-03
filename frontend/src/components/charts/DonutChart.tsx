'use client'

interface DonutChartProps {
  data: Array<{
    label: string
    value: number
    percentage: number
    color: string
  }>
  total?: number
  title?: string
  showLegend?: boolean
}

export function DonutChart({ data, total, title, showLegend = true }: DonutChartProps) {
  // Calculate angles for each segment
  let currentAngle = -90 // Start at top
  const segments = data.map(item => {
    const angle = (item.percentage / 100) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle
    return { ...item, startAngle, endAngle, angle }
  })

  // SVG donut chart parameters
  const size = 200
  const strokeWidth = 40
  const radius = (size - strokeWidth) / 2
  const center = size / 2

  // Convert polar to cartesian
  const polarToCartesian = (angle: number) => {
    const radian = (angle * Math.PI) / 180
    return {
      x: center + radius * Math.cos(radian),
      y: center + radius * Math.sin(radian)
    }
  }

  // Create arc path
  const createArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(startAngle)
    const end = polarToCartesian(endAngle)
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
    
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      )}
      
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-0">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          
          {/* Data segments */}
          {segments.map((segment, index) => (
            <g key={index}>
              <path
                d={createArc(segment.startAngle, segment.endAngle)}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                className="transition-all duration-300 hover:opacity-80"
              />
            </g>
          ))}
        </svg>
        
        {/* Center text */}
        {total !== undefined && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">Total</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {total}
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="w-full space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {item.value}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  ({item.percentage.toFixed(0)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
