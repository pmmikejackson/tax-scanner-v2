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
      </div>
      <div className="p-6">
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
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold text-gray-900">
                Total Sales Tax Rate
              </span>
              <span className="text-xl font-bold text-primary-600">
                {formatPercentage(taxData.totalTaxRate)}
              </span>
            </div>
          </div>
          
          {/* Example calculation */}
          <div className="bg-gray-50 rounded-md p-4 mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Example: $100 Sale
            </h4>
            <div className="text-sm text-gray-600">
              <div>Subtotal: $100.00</div>
              <div>Sales Tax: ${(100 * taxData.totalTaxRate).toFixed(2)}</div>
              <div className="font-medium text-gray-900 pt-1 border-t border-gray-200 mt-2">
                Total: ${(100 + (100 * taxData.totalTaxRate)).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 