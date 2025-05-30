/**
 * USStatesMap Component
 * 
 * A grid-based interactive US states map for Tax Scanner v2
 * Displays all 50 US states in a geographical grid layout with visual feedback
 * for supported vs. unsupported states.
 * 
 * Features:
 * - Grid layout that approximates US geographical positioning
 * - Visual distinction between supported (green) and unsupported (gray) states
 * - Hover effects with state information tooltips
 * - Click handlers for supported states
 * - Separate positioning for Alaska and Hawaii
 * - Legend showing state count and status
 * 
 * @version 0.3.0 - Grid layout implementation
 * @author Tax Scanner v2 Team
 * @since 0.3.0
 */

'use client'

import { useState } from 'react'

interface USStatesMapProps {
  onStateSelect: (stateCode: string, stateName: string) => void
  supportedStates: Array<{ code: string; name: string }>
  className?: string
}

/**
 * Interactive US States Map Component
 * 
 * Renders a grid-based map of US states with interactive features.
 * Supported states are highlighted in green and clickable, while
 * unsupported states are shown in gray.
 */
export default function USStatesMap({ onStateSelect, supportedStates, className = '' }: USStatesMapProps) {
  // State for tracking which state is currently being hovered
  const [hoveredState, setHoveredState] = useState<string | null>(null)

  /**
   * Check if a state is currently supported by the application
   * @param stateCode - Two-letter state code (e.g., 'TX', 'CA')
   * @returns boolean indicating if state is supported
   */
  const isSupported = (stateCode: string) => {
    return supportedStates.some(state => state.code === stateCode)
  }

  /**
   * Get the full name of a state from its code
   * @param stateCode - Two-letter state code
   * @returns Full state name or code if not found
   */
  const getStateName = (stateCode: string) => {
    return supportedStates.find(state => state.code === stateCode)?.name || stateCode
  }

  /**
   * Handle state selection for supported states
   * @param stateCode - Two-letter state code
   */
  const handleStateClick = (stateCode: string) => {
    if (isSupported(stateCode)) {
      const stateName = getStateName(stateCode)
      onStateSelect(stateCode, stateName)
    }
  }

  /**
   * Generate Tailwind CSS classes for state styling based on support status
   * @param stateCode - Two-letter state code
   * @returns CSS class string for the state
   */
  const getStateStyle = (stateCode: string) => {
    const supported = isSupported(stateCode)
    const hovered = hoveredState === stateCode
    
    if (supported) {
      // Green styling for supported states with hover effects
      return `
        ${hovered ? 'bg-emerald-600' : 'bg-emerald-500'} 
        text-white cursor-pointer shadow-md hover:shadow-lg 
        transform hover:scale-105 transition-all duration-200
      `
    } else {
      // Gray styling for unsupported states
      return `
        bg-gray-200 text-gray-500 cursor-not-allowed 
        opacity-70
      `
    }
  }

  /**
   * US States Grid Layout
   * 
   * Organized in a 7x7 grid that roughly approximates the geographical
   * layout of the United States. Each row represents a latitude band,
   * with states positioned to maintain recognizable geographical relationships.
   * 
   * null values represent empty grid spaces (ocean, Canada, Mexico)
   * Alaska and Hawaii are positioned separately below the main grid
   */
  const stateGrid = [
    // Row 1 - Northernmost states (Maine, northern border)
    [null, null, null, null, null, 'ME', null],
    
    // Row 2 - Northern tier states
    [null, 'WA', 'ID', 'MT', 'ND', 'MN', 'WI', 'MI', null, 'VT', 'NH'],
    
    // Row 3 - Northern central states
    ['OR', null, 'WY', 'SD', 'IA', 'IL', 'IN', 'OH', 'PA', 'NY', 'MA', 'CT', 'RI'],
    
    // Row 4 - Central states
    ['CA', 'NV', 'UT', 'CO', 'NE', 'MO', 'KY', 'WV', 'VA', 'MD', 'DE', 'NJ'],
    
    // Row 5 - Southern central states
    [null, 'AZ', 'NM', 'KS', 'AR', 'TN', 'NC', null],
    
    // Row 6 - Southern states
    [null, null, null, 'OK', 'LA', 'MS', 'AL', 'GA', 'SC'],
    
    // Row 7 - Southernmost states
    [null, null, null, 'TX', null, null, null, 'FL'],
  ]

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-gradient-to-b from-blue-50 to-blue-100 p-8 rounded-xl shadow-inner">
        
        {/* Main US Map Grid */}
        <div className="flex flex-col items-center space-y-2 mb-8">
          {stateGrid.map((row, rowIndex) => (
            <div key={rowIndex} className="flex space-x-2">
              {row.map((state, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="w-12 h-8 flex items-center justify-center"
                >
                  {state ? (
                    <div
                      className={`
                        w-full h-full rounded text-xs font-bold 
                        flex items-center justify-center
                        ${getStateStyle(state)}
                      `}
                      onMouseEnter={() => setHoveredState(state)}
                      onMouseLeave={() => setHoveredState(null)}
                      onClick={() => handleStateClick(state)}
                      title={state}
                    >
                      {state}
                    </div>
                  ) : (
                    <div className="w-full h-full"></div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Alaska and Hawaii */}
        <div className="flex justify-center space-x-8 mt-4">
          <div
            className={`
              w-16 h-12 rounded text-xs font-bold 
              flex items-center justify-center
              ${getStateStyle('AK')}
            `}
            onMouseEnter={() => setHoveredState('AK')}
            onMouseLeave={() => setHoveredState(null)}
            onClick={() => handleStateClick('AK')}
            title="Alaska"
          >
            AK
          </div>
          <div
            className={`
              w-16 h-12 rounded text-xs font-bold 
              flex items-center justify-center
              ${getStateStyle('HI')}
            `}
            onMouseEnter={() => setHoveredState('HI')}
            onMouseLeave={() => setHoveredState(null)}
            onClick={() => handleStateClick('HI')}
            title="Hawaii"
          >
            HI
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-6 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-emerald-500 rounded-md shadow-sm"></div>
          <span className="text-gray-700 font-medium">Supported States ({supportedStates.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-200 rounded-md shadow-sm"></div>
          <span className="text-gray-500">Coming Soon ({50 - supportedStates.length} states)</span>
        </div>
      </div>
      
      {/* Hover tooltip */}
      {hoveredState && (
        <div className="mt-4 text-center">
          <div className="inline-block bg-white p-4 rounded-lg shadow-lg border border-gray-200">
            <p className="text-sm font-medium">
              {isSupported(hoveredState) ? (
                <span className="text-emerald-600">
                  ✅ <span className="font-bold text-lg">{getStateName(hoveredState)}</span>
                  <br />
                  <span className="text-sm">Click to view tax rates</span>
                </span>
              ) : (
                <span className="text-gray-500">
                  🚧 <span className="font-bold text-lg">{hoveredState}</span>
                  <br />
                  <span className="text-sm">Coming soon!</span>
                </span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 