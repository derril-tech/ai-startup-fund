// Created automatically by Cursor AI (2024-12-19)

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Save, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPI {
  id: string;
  period: string;
  metric: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  meta?: Record<string, any>;
}

interface KPIGridProps {
  kpis: KPI[];
  onKPIUpdate?: (kpiId: string, value: number) => void;
  isLoading?: boolean;
}

export function KPIGrid({ kpis, onKPIUpdate, isLoading = false }: KPIGridProps) {
  const [editingKPI, setEditingKPI] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const startEditing = (kpi: KPI) => {
    setEditingKPI(kpi.id);
    setEditValue(kpi.value.toString());
  };

  const saveEdit = () => {
    if (editingKPI && editValue) {
      const newValue = parseFloat(editValue);
      if (!isNaN(newValue)) {
        onKPIUpdate?.(editingKPI, newValue);
      }
    }
    setEditingKPI(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingKPI(null);
    setEditValue('');
  };

  const getChangeIcon = (changePercent?: number) => {
    if (!changePercent) return <Minus className="h-4 w-4 text-gray-400" />;
    if (changePercent > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getChangeColor = (changePercent?: number) => {
    if (!changePercent) return 'text-gray-500';
    if (changePercent > 0) return 'text-green-600';
    return 'text-red-600';
  };

  const formatValue = (value: number, metric: string) => {
    if (metric.toLowerCase().includes('revenue') || metric.toLowerCase().includes('arr') || metric.toLowerCase().includes('mrr')) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    
    if (metric.toLowerCase().includes('percent') || metric.toLowerCase().includes('rate')) {
      return `${value.toFixed(1)}%`;
    }
    
    return new Intl.NumberFormat('en-US').format(value);
  };

  const getMetricCategory = (metric: string) => {
    const lowerMetric = metric.toLowerCase();
    if (lowerMetric.includes('revenue') || lowerMetric.includes('arr') || lowerMetric.includes('mrr')) {
      return 'revenue';
    }
    if (lowerMetric.includes('cac') || lowerMetric.includes('cost')) {
      return 'cost';
    }
    if (lowerMetric.includes('ltv') || lowerMetric.includes('lifetime')) {
      return 'ltv';
    }
    if (lowerMetric.includes('churn') || lowerMetric.includes('retention')) {
      return 'retention';
    }
    if (lowerMetric.includes('growth') || lowerMetric.includes('growth')) {
      return 'growth';
    }
    return 'other';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'revenue': return 'bg-green-100 text-green-800';
      case 'cost': return 'bg-red-100 text-red-800';
      case 'ltv': return 'bg-blue-100 text-blue-800';
      case 'retention': return 'bg-purple-100 text-purple-800';
      case 'growth': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KPIs</CardTitle>
          <CardDescription>Loading metrics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Performance Indicators</CardTitle>
        <CardDescription>
          Extracted and normalized metrics from your pitch documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        {kpis.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No KPIs found. Upload documents to extract metrics.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpis.map((kpi) => {
              const category = getMetricCategory(kpi.metric);
              const isEditing = editingKPI === kpi.id;
              
              return (
                <Card key={kpi.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getCategoryColor(category)}>
                        {category}
                      </Badge>
                      {!isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(kpi)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-600">
                        {kpi.metric}
                      </h4>
                      
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              type="number"
                              step="any"
                              className="flex-1"
                            />
                            <Button size="sm" onClick={saveEdit}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-2xl font-bold">
                            {formatValue(kpi.value, kpi.metric)}
                          </p>
                          
                          {kpi.changePercent !== undefined && (
                            <div className="flex items-center space-x-1">
                              {getChangeIcon(kpi.changePercent)}
                              <span className={`text-sm font-medium ${getChangeColor(kpi.changePercent)}`}>
                                {kpi.changePercent > 0 ? '+' : ''}{kpi.changePercent.toFixed(1)}%
                              </span>
                            </div>
                          )}
                          
                          {kpi.period && (
                            <p className="text-xs text-gray-500">
                              {kpi.period}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
