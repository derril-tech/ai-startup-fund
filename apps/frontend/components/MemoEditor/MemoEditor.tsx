// Created automatically by Cursor AI (2024-12-19)

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Edit, 
  Save, 
  Download, 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Shield
} from 'lucide-react';

interface MemoSection {
  title: string;
  content: string;
  key: string;
  icon: any;
  required: boolean;
}

interface MemoEditorProps {
  memoData?: {
    sections: Record<string, string>;
    full_memo: string;
    word_count: number;
  };
  decisionData?: any;
  onSave: (memo: any) => void;
  onGenerate: () => void;
  isLoading?: boolean;
}

export function MemoEditor({ 
  memoData, 
  decisionData, 
  onSave, 
  onGenerate, 
  isLoading = false 
}: MemoEditorProps) {
  const [sections, setSections] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<string>('executive_summary');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  const memoSections: MemoSection[] = [
    {
      title: 'Executive Summary',
      key: 'executive_summary',
      icon: TrendingUp,
      required: true
    },
    {
      title: 'Investment Thesis',
      key: 'investment_thesis',
      icon: DollarSign,
      required: true
    },
    {
      title: 'Market Analysis',
      key: 'market_analysis',
      icon: TrendingUp,
      required: true
    },
    {
      title: 'Financial Analysis',
      key: 'financial_analysis',
      icon: DollarSign,
      required: true
    },
    {
      title: 'Risk Assessment',
      key: 'risk_assessment',
      icon: Shield,
      required: true
    },
    {
      title: 'Due Diligence',
      key: 'due_diligence',
      icon: CheckCircle,
      required: false
    },
    {
      title: 'Terms & Conditions',
      key: 'terms_and_conditions',
      icon: FileText,
      required: true
    },
    {
      title: 'Recommendation',
      key: 'recommendation',
      icon: AlertTriangle,
      required: true
    }
  ];

  useEffect(() => {
    if (memoData?.sections) {
      setSections(memoData.sections);
    }
  }, [memoData]);

  const updateSection = (key: string, content: string) => {
    setSections(prev => ({
      ...prev,
      [key]: content
    }));
  };

  const handleSave = () => {
    const memo = {
      sections,
      full_memo: generateFullMemo(),
      word_count: calculateWordCount()
    };
    onSave(memo);
    setIsEditing(false);
  };

  const generateFullMemo = () => {
    const sectionOrder = memoSections.map(s => s.key);
    let fullMemo = '';
    
    sectionOrder.forEach(key => {
      if (sections[key]) {
        const section = memoSections.find(s => s.key === key);
        fullMemo += `# ${section?.title}\n\n${sections[key]}\n\n`;
      }
    });
    
    return fullMemo.trim();
  };

  const calculateWordCount = () => {
    const fullMemo = generateFullMemo();
    return fullMemo.split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCompletionStatus = () => {
    const requiredSections = memoSections.filter(s => s.required);
    const completedSections = requiredSections.filter(s => 
      sections[s.key] && sections[s.key].trim().length > 0
    );
    
    return {
      completed: completedSections.length,
      total: requiredSections.length,
      percentage: Math.round((completedSections.length / requiredSections.length) * 100)
    };
  };

  const completionStatus = getCompletionStatus();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Investment Memo Editor</CardTitle>
          <CardDescription>Loading memo editor...</CardDescription>
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
                Investment Memo Editor
              </CardTitle>
              <CardDescription>
                Create and edit investment memo with comprehensive analysis
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {completionStatus.completed}/{completionStatus.total} sections
              </Badge>
              <Badge className={completionStatus.percentage >= 100 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {completionStatus.percentage}% complete
              </Badge>
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
              Generate Memo
            </Button>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              {isEditing ? 'Cancel Edit' : 'Edit Memo'}
            </Button>
            {isEditing && (
              <Button
                onClick={handleSave}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Memo
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
          </div>
        </CardContent>
      </Card>

      {/* Memo Content */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto p-2">
              {memoSections.map((section) => (
                <TabsTrigger
                  key={section.key}
                  value={section.key}
                  className="flex items-center gap-2 h-auto py-2 px-3 text-xs"
                >
                  <section.icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{section.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {memoSections.map((section) => (
              <TabsContent key={section.key} value={section.key} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <section.icon className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">{section.title}</h3>
                      {section.required && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                    </div>
                    {sections[section.key] && (
                      <Badge className="bg-green-100 text-green-800">
                        {sections[section.key].split(/\s+/).length} words
                      </Badge>
                    )}
                  </div>

                  {isPreviewMode ? (
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                        {sections[section.key] || 'No content available'}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor={section.key} className="text-sm font-medium">
                        {section.title} Content
                      </Label>
                      <Textarea
                        id={section.key}
                        value={sections[section.key] || ''}
                        onChange={(e) => updateSection(section.key, e.target.value)}
                        placeholder={`Enter ${section.title.toLowerCase()} content...`}
                        rows={12}
                        className="mt-2 font-mono text-sm"
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Decision Summary */}
      {decisionData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Decision Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {decisionData.recommendation?.toUpperCase() || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Recommendation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${decisionData.check_size_usd?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-gray-600">Check Size</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {decisionData.target_ownership ? `${(decisionData.target_ownership * 100).toFixed(1)}%` : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Ownership</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {decisionData.conditions?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Conditions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Memo Preview */}
      {isPreviewMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Full Memo Preview
            </CardTitle>
            <CardDescription>
              Complete investment memo ({calculateWordCount()} words)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap bg-gray-50 p-6 rounded-lg max-h-96 overflow-y-auto">
                {generateFullMemo() || 'No memo content available'}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
