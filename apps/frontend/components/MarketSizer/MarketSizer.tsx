// Created automatically by Cursor AI (2024-12-19)

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Globe, Target, Users } from 'lucide-react';

interface MarketSize {
  tam: number;
  sam: number;
  som: number;
  approach: string;
  confidence: string;
}

interface MarketSizerProps {
  onCalculate: (inputs: any) => void;
  marketSize?: MarketSize;
  isLoading?: boolean;
}

export function MarketSizer({ onCalculate, marketSize, isLoading = false }: MarketSizerProps) {
  const [method, setMethod] = useState<'topdown' | 'bottomup' | 'hybrid'>('topdown');
  const [inputs, setInputs] = useState({
    total_market_size: 0,
    target_segment_percentage: 0,
    obtainable_percentage: 0,
    avg_revenue_per_customer: 0,
    adoption_rate: 0,
    customer_segments: []
  });

  const handleInputChange = (key: string, value: number) => {
    setInputs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCalculate = () => {
    onCalculate({
      method,
      ...inputs
    });
  };

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

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Market Sizing</CardTitle>
          <CardDescription>
            Calculate your Total Addressable Market (TAM), Serviceable Addressable Market (SAM), and Serviceable Obtainable Market (SOM)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Method Selection */}
          <div className="space-y-2">
            <Label>Market Sizing Method</Label>
            <Select value={method} onValueChange={(value: any) => setMethod(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="topdown">Top-Down Approach</SelectItem>
                <SelectItem value="bottomup">Bottom-Up Approach</SelectItem>
                <SelectItem value="hybrid">Hybrid Approach</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Top-Down Inputs */}
          {method === 'topdown' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_market_size">Total Market Size ($)</Label>
                <Input
                  id="total_market_size"
                  type="number"
                  value={inputs.total_market_size}
                  onChange={(e) => handleInputChange('total_market_size', parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 1000000000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_segment_percentage">Target Segment (%)</Label>
                <Input
                  id="target_segment_percentage"
                  type="number"
                  value={inputs.target_segment_percentage}
                  onChange={(e) => handleInputChange('target_segment_percentage', parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="obtainable_percentage">Obtainable Market (%)</Label>
                <Input
                  id="obtainable_percentage"
                  type="number"
                  value={inputs.obtainable_percentage}
                  onChange={(e) => handleInputChange('obtainable_percentage', parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 5"
                />
              </div>
            </div>
          )}

          {/* Bottom-Up Inputs */}
          {method === 'bottomup' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="avg_revenue_per_customer">Avg Revenue per Customer ($)</Label>
                <Input
                  id="avg_revenue_per_customer"
                  type="number"
                  value={inputs.avg_revenue_per_customer}
                  onChange={(e) => handleInputChange('avg_revenue_per_customer', parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 10000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adoption_rate">Adoption Rate (%)</Label>
                <Input
                  id="adoption_rate"
                  type="number"
                  value={inputs.adoption_rate}
                  onChange={(e) => handleInputChange('adoption_rate', parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 10"
                />
              </div>
            </div>
          )}

          <Button onClick={handleCalculate} disabled={isLoading} className="w-full">
            {isLoading ? 'Calculating...' : 'Calculate Market Size'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {marketSize && (
        <Card>
          <CardHeader>
            <CardTitle>Market Size Results</CardTitle>
            <CardDescription>
              <Badge className={getConfidenceColor(marketSize.confidence)}>
                {marketSize.confidence} confidence
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Globe className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <h3 className="font-semibold text-gray-700">TAM</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(marketSize.tam)}
                </p>
                <p className="text-sm text-gray-500">Total Addressable Market</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <h3 className="font-semibold text-gray-700">SAM</h3>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(marketSize.sam)}
                </p>
                <p className="text-sm text-gray-500">Serviceable Addressable Market</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <h3 className="font-semibold text-gray-700">SOM</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(marketSize.som)}
                </p>
                <p className="text-sm text-gray-500">Serviceable Obtainable Market</p>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Methodology</h4>
              <p className="text-sm text-gray-600">
                {marketSize.approach === 'top_down' && 
                  'Top-down approach: Starting with total market size and applying segment filters'}
                {marketSize.approach === 'bottom_up' && 
                  'Bottom-up approach: Based on customer segments and adoption rates'}
                {marketSize.approach === 'hybrid' && 
                  'Hybrid approach: Combining top-down and bottom-up methodologies'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
