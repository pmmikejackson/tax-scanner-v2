/**
 * USStatesMap Component
 * 
 * An alphabetical list-based interactive US states map for Tax Scanner v2
 * Displays all 50 US states in alphabetical order with visual feedback
 * for supported vs. unsupported states.
 * 
 * Features:
 * - Alphabetical list layout for easy navigation
 * - Rectangular state boxes for consistent appearance
 * - Visual distinction between supported (green) and unsupported (gray) states
 * - Hover effects with state information tooltips
 * - Click handlers for supported states
 * - Responsive grid layout that adapts to screen size
 * - Legend showing state count and status
 * 
 * @version 0.4.0 - Alphabetical list implementation
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
 * Renders an alphabetical list of US states with interactive features.
 * Supported states are highlighted in green and clickable, while
 * unsupported states are shown in gray.
 */
export default function USStatesMap({ onStateSelect, supportedStates, className = '' }: USStatesMapProps) {
  // State for tracking which state is currently being hovered
  const [hoveredState, setHoveredState] = useState<string | null>(null)

  /**
   * Complete list of all 50 US states with codes and full names
   * Organized alphabetically by state name for easy navigation
   */
  const allStates = [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' }
  ]

  /**
   * Check if a state is currently supported by the application
   * @param stateCode - Two-letter state code (e.g., 'TX', 'CA')
   * @returns boolean indicating if state is supported
   */
  const isSupported = (stateCode: string) => {
    return supportedStates.some(state => state.code === stateCode)
  }

  /**
   * Handle state selection for supported states
   * @param stateCode - Two-letter state code
   * @param stateName - Full state name
   */
  const handleStateClick = (stateCode: string, stateName: string) => {
    if (isSupported(stateCode)) {
      onStateSelect(stateCode, stateName)
    }
  }

  /**
   * Generate Tailwind CSS classes for state styling based on support status
   * @param stateCode - Two-letter state code
   * @returns CSS class string for the state box
   */
  const getStateStyle = (stateCode: string) => {
    const supported = isSupported(stateCode)
    const hovered = hoveredState === stateCode
    
    if (supported) {
      // Green styling for supported states with hover effects
      return `
        ${hovered ? 'bg-emerald-600 scale-105' : 'bg-emerald-500'} 
        text-white cursor-pointer shadow-md hover:shadow-lg 
        transform transition-all duration-200 border-2 border-emerald-600
      `
    } else {
      // Gray styling for unsupported states
      return `
        bg-gray-200 text-gray-500 cursor-not-allowed 
        opacity-70 border-2 border-gray-300
        ${hovered ? 'bg-gray-300' : ''}
        transition-all duration-200
      `
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-gradient-to-b from-blue-50 to-blue-100 p-8 rounded-xl shadow-inner">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your State</h2>
          <p className="text-gray-600">Choose from all 50 US states - supported states are highlighted in green</p>
        </div>

        {/* Alphabetical States Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
          {allStates.map((state) => (
            <div
              key={state.code}
              className={`
                p-4 rounded-lg text-center font-semibold text-sm
                min-h-[60px] flex flex-col items-center justify-center
                ${getStateStyle(state.code)}
              `}
              onMouseEnter={() => setHoveredState(state.code)}
              onMouseLeave={() => setHoveredState(null)}
              onClick={() => handleStateClick(state.code, state.name)}
              title={`${state.name} (${state.code})`}
            >
              <div className="font-bold text-lg">{state.code}</div>
              <div className="text-xs opacity-90 leading-tight">{state.name}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-6 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-emerald-500 rounded-md shadow-sm border border-emerald-600"></div>
          <span className="text-gray-700 font-medium">Supported States ({supportedStates.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-200 rounded-md shadow-sm border border-gray-300"></div>
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
                  ✅ <span className="font-bold text-lg">{allStates.find(s => s.code === hoveredState)?.name}</span>
                  <br />
                  <span className="text-sm">Click to view tax rates</span>
                </span>
              ) : (
                <span className="text-gray-500">
                  🚧 <span className="font-bold text-lg">{allStates.find(s => s.code === hoveredState)?.name}</span>
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