'use client'

interface TaxData {
  state: string
  county: string
  city: string
  stateTaxRate: number
  countyTaxRate: number
  cityTaxRate: number
  totalTaxRate: number
  lastUpdated: string
  // Illinois dual-rate support
  stateFoodTaxRate?: number
  countyFoodTaxRate?: number
  cityFoodTaxRate?: number
  totalFoodTaxRate?: number
  // Additional metadata
  stateCode: string
  hasDualRates: boolean
  rateType: 'single' | 'dual'
}

interface TaxResultsCardProps {
  taxData: TaxData
}

export default function TaxResultsCard({ taxData }: TaxResultsCardProps) {
  const formatPercentage = (rate: number) => `${(rate * 100).toFixed(3)}%`
  
  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Tax Breakdown
        </h3>
        <p className="text-sm text-gray-600">
          {taxData.city}, {taxData.county}, {taxData.state}
        </p>
        {taxData.hasDualRates && (
          <div className="mt-2 p-2 bg-blue-50 rounded">
            <p className="text-xs text-blue-700">
              <strong>🍴 Restaurant Notice:</strong> {taxData.state} has different tax rates for general merchandise vs restaurant food.
            </p>
          </div>
        )}
      </div>
      <div className="p-6">
        {taxData.hasDualRates ? (
          // Dual-rate display for Illinois
          <div className="space-y-6">
            {/* General Merchandise Rates */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3 bg-gray-50 px-3 py-2 rounded">
                📦 General Merchandise
              </h4>
              <div className="space-y-3 ml-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    State Tax Rate ({taxData.state})
                  </span>
                  <span className="text-sm text-gray-900">
                    {formatPercentage(taxData.stateTaxRate)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    County Tax Rate ({taxData.county})
                  </span>
                  <span className="text-sm text-gray-900">
                    {formatPercentage(taxData.countyTaxRate)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    City Tax Rate ({taxData.city})
                  </span>
                  <span className="text-sm text-gray-900">
                    {formatPercentage(taxData.cityTaxRate)}
                  </span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-900">
                      Total General Rate
                    </span>
                    <span className="text-base font-bold text-green-600">
                      {formatPercentage(taxData.totalTaxRate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Restaurant Food Rates */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3 bg-orange-50 px-3 py-2 rounded">
                🍴 Restaurant Food & Prepared Meals
              </h4>
              <div className="space-y-3 ml-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    State Food Tax Rate ({taxData.state})
                  </span>
                  <span className="text-sm text-gray-900">
                    {formatPercentage(taxData.stateFoodTaxRate || 0)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    County Food Tax Rate ({taxData.county})
                  </span>
                  <span className="text-sm text-gray-900">
                    {formatPercentage(taxData.countyFoodTaxRate || 0)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    City Food Tax Rate ({taxData.city})
                  </span>
                  <span className="text-sm text-gray-900">
                    {formatPercentage(taxData.cityFoodTaxRate || 0)}
                  </span>
                </div>
                
                <div className="border-t border-orange-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-900">
                      Total Restaurant Rate
                    </span>
                    <span className="text-base font-bold text-orange-600">
                      {formatPercentage(taxData.totalFoodTaxRate || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rate Comparison */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">💰 Restaurant Savings</h4>
              <p className="text-sm text-blue-700">
                Restaurant food saves{' '}
                <strong>{formatPercentage((taxData.totalTaxRate - (taxData.totalFoodTaxRate || 0)))}</strong>{' '}
                compared to general merchandise
              </p>
            </div>
          </div>
        ) : (
          // Single-rate display for Texas and other states
          <div className="space-y-4">
            {/* State Tax */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                State Tax Rate ({taxData.state})
              </span>
              <span className="text-sm text-gray-900">
                {formatPercentage(taxData.stateTaxRate)}
              </span>
            </div>
            
            {/* County Tax */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                County Tax Rate ({taxData.county})
              </span>
              <span className="text-sm text-gray-900">
                {formatPercentage(taxData.countyTaxRate)}
              </span>
            </div>
            
            {/* City Tax */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                City Tax Rate ({taxData.city})
              </span>
              <span className="text-sm text-gray-900">
                {formatPercentage(taxData.cityTaxRate)}
              </span>
            </div>
            
            {/* Divider */}
            <div className="border-t border-gray-200"></div>
            
            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold text-gray-900">
                Total Tax Rate
              </span>
              <span className="text-base font-bold text-green-600">
                {formatPercentage(taxData.totalTaxRate)}
              </span>
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Last updated: {new Date(taxData.lastUpdated).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
} 