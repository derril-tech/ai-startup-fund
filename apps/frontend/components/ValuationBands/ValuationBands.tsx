// Created automatically by Cursor AI (2024-12-19)

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, DollarSign, Calculator, Target, BarChart3 } from 'lucide-react';

interface Valuation {
  method: string;
  result_low: number;
  result_base: number;
  result_high: number;
  notes: string;
  inputs?: any;
  weights?: any;
  scores?: any;
  base_score?: number;
  base_multiple?: number;
  present_value?: number;
  formula?: string;
  comps_data?: any;
  applied_multiple?: number;
  base_value?: number;
  criteria_value?: number;
  criteria_met?: any;
  total_adjustment?: number;
  applied_factors?: any;
}

interface ValuationBandsProps {
  valuations: Valuation[];
  onAdoptValuation?: (method: string, value: number) => void;
  isLoading?: boolean;
}

export function ValuationBands({ valuations, onAdoptValuation, isLoading = false }: ValuationBandsProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(1)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(1)}M`;
    } else if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'scorecard': return Calculator;
      case 'vc_method': return TrendingUp;
      case 'comps': return BarChart3;
      case 'berkus': return Target;
      case 'rfs': return DollarSign;
      default: return Calculator;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'scorecard': return 'bg-blue-100 text-blue-800';
      case 'vc_method': return 'bg-green-100 text-green-800';
      case 'comps': return 'bg-purple-100 text-purple-800';
      case 'berkus': return 'bg-orange-100 text-orange-800';
      case 'rfs': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodDisplayName = (method: string) => {
    switch (method) {
      case 'scorecard': return 'Scorecard Method';
      case 'vc_method': return 'VC Method';
      case 'comps': return 'Comparables';
      case 'berkus': return 'Berkus Method';
      case 'rfs': return 'Risk Factor Summation';
      default: return method;
    }
  };

  const getRangeWidth = (low: number, high: number, base: number) => {
    const range = high - low;
    const totalRange = range * 2; // For visualization
    return Math.min(100, Math.max(10, (range / totalRange) * 100));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Valuation Methods</CardTitle>
          <CardDescription>Loading valuations...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Valuation Methods</CardTitle>
        <CardDescription>
          Multiple valuation approaches with low, base, and high estimates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {valuations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No valuations available. Run valuation methods to see results.</p>
          </div>
        ) : (
          valuations.map((valuation) => {
            const IconComponent = getMethodIcon(valuation.method);
            const rangeWidth = getRangeWidth(valuation.result_low, valuation.result_high, valuation.result_base);
            
            return (
              <div key={valuation.method} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <IconComponent className="h-5 w-5 text-gray-500" />
                    <div>
                      <h3 className="font-semibold">{getMethodDisplayName(valuation.method)}</h3>
                      <Badge className={getMethodColor(valuation.method)}>
                        {valuation.method}
                      </Badge>
                    </div>
                  </div>
                  {onAdoptValuation && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAdoptValuation(valuation.method, valuation.result_base)}
                    >
                      Adopt Base
                    </Button>
                  )}
                </div>

                {/* Valuation Range Visualization */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Low: {formatCurrency(valuation.result_low)}</span>
                    <span>Base: {formatCurrency(valuation.result_base)}</span>
                    <span>High: {formatCurrency(valuation.result_high)}</span>
                  </div>
                  <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="absolute h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full"
                      style={{ 
                        left: '10%', 
                        width: `${rangeWidth}%`,
                        transform: 'translateX(-50%)'
                      }}
                    />
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-black"
                      style={{ 
                        left: '50%',
                        transform: 'translateX(-50%)'
                      }}
                    />
                  </div>
                </div>

                {/* Method-specific details */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">{valuation.notes}</p>
                  
                  {valuation.method === 'scorecard' && valuation.base_score !== undefined && (
                    <div className="text-sm">
                      <span className="font-medium">Score: </span>
                      <span className="text-blue-600">{valuation.base_score.toFixed(1)}/10</span>
                      {valuation.base_multiple && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="font-medium">Multiple: </span>
                          <span className="text-blue-600">{valuation.base_multiple.toFixed(1)}x ARR</span>
                        </>
                      )}
                    </div>
                  )}
                  
                  {valuation.method === 'vc_method' && valuation.formula && (
                    <div className="text-sm">
                      <span className="font-medium">Formula: </span>
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {valuation.formula}
                      </code>
                    </div>
                  )}
                  
                  {valuation.method === 'comps' && valuation.comps_data && (
                    <div className="text-sm">
                      <span className="font-medium">Sample: </span>
                      <span>{valuation.comps_data.sample} companies</span>
                      {valuation.applied_multiple && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="font-medium">Applied: </span>
                          <span className="text-purple-600">{valuation.applied_multiple.toFixed(1)}x</span>
                        </>
                      )}
                    </div>
                  )}
                  
                  {valuation.method === 'berkus' && valuation.criteria_met && (
                    <div className="text-sm">
                      <span className="font-medium">Criteria met: </span>
                      <span className="text-orange-600">
                        {Object.values(valuation.criteria_met).filter(Boolean).length}/5
                      </span>
                    </div>
                  )}
                  
                  {valuation.method === 'rfs' && valuation.total_adjustment !== undefined && (
                    <div className="text-sm">
                      <span className="font-medium">Adjustment: </span>
                      <span className={valuation.total_adjustment >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {valuation.total_adjustment >= 0 ? '+' : ''}{formatCurrency(valuation.total_adjustment)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
