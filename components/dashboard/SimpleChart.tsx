"use client";

interface ChartData {
  labels: string[];
  values: number[];
  colors?: string[];
}

interface SimpleChartProps {
  title: string;
  data: ChartData;
  type: "bar" | "line" | "pie" | "doughnut";
  height?: number;
}

export default function SimpleChart({ title, data, type, height = 300 }: SimpleChartProps) {
  // Filter out invalid values and ensure we have valid data
  const validValues = data.values.filter(v => !isNaN(v) && isFinite(v) && v >= 0);
  const maxValue = validValues.length > 0 ? Math.max(...validValues) : 1;
  const colors = data.colors || [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", 
    "#06B6D4", "#84CC16", "#F97316", "#EC4899", "#6366F1"
  ];

  // If no valid data, show empty state
  if (validValues.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="flex items-center justify-center" style={{ height }}>
          <p className="text-gray-500">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  if (type === "bar") {
    return (
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="space-y-3" style={{ height }}>
          {data.labels.map((label, index) => {
            const value = data.values[index] || 0;
            const safeValue = isNaN(value) ? 0 : value;
            const percentage = maxValue > 0 ? (safeValue / maxValue) * 100 : 0;
            return (
              <div key={index} className="flex items-center">
                <div className="w-24 text-sm text-gray-600 truncate">{label}</div>
                <div className="flex-1 mx-3">
                  <div className="bg-gray-200 rounded-full h-4 relative">
                    <div
                      className="h-4 rounded-full flex items-center justify-end pr-2"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: colors[index % colors.length]
                      }}
                    >
                      <span className="text-xs text-white font-medium">
                        {safeValue > 0 ? safeValue : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-12 text-sm text-gray-900 text-right">{safeValue}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === "pie" || type === "doughnut") {
    const safeValues = data.values.map(v => isNaN(v) || v < 0 ? 0 : v);
    const total = safeValues.reduce((sum, value) => sum + value, 0);
    let cumulativePercentage = 0;

    return (
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="relative">
            <svg width="200" height="200" className="transform -rotate-90">
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="20"
              />
              {safeValues.map((value, index) => {
                const percentage = total > 0 ? (value / total) * 100 : 0;
                const strokeDasharray = `${percentage * 5.02} 502`;
                const strokeDashoffset = -cumulativePercentage * 5.02;
                cumulativePercentage += percentage;

                return (
                  <circle
                    key={index}
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke={colors[index % colors.length]}
                    strokeWidth="20"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>
            {type === "doughnut" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{total}</div>
                  <div className="text-sm text-gray-500">Total</div>
                </div>
              </div>
            )}
          </div>
          <div className="ml-6 space-y-2">
            {data.labels.map((label, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-sm text-gray-600">{label}</span>
                <span className="ml-2 text-sm font-medium text-gray-900">
                  {safeValues[index]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === "line") {
    const svgHeight = height - 60;
    const svgWidth = 400;
    const padding = 40;
    
    // Handle edge cases
    const safeMaxValue = maxValue > 0 ? maxValue : 1;
    const safeValues = data.values.map(v => isNaN(v) || v < 0 ? 0 : v);
    
    return (
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div style={{ height }}>
          <svg width={svgWidth} height={svgHeight} className="overflow-visible">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <line
                key={ratio}
                x1={padding}
                y1={padding + (svgHeight - 2 * padding) * ratio}
                x2={svgWidth - padding}
                y2={padding + (svgHeight - 2 * padding) * ratio}
                stroke="#E5E7EB"
                strokeWidth="1"
              />
            ))}
            
            {/* Line chart */}
            {safeValues.length > 1 && (
              <polyline
                points={safeValues
                  .map((value, index) => {
                    const x = padding + (index * (svgWidth - 2 * padding)) / Math.max(safeValues.length - 1, 1);
                    const y = svgHeight - padding - ((value / safeMaxValue) * (svgHeight - 2 * padding));
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke={colors[0]}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            
            {/* Data points */}
            {safeValues.map((value, index) => {
              const x = padding + (index * (svgWidth - 2 * padding)) / Math.max(safeValues.length - 1, 1);
              const y = svgHeight - padding - ((value / safeMaxValue) * (svgHeight - 2 * padding));
              
              // Ensure coordinates are valid numbers
              if (isNaN(x) || isNaN(y)) return null;
              
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={colors[0]}
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
          
          {/* Labels */}
          <div className="flex justify-between mt-2 px-10">
            {data.labels.map((label, index) => (
              <span key={index} className="text-xs text-gray-500 text-center">
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
