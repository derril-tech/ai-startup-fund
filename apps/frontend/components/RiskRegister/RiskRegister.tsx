// Created automatically by Cursor AI (2024-12-19)

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Shield, Download, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface Risk {
  category: string;
  risk_key: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  likelihood: 'low' | 'medium' | 'high';
  score: number;
  weight: number;
  weighted_score: number;
  mitigation: string;
  owner_role: string;
}

interface RiskCategory {
  name: string;
  key: string;
  risks: Risk[];
  average_score: number;
  severity: string;
}

interface RiskRegisterProps {
  initialRisks?: RiskCategory[];
  onSave: (risks: RiskCategory[]) => void;
  onExport?: () => void;
  isLoading?: boolean;
}

export function RiskRegister({ 
  initialRisks = [], 
  onSave, 
  onExport, 
  isLoading = false 
}: RiskRegisterProps) {
  const [riskCategories, setRiskCategories] = useState<RiskCategory[]>(initialRisks);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const defaultCategories = [
    { key: 'market', name: 'Market Risks' },
    { key: 'team', name: 'Team Risks' },
    { key: 'technical', name: 'Technical Risks' },
    { key: 'regulatory', name: 'Regulatory Risks' },
    { key: 'concentration', name: 'Concentration Risks' },
    { key: 'execution', name: 'Execution Risks' }
  ];

  const severityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };

  const severityIcons = {
    low: CheckCircle,
    medium: AlertCircle,
    high: AlertTriangle,
    critical: XCircle
  };

  const updateRiskScore = (categoryKey: string, riskKey: string, score: number) => {
    setRiskCategories(prev => prev.map(category => {
      if (category.key === categoryKey) {
        return {
          ...category,
          risks: category.risks.map(risk => {
            if (risk.risk_key === riskKey) {
              const newRisk = { ...risk, score };
              newRisk.weighted_score = score * risk.weight;
              newRisk.severity = getSeverityLevel(score);
              newRisk.likelihood = getLikelihoodLevel(score);
              return newRisk;
            }
            return risk;
          })
        };
      }
      return category;
    }));
  };

  const updateRiskMitigation = (categoryKey: string, riskKey: string, mitigation: string) => {
    setRiskCategories(prev => prev.map(category => {
      if (category.key === categoryKey) {
        return {
          ...category,
          risks: category.risks.map(risk => {
            if (risk.risk_key === riskKey) {
              return { ...risk, mitigation };
            }
            return risk;
          })
        };
      }
      return category;
    }));
  };

  const updateRiskOwner = (categoryKey: string, riskKey: string, owner: string) => {
    setRiskCategories(prev => prev.map(category => {
      if (category.key === categoryKey) {
        return {
          ...category,
          risks: category.risks.map(risk => {
            if (risk.risk_key === riskKey) {
              return { ...risk, owner_role: owner };
            }
            return risk;
          })
        };
      }
      return category;
    }));
  };

  const getSeverityLevel = (score: number): 'low' | 'medium' | 'high' | 'critical' => {
    if (score >= 2.5) return 'critical';
    if (score >= 1.5) return 'high';
    if (score >= 0.5) return 'medium';
    return 'low';
  };

  const getLikelihoodLevel = (score: number): 'low' | 'medium' | 'high' => {
    if (score >= 2.5) return 'high';
    if (score >= 1.5) return 'medium';
    return 'low';
  };

  const calculateOverallRisk = () => {
    let totalScore = 0;
    let totalWeight = 0;

    riskCategories.forEach(category => {
      category.risks.forEach(risk => {
        totalScore += risk.weighted_score;
        totalWeight += risk.weight;
      });
    });

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  };

  const getHighSeverityRisks = () => {
    const allRisks: Risk[] = [];
    riskCategories.forEach(category => {
      allRisks.push(...category.risks);
    });
    return allRisks.filter(risk => risk.severity === 'high' || risk.severity === 'critical');
  };

  const overallRisk = calculateOverallRisk();
  const highSeverityRisks = getHighSeverityRisks();
  const overallSeverity = getSeverityLevel(overallRisk);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk Register</CardTitle>
          <CardDescription>Loading risk assessment...</CardDescription>
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
      {/* Risk Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Risk Assessment Summary
          </CardTitle>
          <CardDescription>
            Overall risk profile and high-severity risks requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${severityColors[overallSeverity]}`}>
                {overallRisk.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Overall Risk Score</div>
            </div>
            <div className="text-center">
              <Badge className={severityColors[overallSeverity]}>
                {overallSeverity.toUpperCase()}
              </Badge>
              <div className="text-sm text-gray-600 mt-1">Overall Severity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {highSeverityRisks.length}
              </div>
              <div className="text-sm text-gray-600">High/Critical Risks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {riskCategories.reduce((sum, cat) => sum + cat.risks.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Risks</div>
            </div>
          </div>

          {highSeverityRisks.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="font-semibold text-red-800">High-Severity Risks Requiring Attention</span>
              </div>
              <div className="space-y-2">
                {highSeverityRisks.slice(0, 3).map((risk, index) => (
                  <div key={index} className="text-sm text-red-700">
                    • {risk.description} ({risk.category})
                  </div>
                ))}
                {highSeverityRisks.length > 3 && (
                  <div className="text-sm text-red-600">
                    +{highSeverityRisks.length - 3} more high-severity risks
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Categories */}
      <div className="space-y-4">
        {riskCategories.map((category) => (
          <Card key={category.key}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <CardDescription>
                    {category.risks.length} risks • Average score: {category.average_score.toFixed(1)}
                  </CardDescription>
                </div>
                <Badge className={severityColors[category.severity as keyof typeof severityColors]}>
                  {category.severity.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {category.risks.map((risk) => {
                  const SeverityIcon = severityIcons[risk.severity];
                  
                  return (
                    <div key={risk.risk_key} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <SeverityIcon className="h-4 w-4" />
                            <h4 className="font-medium">{risk.description}</h4>
                            <Badge className={severityColors[risk.severity]}>
                              {risk.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Weight: {risk.weight.toFixed(2)} • Score: {risk.score} • Weighted: {risk.weighted_score.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Risk Score</Label>
                          <Select 
                            value={risk.score.toString()} 
                            onValueChange={(value) => updateRiskScore(category.key, risk.risk_key, parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Low (0)</SelectItem>
                              <SelectItem value="1">Medium (1)</SelectItem>
                              <SelectItem value="2">High (2)</SelectItem>
                              <SelectItem value="3">Critical (3)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Owner</Label>
                          <Select 
                            value={risk.owner_role} 
                            onValueChange={(value) => updateRiskOwner(category.key, risk.risk_key, value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="analyst">Analyst</SelectItem>
                              <SelectItem value="investor">Investor</SelectItem>
                              <SelectItem value="founder">Founder</SelectItem>
                              <SelectItem value="legal">Legal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Likelihood</Label>
                          <div className="text-sm text-gray-600 capitalize">
                            {risk.likelihood}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <Label className="text-sm font-medium">Mitigation Strategy</Label>
                        <Textarea
                          value={risk.mitigation}
                          onChange={(e) => updateRiskMitigation(category.key, risk.risk_key, e.target.value)}
                          placeholder="Describe how this risk can be mitigated..."
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => onSave(riskCategories)}>
          Save Risk Assessment
        </Button>
        {onExport && (
          <Button variant="outline" onClick={onExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        )}
      </div>
    </div>
  );
}
