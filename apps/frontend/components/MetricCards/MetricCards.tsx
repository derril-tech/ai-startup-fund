// Created automatically by Cursor AI (2024-12-19)

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, DollarSign, Users, Target, Zap } from 'lucide-react';

interface UnitEconomics {
  ltv: number;
  cac: number;
  ltv_cac_ratio: number;
  payback_months: number;
  burn_multiple: number;
  magic_number: number;
  rule_of_40: number;
  gross_margin: number;
  churn_rate: number;
  growth_rate: number;
}

interface MetricCardsProps {
  unitEconomics: UnitEconomics;
  isLoading?: boolean;
}

export function MetricCards({ unitEconomics, isLoading = false }: MetricCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatRatio = (value: number) => {
    return value.toFixed(2);
  };

  const getMetricStatus = (metric: string, value: number) => {
    switch (metric) {
      case 'ltv_cac_ratio':
        if (value >= 3) return { status: 'excellent', color: 'text-green-600', icon: TrendingUp };
        if (value >= 1) return { status: 'good', color: 'text-yellow-600', icon: TrendingUp };
        return { status: 'poor', color: 'text-red-600', icon: TrendingDown };
      
      case 'payback_months':
        if (value <= 12) return { status: 'excellent', color: 'text-green-600', icon: TrendingUp };
        if (value <= 18) return { status: 'good', color: 'text-yellow-600', icon: TrendingUp };
        return { status: 'poor', color: 'text-red-600', icon: TrendingDown };
      
      case 'burn_multiple':
        if (value <= 1) return { status: 'excellent', color: 'text-green-600', icon: TrendingUp };
        if (value <= 2) return { status: 'good', color: 'text-yellow-600', icon: TrendingUp };
        return { status: 'poor', color: 'text-red-600', icon: TrendingDown };
      
      case 'magic_number':
        if (value >= 1) return { status: 'excellent', color: 'text-green-600', icon: TrendingUp };
        if (value >= 0.5) return { status: 'good', color: 'text-yellow-600', icon: TrendingUp };
        return { status: 'poor', color: 'text-red-600', icon: TrendingDown };
      
      case 'rule_of_40':
        if (value >= 40) return { status: 'excellent', color: 'text-green-600', icon: TrendingUp };
        if (value >= 30) return { status: 'good', color: 'text-yellow-600', icon: TrendingUp };
        return { status: 'poor', color: 'text-red-600', icon: TrendingDown };
      
      default:
        return { status: 'neutral', color: 'text-gray-600', icon: Minus };
    }
  };

  const metrics = [
    {
      key: 'ltv_cac_ratio',
      title: 'LTV/CAC Ratio',
      value: unitEconomics.ltv_cac_ratio,
      formatter: formatRatio,
      description: 'Lifetime Value to Customer Acquisition Cost',
      icon: Target,
      unit: 'x'
    },
    {
      key: 'payback_months',
      title: 'Payback Period',
      value: unitEconomics.payback_months,
      formatter: (value: number) => `${value.toFixed(1)} months`,
      description: 'Time to recover customer acquisition cost',
      icon: DollarSign,
      unit: 'months'
    },
    {
      key: 'burn_multiple',
      title: 'Burn Multiple',
      value: unitEconomics.burn_multiple,
      formatter: formatRatio,
      description: 'Net burn rate relative to net new ARR',
      icon: Zap,
      unit: 'x'
    },
    {
      key: 'magic_number',
      title: 'Magic Number',
      value: unitEconomics.magic_number,
      formatter: formatRatio,
      description: 'Sales efficiency metric',
      icon: TrendingUp,
      unit: ''
    },
    {
      key: 'rule_of_40',
      title: 'Rule of 40',
      value: unitEconomics.rule_of_40,
      formatter: formatPercentage,
      description: 'Growth rate + profit margin',
      icon: Target,
      unit: '%'
    },
    {
      key: 'ltv',
      title: 'Lifetime Value',
      value: unitEconomics.ltv,
      formatter: formatCurrency,
      description: 'Customer lifetime value',
      icon: Users,
      unit: ''
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric) => {
        const status = getMetricStatus(metric.key, metric.value);
        const IconComponent = metric.icon;
        
        return (
          <Card key={metric.key} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {metric.title}
                </CardTitle>
                <IconComponent className="h-4 w-4 text-gray-400" />
              </div>
              <CardDescription className="text-xs">
                {metric.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`text-2xl font-bold ${status.color}`}>
                    {metric.formatter(metric.value)}
                  </span>
                  {metric.unit && (
                    <span className="text-sm text-gray-500">{metric.unit}</span>
                  )}
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${status.color} border-current`}
                >
                  {status.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
