// Created automatically by Cursor AI (2024-12-19)

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, CheckCircle, XCircle, DollarSign, Percent, FileText } from 'lucide-react';

interface DecisionFormProps {
  pitchData?: any;
  valuations?: any[];
  riskAssessment?: any;
  capTableSim?: any;
  onDecisionSubmit: (decision: any) => void;
  isLoading?: boolean;
}

export function DecisionForm({ 
  pitchData, 
  valuations = [], 
  riskAssessment, 
  capTableSim,
  onDecisionSubmit, 
  isLoading = false 
}: DecisionFormProps) {
  const [recommendation, setRecommendation] = useState<'yes' | 'no' | 'conditional'>('no');
  const [checkSize, setCheckSize] = useState<number>(0);
  const [instrument, setInstrument] = useState<'SAFE' | 'Equity'>('SAFE');
  const [preMoney, setPreMoney] = useState<number>(0);
  const [targetOwnership, setTargetOwnership] = useState<number>(10);
  const [conditions, setConditions] = useState<string[]>(['']);
  const [rationale, setRationale] = useState<string>('');
  const [gateStatus, setGateStatus] = useState<any>(null);

  // Calculate derived values
  const postMoney = preMoney + checkSize;
  const actualOwnership = checkSize > 0 ? (checkSize / postMoney) * 100 : 0;

  useEffect(() => {
    // Check gating rules whenever dependencies change
    const gateCheck = checkGatingRules();
    setGateStatus(gateCheck);
  }, [valuations, riskAssessment, capTableSim]);

  const checkGatingRules = () => {
    const reasons: string[] = [];
    let passed = true;

    // Rule 1: Must have at least one valuation
    if (!valuations || valuations.length === 0) {
      reasons.push("No valuations available");
      passed = false;
    }

    // Rule 2: Risk assessment must be completed
    if (!riskAssessment || !riskAssessment.overall_risk_score) {
      reasons.push("Risk assessment not completed");
      passed = false;
    } else {
      // Check for critical risks
      const criticalRisks = riskAssessment.risk_breakdown?.critical || 0;
      if (criticalRisks > 0) {
        reasons.push(`${criticalRisks} critical risks must be addressed`);
        passed = false;
      }
    }

    // Rule 3: Cap table simulation for equity investments
    if (instrument === 'Equity' && (!capTableSim || !capTableSim.table)) {
      reasons.push("Cap table simulation required for equity investments");
      passed = false;
    }

    return { passed, reasons };
  };

  const addCondition = () => {
    setConditions([...conditions, '']);
  };

  const removeCondition = (index: number) => {
    const newConditions = conditions.filter((_, i) => i !== index);
    setConditions(newConditions);
  };

  const updateCondition = (index: number, value: string) => {
    const newConditions = [...conditions];
    newConditions[index] = value;
    setConditions(newConditions);
  };

  const handleSubmit = () => {
    const decision = {
      recommendation,
      check_size_usd: checkSize,
      instrument,
      pre_money_usd: preMoney,
      target_ownership: targetOwnership / 100,
      conditions: conditions.filter(c => c.trim() !== ''),
      rationale,
      gate_status: gateStatus
    };

    onDecisionSubmit(decision);
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'yes': return 'bg-green-100 text-green-800';
      case 'conditional': return 'bg-yellow-100 text-yellow-800';
      case 'no': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'yes': return CheckCircle;
      case 'conditional': return AlertTriangle;
      case 'no': return XCircle;
      default: return XCircle;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Investment Decision</CardTitle>
          <CardDescription>Loading decision form...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gate Status */}
      {gateStatus && (
        <Card className={gateStatus.passed ? 'border-green-200' : 'border-red-200'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {gateStatus.passed ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Gating Rules Check
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gateStatus.passed ? (
              <div className="text-green-700">
                All gating rules passed. Ready to proceed with investment decision.
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-red-700 font-medium">Gating rules failed:</div>
                <ul className="list-disc list-inside space-y-1 text-red-600">
                  {gateStatus.reasons.map((reason: string, index: number) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Decision Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Investment Decision
          </CardTitle>
          <CardDescription>
            Make final investment decision with terms and conditions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recommendation */}
          <div>
            <Label className="text-base font-medium">Investment Recommendation *</Label>
            <div className="grid grid-cols-3 gap-4 mt-2">
              {(['yes', 'conditional', 'no'] as const).map((rec) => {
                const IconComponent = getRecommendationIcon(rec);
                return (
                  <Button
                    key={rec}
                    variant={recommendation === rec ? "default" : "outline"}
                    className={`h-16 flex-col gap-2 ${recommendation === rec ? getRecommendationColor(rec) : ''}`}
                    onClick={() => setRecommendation(rec)}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span className="capitalize">{rec}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Investment Terms */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="instrument">Investment Instrument</Label>
              <Select value={instrument} onValueChange={(value: 'SAFE' | 'Equity') => setInstrument(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAFE">SAFE</SelectItem>
                  <SelectItem value="Equity">Equity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="checkSize">Check Size (USD)</Label>
              <Input
                id="checkSize"
                type="number"
                value={checkSize}
                onChange={(e) => setCheckSize(parseFloat(e.target.value) || 0)}
                placeholder="Enter check size"
              />
            </div>

            <div>
              <Label htmlFor="preMoney">Pre-Money Valuation (USD)</Label>
              <Input
                id="preMoney"
                type="number"
                value={preMoney}
                onChange={(e) => setPreMoney(parseFloat(e.target.value) || 0)}
                placeholder="Enter pre-money valuation"
              />
            </div>

            <div>
              <Label htmlFor="targetOwnership">Target Ownership (%)</Label>
              <Input
                id="targetOwnership"
                type="number"
                value={targetOwnership}
                onChange={(e) => setTargetOwnership(parseFloat(e.target.value) || 0)}
                placeholder="Enter target ownership"
              />
            </div>
          </div>

          {/* Calculated Values */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Calculated Values</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  ${postMoney.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Post-Money Valuation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {actualOwnership.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Actual Ownership</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  ${(checkSize * (actualOwnership / 100)).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Effective Investment</div>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div>
            <Label className="text-base font-medium">Investment Conditions</Label>
            <div className="space-y-2 mt-2">
              {conditions.map((condition, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={condition}
                    onChange={(e) => updateCondition(index, e.target.value)}
                    placeholder="Enter investment condition..."
                  />
                  {conditions.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeCondition(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addCondition}
                className="w-full"
              >
                Add Condition
              </Button>
            </div>
          </div>

          {/* Rationale */}
          <div>
            <Label htmlFor="rationale" className="text-base font-medium">
              Investment Rationale *
            </Label>
            <Textarea
              id="rationale"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Provide detailed rationale for the investment decision..."
              rows={4}
              className="mt-2"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!gateStatus?.passed || !rationale.trim()}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Submit Decision
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
