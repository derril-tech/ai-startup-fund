// Created automatically by Cursor AI (2024-12-19)

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Info, Calculator, TrendingUp } from 'lucide-react';

interface ScorecardCategory {
  key: string;
  name: string;
  description: string;
  weight: number;
  score: number;
  criteria: {
    excellent: string;
    good: string;
    poor: string;
  };
}

interface ScorecardEditorProps {
  initialScores?: Record<string, number>;
  initialWeights?: Record<string, number>;
  onSave: (scores: Record<string, number>, weights: Record<string, number>) => void;
  isLoading?: boolean;
}

export function ScorecardEditor({ 
  initialScores = {}, 
  initialWeights = {}, 
  onSave, 
  isLoading = false 
}: ScorecardEditorProps) {
  const [scores, setScores] = useState<Record<string, number>>(initialScores);
  const [weights, setWeights] = useState<Record<string, number>>(initialWeights);

  const defaultCategories: ScorecardCategory[] = [
    {
      key: 'team',
      name: 'Team',
      description: 'Founder experience, skills, and track record',
      weight: 25,
      score: 5,
      criteria: {
        excellent: 'Serial entrepreneurs with successful exits',
        good: 'Strong domain expertise and relevant experience',
        poor: 'First-time founders with limited experience'
      }
    },
    {
      key: 'market',
      name: 'Market',
      description: 'Market size, growth, and timing',
      weight: 25,
      score: 5,
      criteria: {
        excellent: 'Large, growing market with clear timing',
        good: 'Established market with growth potential',
        poor: 'Small or declining market'
      }
    },
    {
      key: 'product',
      name: 'Product',
      description: 'Product-market fit and technical execution',
      weight: 15,
      score: 5,
      criteria: {
        excellent: 'Strong PMF with technical moats',
        good: 'Good product with some differentiation',
        poor: 'Weak PMF or easily replicable'
      }
    },
    {
      key: 'traction',
      name: 'Traction',
      description: 'Customer growth, revenue, and engagement',
      weight: 15,
      score: 5,
      criteria: {
        excellent: 'Strong growth with high retention',
        good: 'Steady growth with decent metrics',
        poor: 'Limited traction or declining metrics'
      }
    },
    {
      key: 'competition',
      name: 'Competition',
      description: 'Competitive landscape and positioning',
      weight: 10,
      score: 5,
      criteria: {
        excellent: 'Clear competitive advantage and moats',
        good: 'Differentiated in crowded market',
        poor: 'Heavy competition with weak positioning'
      }
    },
    {
      key: 'defensibility',
      name: 'Defensibility',
      description: 'IP, network effects, and barriers to entry',
      weight: 5,
      score: 5,
      criteria: {
        excellent: 'Strong IP, network effects, or regulatory moats',
        good: 'Some defensibility through technology or relationships',
        poor: 'Low barriers to entry'
      }
    },
    {
      key: 'gtm',
      name: 'Go-to-Market',
      description: 'Sales strategy and execution capability',
      weight: 5,
      score: 5,
      criteria: {
        excellent: 'Proven GTM strategy with strong execution',
        good: 'Clear GTM plan with some validation',
        poor: 'Unclear or untested GTM strategy'
      }
    }
  ];

  const [categories] = useState<ScorecardCategory[]>(
    defaultCategories.map(cat => ({
      ...cat,
      weight: initialWeights[cat.key] || cat.weight,
      score: initialScores[cat.key] || cat.score
    }))
  );

  const updateScore = (key: string, value: number) => {
    setScores(prev => ({ ...prev, [key]: value }));
  };

  const updateWeight = (key: string, value: number) => {
    setWeights(prev => ({ ...prev, [key]: value }));
  };

  const calculateTotalScore = () => {
    let totalScore = 0;
    let totalWeight = 0;

    categories.forEach(cat => {
      const score = scores[cat.key] || cat.score;
      const weight = weights[cat.key] || cat.weight;
      totalScore += score * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  };

  const calculateValuationMultiple = (score: number) => {
    // Convert score (0-10) to valuation multiple (0.5x to 10x ARR)
    return 0.5 + (score / 10) * 9.5;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Poor';
  };

  const totalScore = calculateTotalScore();
  const valuationMultiple = calculateValuationMultiple(totalScore);

  const handleSave = () => {
    onSave(scores, weights);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scorecard Editor</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Scorecard Editor
        </CardTitle>
        <CardDescription>
          Rate each category on a 0-10 scale to calculate valuation multiple
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Valuation Summary</h3>
            <Badge variant="outline" className="text-sm">
              {getScoreLabel(totalScore)}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{totalScore.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Total Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{valuationMultiple.toFixed(1)}x</div>
              <div className="text-sm text-gray-600">ARR Multiple</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {((weights[Object.keys(weights)[0]] || 25) * 4).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Max Weight</div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {categories.map((category) => {
            const currentScore = scores[category.key] || category.score;
            const currentWeight = weights[category.key] || category.weight;
            
            return (
              <div key={category.key} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{category.name}</h3>
                      <Badge variant="outline" className={getScoreColor(currentScore)}>
                        {getScoreLabel(currentScore)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                    
                    {/* Score Criteria */}
                    <div className="text-xs text-gray-500 space-y-1">
                      <div><strong>Excellent (8-10):</strong> {category.criteria.excellent}</div>
                      <div><strong>Good (6-7):</strong> {category.criteria.good}</div>
                      <div><strong>Poor (0-5):</strong> {category.criteria.poor}</div>
                    </div>
                  </div>
                  
                  <div className="ml-4 text-right">
                    <div className="text-2xl font-bold text-blue-600">{currentScore}</div>
                    <div className="text-sm text-gray-600">/ 10</div>
                  </div>
                </div>

                {/* Score Slider */}
                <div className="mb-4">
                  <Label className="text-sm font-medium">Score</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      value={[currentScore]}
                      onValueChange={([value]) => updateScore(category.key, value)}
                      max={10}
                      min={0}
                      step={0.5}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={currentScore}
                      onChange={(e) => updateScore(category.key, parseFloat(e.target.value) || 0)}
                      min={0}
                      max={10}
                      step={0.5}
                      className="w-20"
                    />
                  </div>
                </div>

                {/* Weight Slider */}
                <div>
                  <Label className="text-sm font-medium">Weight (%)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      value={[currentWeight]}
                      onValueChange={([value]) => updateWeight(category.key, value)}
                      max={50}
                      min={1}
                      step={1}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={currentWeight}
                      onChange={(e) => updateWeight(category.key, parseInt(e.target.value) || 1)}
                      min={1}
                      max={50}
                      className="w-20"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Calculate Valuation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
