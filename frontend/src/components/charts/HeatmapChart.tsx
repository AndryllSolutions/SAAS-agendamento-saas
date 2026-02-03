'use client'

interface HeatmapChartProps {
  data: number[][] // Matrix [days][hours]
  days: string[]
  hours: number[]
  title?: string
}

export function HeatmapChart({ data, days, hours, title }: HeatmapChartProps) {
  // Calculate max value for color scaling
  const maxValue = Math.max(...data.flat())
  
  // Get color intensity based on value
  const getColor = (value: number) => {
    if (value === 0) return 'bg-gray-100 dark:bg-gray-800'
    const intensity = (value / maxValue) * 100
    if (intensity < 20) return 'bg-indigo-200 dark:bg-indigo-900'
    if (intensity < 40) return 'bg-indigo-300 dark:bg-indigo-800'
    if (intensity < 60) return 'bg-indigo-400 dark:bg-indigo-700'
    if (intensity < 80) return 'bg-indigo-500 dark:bg-indigo-600'
    return 'bg-indigo-600 dark:bg-indigo-500'
  }

  // Filter to show only business hours (8h-19h)
  const businessHours = hours.filter(h => h >= 8 && h <= 19)

  return (
    <div className="w-full overflow-x-auto">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      )}
      
      <div className="inline-block min-w-full">
        <div className="flex">
          {/* Hours column */}
          <div className="flex flex-col">
            <div className="h-12" /> {/* Spacer for day headers */}
            {businessHours.map(hour => (
              <div
                key={hour}
                className="h-10 w-16 flex items-center justify-end pr-2 text-xs text-gray-600 dark:text-gray-400"
              >
                {hour}h
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="flex-1 flex gap-1">
            {days.map((day, dayIndex) => (
              <div key={dayIndex} className="flex-1 min-w-[80px]">
                {/* Day header */}
                <div className="h-12 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {day}
                </div>
                
                {/* Hour cells */}
                <div className="space-y-1">
                  {businessHours.map(hour => {
                    const value = data[dayIndex]?.[hour] || 0
                    return (
                      <div
                        key={hour}
                        className={`h-10 rounded ${getColor(value)} flex items-center justify-center text-xs font-medium transition-all duration-200 hover:ring-2 hover:ring-indigo-400 cursor-pointer group relative`}
                      >
                        <span className={value > 0 ? 'text-white' : 'text-gray-400'}>
                          {value || ''}
                        </span>
                        
                        {/* Tooltip */}
                        {value > 0 && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {value} agendamentos
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <span>Menos</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="w-4 h-4 rounded bg-indigo-200 dark:bg-indigo-900" />
            <div className="w-4 h-4 rounded bg-indigo-300 dark:bg-indigo-800" />
            <div className="w-4 h-4 rounded bg-indigo-400 dark:bg-indigo-700" />
            <div className="w-4 h-4 rounded bg-indigo-500 dark:bg-indigo-600" />
            <div className="w-4 h-4 rounded bg-indigo-600 dark:bg-indigo-500" />
          </div>
          <span>Mais</span>
        </div>
      </div>
    </div>
  )
}
