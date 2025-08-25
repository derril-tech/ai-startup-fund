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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Edit, 
  Save, 
  Download, 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  DollarSign,
  Users,
  Shield
} from 'lucide-react';

interface TermSheetEditorProps {
  termSheetData?: any;
  onSave: (termSheet: any) => void;
  onGenerate: () => void;
  onExport?: () => void;
  isLoading?: boolean;
}

export function TermSheetEditor({ 
  termSheetData, 
  onSave, 
  onGenerate, 
  onExport,
  isLoading = false 
}: TermSheetEditorProps) {
  const [instrumentType, setInstrumentType] = useState<'SAFE' | 'Equity'>('SAFE');
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000000);
  const [preMoneyValuation, setPreMoneyValuation] = useState<number>(5000000);
  const [postMoneyValuation, setPostMoneyValuation] = useState<number>(6000000);
  const [companyName, setCompanyName] = useState<string>('Company Name');
  const [investorName, setInvestorName] = useState<string>('Investor Name');
  const [closingDate, setClosingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Equity-specific fields
  const [liquidationPreference, setLiquidationPreference] = useState<number>(1.0);
  const [antiDilution, setAntiDilution] = useState<boolean>(false);
  const [boardSeats, setBoardSeats] = useState<number>(1);
  const [protectiveProvisions, setProtectiveProvisions] = useState<string[]>([]);
  const [useOfProceeds, setUseOfProceeds] = useState<string>('');
  const [conditionsPrecedent, setConditionsPrecedent] = useState<string[]>([]);
  
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (termSheetData) {
      // Populate form with existing data
      setInstrumentType(termSheetData.instrument_type || 'SAFE');
      setInvestmentAmount(termSheetData.investment_amount || 0);
      setPreMoneyValuation(termSheetData.pre_money_valuation || 0);
      setPostMoneyValuation(termSheetData.post_money_valuation || 0);
      setCompanyName(termSheetData.company_name || '');
      setInvestorName(termSheetData.investor_name || '');
      setLiquidationPreference(termSheetData.liquidation_preference || 1.0);
      setAntiDilution(termSheetData.anti_dilution || false);
      setBoardSeats(termSheetData.board_seats || 0);
      setProtectiveProvisions(termSheetData.protective_provisions || []);
      setUseOfProceeds(termSheetData.use_of_proceeds || '');
      setConditionsPrecedent(termSheetData.conditions_precedent || []);
    }
  }, [termSheetData]);

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!investmentAmount || investmentAmount <= 0) {
      errors.push('Investment amount must be greater than zero');
    }
    
    if (!companyName.trim()) {
      errors.push('Company name is required');
    }
    
    if (!investorName.trim()) {
      errors.push('Investor name is required');
    }
    
    if (preMoneyValuation < 0) {
      errors.push('Pre-money valuation cannot be negative');
    }
    
    if (postMoneyValuation < preMoneyValuation) {
      errors.push('Post-money valuation must be greater than or equal to pre-money valuation');
    }
    
    if (liquidationPreference < 0) {
      errors.push('Liquidation preference cannot be negative');
    }
    
    if (boardSeats < 0) {
      errors.push('Board seats cannot be negative');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }
    
    const termSheet = {
      instrument_type: instrumentType,
      investment_amount: investmentAmount,
      pre_money_valuation: preMoneyValuation,
      post_money_valuation: postMoneyValuation,
      company_name: companyName,
      investor_name: investorName,
      closing_date: closingDate,
      liquidation_preference: liquidationPreference,
      anti_dilution: antiDilution,
      board_seats: boardSeats,
      protective_provisions: protectiveProvisions,
      use_of_proceeds: useOfProceeds,
      conditions_precedent: conditionsPrecedent
    };
    
    onSave(termSheet);
    setIsEditing(false);
  };

  const addProtectiveProvision = () => {
    setProtectiveProvisions([...protectiveProvisions, '']);
  };

  const removeProtectiveProvision = (index: number) => {
    setProtectiveProvisions(protectiveProvisions.filter((_, i) => i !== index));
  };

  const updateProtectiveProvision = (index: number, value: string) => {
    const newProvisions = [...protectiveProvisions];
    newProvisions[index] = value;
    setProtectiveProvisions(newProvisions);
  };

  const addCondition = () => {
    setConditionsPrecedent([...conditionsPrecedent, '']);
  };

  const removeCondition = (index: number) => {
    setConditionsPrecedent(conditionsPrecedent.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, value: string) => {
    const newConditions = [...conditionsPrecedent];
    newConditions[index] = value;
    setConditionsPrecedent(newConditions);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(1)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(1)}M`;
    } else if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(1)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Term Sheet Editor</CardTitle>
          <CardDescription>Loading term sheet editor...</CardDescription>
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
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Term Sheet Editor
              </CardTitle>
              <CardDescription>
                Create and edit investment term sheets with validation
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{instrumentType}</Badge>
              {validationErrors.length > 0 && (
                <Badge className="bg-red-100 text-red-800">
                  {validationErrors.length} errors
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={onGenerate}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Generate Term Sheet
            </Button>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              {isEditing ? 'Cancel Edit' : 'Edit Terms'}
            </Button>
            {isEditing && (
              <Button
                onClick={handleSave}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Term Sheet
              </Button>
            )}
            <Button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {isPreviewMode ? 'Edit Mode' : 'Preview'}
            </Button>
            {onExport && (
              <Button
                onClick={onExport}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Validation Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-red-700">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Term Sheet Content */}
      <Tabs value={isPreviewMode ? 'preview' : 'editor'} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instrumentType">Instrument Type</Label>
                  <Select value={instrumentType} onValueChange={(value: 'SAFE' | 'Equity') => setInstrumentType(value)}>
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
                  <Label htmlFor="closingDate">Closing Date</Label>
                  <Input
                    id="closingDate"
                    type="date"
                    value={closingDate}
                    onChange={(e) => setClosingDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <Label htmlFor="investorName">Investor Name</Label>
                  <Input
                    id="investorName"
                    value={investorName}
                    onChange={(e) => setInvestorName(e.target.value)}
                    placeholder="Enter investor name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investment Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Investment Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="investmentAmount">Investment Amount</Label>
                  <Input
                    id="investmentAmount"
                    type="number"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(parseFloat(e.target.value) || 0)}
                    placeholder="Enter investment amount"
                  />
                </div>
                <div>
                  <Label htmlFor="preMoneyValuation">Pre-Money Valuation</Label>
                  <Input
                    id="preMoneyValuation"
                    type="number"
                    value={preMoneyValuation}
                    onChange={(e) => setPreMoneyValuation(parseFloat(e.target.value) || 0)}
                    placeholder="Enter pre-money valuation"
                  />
                </div>
              </div>
              
              {instrumentType === 'Equity' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postMoneyValuation">Post-Money Valuation</Label>
                    <Input
                      id="postMoneyValuation"
                      type="number"
                      value={postMoneyValuation}
                      onChange={(e) => setPostMoneyValuation(parseFloat(e.target.value) || 0)}
                      placeholder="Enter post-money valuation"
                    />
                  </div>
                  <div>
                    <Label htmlFor="liquidationPreference">Liquidation Preference</Label>
                    <Input
                      id="liquidationPreference"
                      type="number"
                      step="0.1"
                      value={liquidationPreference}
                      onChange={(e) => setLiquidationPreference(parseFloat(e.target.value) || 0)}
                      placeholder="Enter liquidation preference"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Equity-Specific Terms */}
          {instrumentType === 'Equity' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Equity Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="boardSeats">Board Seats</Label>
                    <Input
                      id="boardSeats"
                      type="number"
                      value={boardSeats}
                      onChange={(e) => setBoardSeats(parseInt(e.target.value) || 0)}
                      placeholder="Enter number of board seats"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="antiDilution"
                      type="checkbox"
                      checked={antiDilution}
                      onChange={(e) => setAntiDilution(e.target.checked)}
                    />
                    <Label htmlFor="antiDilution">Anti-Dilution Protection</Label>
                  </div>
                </div>

                {/* Protective Provisions */}
                <div>
                  <Label>Protective Provisions</Label>
                  <div className="space-y-2 mt-2">
                    {protectiveProvisions.map((provision, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={provision}
                          onChange={(e) => updateProtectiveProvision(index, e.target.value)}
                          placeholder="Enter protective provision"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeProtectiveProvision(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={addProtectiveProvision}
                      className="w-full"
                    >
                      Add Protective Provision
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Closing Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Closing Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="useOfProceeds">Use of Proceeds</Label>
                <Textarea
                  id="useOfProceeds"
                  value={useOfProceeds}
                  onChange={(e) => setUseOfProceeds(e.target.value)}
                  placeholder="Describe how the investment funds will be used"
                  rows={3}
                />
              </div>

              {/* Conditions Precedent */}
              <div>
                <Label>Conditions Precedent</Label>
                <div className="space-y-2 mt-2">
                  {conditionsPrecedent.map((condition, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={condition}
                        onChange={(e) => updateCondition(index, e.target.value)}
                        placeholder="Enter condition precedent"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeCondition(index)}
                      >
                        Remove
                      </Button>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Term Sheet Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h2>{instrumentType} Term Sheet - {companyName}</h2>
                
                <h3>Parties</h3>
                <p><strong>Company:</strong> {companyName}</p>
                <p><strong>Investor:</strong> {investorName}</p>
                
                <h3>Investment Terms</h3>
                <p><strong>Instrument:</strong> {instrumentType === 'SAFE' ? 'SAFE (Simple Agreement for Future Equity)' : 'Series A Preferred Stock'}</p>
                <p><strong>Investment Amount:</strong> {formatCurrency(investmentAmount)}</p>
                <p><strong>Pre-Money Valuation:</strong> {formatCurrency(preMoneyValuation)}</p>
                
                {instrumentType === 'Equity' && (
                  <>
                    <p><strong>Post-Money Valuation:</strong> {formatCurrency(postMoneyValuation)}</p>
                    <p><strong>Liquidation Preference:</strong> {liquidationPreference}x non-participating</p>
                    <p><strong>Anti-Dilution:</strong> {antiDilution ? 'Full ratchet' : 'None'}</p>
                    <p><strong>Board Seats:</strong> {boardSeats}</p>
                  </>
                )}
                
                <h3>Closing Terms</h3>
                <p><strong>Closing Date:</strong> {closingDate}</p>
                <p><strong>Use of Proceeds:</strong> {useOfProceeds || 'General corporate purposes'}</p>
                
                {conditionsPrecedent.length > 0 && (
                  <>
                    <h4>Conditions Precedent</h4>
                    <ul>
                      {conditionsPrecedent.map((condition, index) => (
                        <li key={index}>{condition}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
