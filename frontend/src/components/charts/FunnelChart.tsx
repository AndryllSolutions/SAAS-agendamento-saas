'use client'

interface FunnelChartProps {
  data: Array<{
    label: string
    count: number
    percentage: number
  }>
  title?: string
}

export function FunnelChart({ data, title }: FunnelChartProps) {
  // Calculate width percentages for visual effect
  const maxCount = data[0]?.count || 1

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      )}
      
      <div className="space-y-2">
        {data.map((item, index) => {
          const widthPercentage = (item.count / maxCount) * 100
          const colors = [
            'bg-indigo-500',
            'bg-indigo-400',
            'bg-indigo-300'
          ]
          
          return (
            <div key={index} className="relative">
              {/* Funnel segment */}
              <div className="flex items-center justify-center">
                <div
                  className={`${colors[index]} text-white font-medium rounded-lg py-6 px-4 transition-all duration-300 hover:shadow-lg`}
                  style={{ width: `${widthPercentage}%`, minWidth: '60%' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{item.count}</span>
                      <span className="text-sm opacity-90">({item.percentage.toFixed(0)}%)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Connection line to next segment */}
              {index < data.length - 1 && (
                <div className="flex justify-center my-1">
                  <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
