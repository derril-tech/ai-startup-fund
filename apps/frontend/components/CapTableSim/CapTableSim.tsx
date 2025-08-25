// Created automatically by Cursor AI (2024-12-19)

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PieChart, 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calculator,
  Download,
  Eye
} from 'lucide-react';

interface CapTableEntry {
  holder: string;
  shares: number;
  ownership: number;
  type: string;
  price_per_share: number;
  total_value: number;
  dilution?: number;
}

interface WaterfallScenario {
  scenario: string;
  exit_value: number;
  multiple: number;
  waterfall: Array<{
    holder: string;
    type: string;
    shares: number;
    liquidation_preference: number;
    actual_payout: number;
    ownership_percentage: number;
  }>;
}

interface CapTableSimProps {
  capTableData?: {
    pre_investment_table: CapTableEntry[];
    post_investment_table: CapTableEntry[];
    investment_summary: any;
    waterfall_analysis: {
      scenarios: WaterfallScenario[];
    };
    metrics: any;
  };
  onSimulate: (inputs: any) => void;
  isLoading?: boolean;
}

export function CapTableSim({ 
  capTableData, 
  onSimulate, 
  isLoading = false 
}: CapTableSimProps) {
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000000);
  const [preMoneyValuation, setPreMoneyValuation] = useState<number>(5000000);
  const [newInvestorOwnership, setNewInvestorOwnership] = useState<number>(10);
  const [optionPoolSize, setOptionPoolSize] = useState<number>(10);
  const [liquidationPreference, setLiquidationPreference] = useState<number>(1.0);
  const [activeTab, setActiveTab] = useState<string>('overview');

  const handleSimulate = () => {
    const inputs = {
      investment_amount: investmentAmount,
      pre_money_valuation: preMoneyValuation,
      new_investor_ownership: newInvestorOwnership / 100,
      option_pool_size: optionPoolSize / 100,
      liquidation_preference: liquidationPreference
    };
    onSimulate(inputs);
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

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getHolderColor = (holder: string) => {
    const colors = {
      'Founders': 'bg-blue-500',
      'New Investor': 'bg-green-500',
      'Option Pool': 'bg-yellow-500',
      'Other Investors': 'bg-purple-500'
    };
    return colors[holder as keyof typeof colors] || 'bg-gray-500';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cap Table Simulation</CardTitle>
          <CardDescription>Loading cap table data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Input Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Cap Table Simulation
          </CardTitle>
          <CardDescription>
            Simulate cap table changes and waterfall analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="investmentAmount">Investment Amount</Label>
              <Input
                id="investmentAmount"
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(parseFloat(e.target.value) || 0)}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label htmlFor="preMoneyValuation">Pre-Money Valuation</Label>
              <Input
                id="preMoneyValuation"
                type="number"
                value={preMoneyValuation}
                onChange={(e) => setPreMoneyValuation(parseFloat(e.target.value) || 0)}
                placeholder="Enter valuation"
              />
            </div>
            <div>
              <Label htmlFor="newInvestorOwnership">New Investor Ownership (%)</Label>
              <Input
                id="newInvestorOwnership"
                type="number"
                value={newInvestorOwnership}
                onChange={(e) => setNewInvestorOwnership(parseFloat(e.target.value) || 0)}
                placeholder="Enter percentage"
              />
            </div>
            <div>
              <Label htmlFor="optionPoolSize">Option Pool Size (%)</Label>
              <Input
                id="optionPoolSize"
                type="number"
                value={optionPoolSize}
                onChange={(e) => setOptionPoolSize(parseFloat(e.target.value) || 0)}
                placeholder="Enter percentage"
              />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleSimulate} className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Simulate Cap Table
            </Button>
          </div>
        </CardContent>
      </Card>

      {capTableData && (
        <>
          {/* Investment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Investment Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(capTableData.investment_summary.pre_money_valuation)}
                  </div>
                  <div className="text-sm text-gray-600">Pre-Money Valuation</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(capTableData.investment_summary.investment_amount)}
                  </div>
                  <div className="text-sm text-gray-600">Investment Amount</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(capTableData.investment_summary.post_money_valuation)}
                  </div>
                  <div className="text-sm text-gray-600">Post-Money Valuation</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(capTableData.investment_summary.price_per_share)}
                  </div>
                  <div className="text-sm text-gray-600">Price Per Share</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cap Table Analysis */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="pre-post">Pre/Post</TabsTrigger>
              <TabsTrigger value="waterfall">Waterfall</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Post-Investment Ownership
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {capTableData.post_investment_table.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${getHolderColor(entry.holder)}`} />
                          <div>
                            <div className="font-medium">{entry.holder}</div>
                            <div className="text-sm text-gray-600">{entry.type}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatPercentage(entry.ownership)}</div>
                          <div className="text-sm text-gray-600">
                            {entry.shares.toLocaleString()} shares
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pre-post" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Pre-Investment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {capTableData.pre_investment_table.map((entry, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{entry.holder}</span>
                          <span className="font-medium">{formatPercentage(entry.ownership)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Post-Investment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {capTableData.post_investment_table.map((entry, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{entry.holder}</span>
                          <span className="font-medium">{formatPercentage(entry.ownership)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="waterfall" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Waterfall Analysis
                  </CardTitle>
                  <CardDescription>
                    Liquidation scenarios and payout distribution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {capTableData.waterfall_analysis.scenarios.map((scenario, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">{scenario.scenario}</h4>
                          <Badge variant="outline">
                            {formatCurrency(scenario.exit_value)} ({scenario.multiple}x)
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {scenario.waterfall.map((entry, entryIndex) => (
                            <div key={entryIndex} className="flex justify-between text-sm">
                              <span>{entry.holder}</span>
                              <span className="font-medium">
                                {formatCurrency(entry.actual_payout)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Ownership Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Founders</span>
                        <span className="font-medium">
                          {formatPercentage(capTableData.metrics.ownership_distribution.founders)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Investors</span>
                        <span className="font-medium">
                          {formatPercentage(capTableData.metrics.ownership_distribution.investors)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Option Pool</span>
                        <span className="font-medium">
                          {formatPercentage(capTableData.metrics.ownership_distribution.option_pool)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Dilution Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Dilution</span>
                        <span className="font-medium">
                          {formatPercentage(capTableData.metrics.dilution_analysis.total_dilution)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Founder Dilution</span>
                        <span className="font-medium">
                          {formatPercentage(capTableData.metrics.dilution_analysis.founder_dilution)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Dilution</span>
                        <span className="font-medium">
                          {formatPercentage(capTableData.metrics.dilution_analysis.average_dilution)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Valuation Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Pre-Money Per Share</span>
                        <span className="font-medium">
                          {formatCurrency(capTableData.metrics.valuation_metrics.pre_money_per_share)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Post-Money Per Share</span>
                        <span className="font-medium">
                          {formatCurrency(capTableData.metrics.valuation_metrics.post_money_per_share)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price Increase</span>
                        <span className="font-medium">
                          {formatPercentage(capTableData.metrics.valuation_metrics.price_increase)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
