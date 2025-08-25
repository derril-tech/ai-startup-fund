// Created automatically by Cursor AI (2024-12-19)

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileArchive, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Settings,
  Eye
} from 'lucide-react';

interface ExportManagerProps {
  pitchId: string;
  memoContent?: string;
  valuationData?: any;
  termSheetData?: any;
  capTableData?: any;
  riskAssessment?: any;
  panelTranscript?: string;
  decisionSummary?: any;
  onExport?: (bundleId: string) => void;
}

interface ExportBundle {
  bundle_id: string;
  files: Record<string, string>; // file_type -> signed_url
  expires_at: string;
  total_size_bytes: number;
  file_count: number;
  created_at: string;
  status: 'generating' | 'completed' | 'failed';
}

export function ExportManager({ 
  pitchId,
  memoContent,
  valuationData,
  termSheetData,
  capTableData,
  riskAssessment,
  panelTranscript,
  decisionSummary,
  onExport
}: ExportManagerProps) {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set([
    'memo.pdf', 'valuations.csv', 'term_sheet.pdf', 'cap_table_post.csv', 'risks.csv'
  ]));
  const [retentionDays, setRetentionDays] = useState<number>(365);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [exportBundles, setExportBundles] = useState<ExportBundle[]>([]);
  const [activeTab, setActiveTab] = useState<string>('configure');

  const availableFiles = [
    { id: 'memo.pdf', label: 'Investment Memo (PDF)', icon: FileText, description: 'Complete investment memo in PDF format' },
    { id: 'memo.md', label: 'Investment Memo (Markdown)', icon: FileText, description: 'Investment memo in markdown format' },
    { id: 'valuations.csv', label: 'Valuation Analysis (CSV)', icon: FileSpreadsheet, description: 'All valuation methods and results' },
    { id: 'valuations.json', label: 'Valuation Data (JSON)', icon: FileSpreadsheet, description: 'Detailed valuation data in JSON format' },
    { id: 'valuation_summary.pdf', label: 'Valuation Summary (PDF)', icon: FileText, description: 'Valuation summary report' },
    { id: 'term_sheet.pdf', label: 'Term Sheet (PDF)', icon: FileText, description: 'Investment term sheet' },
    { id: 'term_sheet.json', label: 'Term Sheet Data (JSON)', icon: FileSpreadsheet, description: 'Term sheet data in JSON format' },
    { id: 'cap_table_pre.csv', label: 'Pre-Investment Cap Table (CSV)', icon: FileSpreadsheet, description: 'Cap table before investment' },
    { id: 'cap_table_post.csv', label: 'Post-Investment Cap Table (CSV)', icon: FileSpreadsheet, description: 'Cap table after investment' },
    { id: 'waterfall.csv', label: 'Waterfall Analysis (CSV)', icon: FileSpreadsheet, description: 'Exit scenario waterfall analysis' },
    { id: 'cap_table.json', label: 'Cap Table Data (JSON)', icon: FileSpreadsheet, description: 'Complete cap table data' },
    { id: 'risks.csv', label: 'Risk Assessment (CSV)', icon: FileSpreadsheet, description: 'Risk assessment results' },
    { id: 'risks.json', label: 'Risk Data (JSON)', icon: FileSpreadsheet, description: 'Detailed risk assessment data' },
    { id: 'panel_transcript.txt', label: 'Panel Transcript (TXT)', icon: FileText, description: 'Panel simulation transcript' },
    { id: 'decision.json', label: 'Decision Summary (JSON)', icon: FileSpreadsheet, description: 'Investment decision data' },
    { id: 'decision_summary.pdf', label: 'Decision Summary (PDF)', icon: FileText, description: 'Decision summary report' },
    { id: 'bundle.zip', label: 'Complete Bundle (ZIP)', icon: FileArchive, description: 'All files in a single ZIP archive' }
  ];

  const toggleFileSelection = (fileId: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId);
    } else {
      newSelection.add(fileId);
    }
    setSelectedFiles(newSelection);
  };

  const selectAllFiles = () => {
    setSelectedFiles(new Set(availableFiles.map(f => f.id)));
  };

  const deselectAllFiles = () => {
    setSelectedFiles(new Set());
  };

  const generateExport = async () => {
    if (selectedFiles.size === 0) {
      alert('Please select at least one file to export');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Create bundle configuration
      const bundleConfig = {
        pitch_id: pitchId,
        memo_content: selectedFiles.has('memo.pdf') || selectedFiles.has('memo.md') ? memoContent : undefined,
        valuation_data: selectedFiles.has('valuations.csv') || selectedFiles.has('valuations.json') || selectedFiles.has('valuation_summary.pdf') ? valuationData : undefined,
        term_sheet_data: selectedFiles.has('term_sheet.pdf') || selectedFiles.has('term_sheet.json') ? termSheetData : undefined,
        cap_table_data: selectedFiles.has('cap_table_pre.csv') || selectedFiles.has('cap_table_post.csv') || selectedFiles.has('waterfall.csv') || selectedFiles.has('cap_table.json') ? capTableData : undefined,
        risk_assessment: selectedFiles.has('risks.csv') || selectedFiles.has('risks.json') ? riskAssessment : undefined,
        panel_transcript: selectedFiles.has('panel_transcript.txt') ? panelTranscript : undefined,
        decision_summary: selectedFiles.has('decision.json') || selectedFiles.has('decision_summary.pdf') ? decisionSummary : undefined,
        include_pdf: true,
        include_csv: true,
        include_zip: selectedFiles.has('bundle.zip'),
        retention_days: retentionDays
      };

      // Call API to generate export
      const response = await fetch('/api/exports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bundleConfig),
      });

      if (!response.ok) {
        throw new Error('Failed to generate export');
      }

      const result = await response.json();
      
      // Add to export bundles list
      const newBundle: ExportBundle = {
        ...result,
        created_at: new Date().toISOString(),
        status: 'completed'
      };
      
      setExportBundles(prev => [newBundle, ...prev]);
      
      if (onExport) {
        onExport(result.bundle_id);
      }
      
    } catch (error) {
      console.error('Export generation failed:', error);
      alert('Failed to generate export. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getExpiryDate = (createdAt: string, retentionDays: number) => {
    const created = new Date(createdAt);
    const expiry = new Date(created.getTime() + retentionDays * 24 * 60 * 60 * 1000);
    return expiry;
  };

  const isExpired = (bundle: ExportBundle) => {
    const expiryDate = getExpiryDate(bundle.created_at, retentionDays);
    return new Date() > expiryDate;
  };

  const getDaysUntilExpiry = (bundle: ExportBundle) => {
    const expiryDate = getExpiryDate(bundle.created_at, retentionDays);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Manager
          </CardTitle>
          <CardDescription>
            Generate and download comprehensive export bundles with all pitch analysis artifacts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="configure">Configure Export</TabsTrigger>
              <TabsTrigger value="history">Export History</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="configure" className="space-y-6">
              {/* File Selection */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Select Files to Export</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAllFiles}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={deselectAllFiles}>
                      Deselect All
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableFiles.map((file) => {
                    const Icon = file.icon;
                    const isSelected = selectedFiles.has(file.id);
                    const isAvailable = checkFileAvailability(file.id);
                    
                    return (
                      <div
                        key={file.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        } ${!isAvailable ? 'opacity-50' : ''}`}
                        onClick={() => isAvailable && toggleFileSelection(file.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => isAvailable && toggleFileSelection(file.id)}
                            disabled={!isAvailable}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-gray-500" />
                              <Label className="font-medium cursor-pointer">
                                {file.label}
                              </Label>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{file.description}</p>
                            {!isAvailable && (
                              <Badge variant="outline" className="mt-2">
                                Not Available
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex justify-center">
                <Button
                  onClick={generateExport}
                  disabled={isGenerating || selectedFiles.size === 0}
                  className="flex items-center gap-2"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Generating Export...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Generate Export ({selectedFiles.size} files)
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {exportBundles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Download className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No export bundles generated yet</p>
                  <p className="text-sm">Generate your first export to see it here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {exportBundles.map((bundle) => (
                    <Card key={bundle.bundle_id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{bundle.bundle_id}</CardTitle>
                            <CardDescription>
                              Generated {formatDate(bundle.created_at)} • {bundle.file_count} files • {formatFileSize(bundle.total_size_bytes)}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            {isExpired(bundle) ? (
                              <Badge variant="destructive">Expired</Badge>
                            ) : (
                              <Badge variant="outline">
                                Expires in {getDaysUntilExpiry(bundle)} days
                              </Badge>
                            )}
                            <Badge variant={bundle.status === 'completed' ? 'default' : 'secondary'}>
                              {bundle.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(bundle.files).map(([fileType, url]) => (
                            <div key={fileType} className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadFile(url, fileType)}
                                disabled={isExpired(bundle)}
                                className="flex-1"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                {fileType}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(url, '_blank')}
                                disabled={isExpired(bundle)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div>
                <Label htmlFor="retention">File Retention Period (days)</Label>
                <select
                  id="retention"
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(parseInt(e.target.value))}
                  className="mt-2 w-full p-2 border rounded-md"
                >
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                  <option value={180}>180 days</option>
                  <option value={365}>365 days</option>
                  <option value={730}>2 years</option>
                </select>
                <p className="text-sm text-gray-600 mt-1">
                  Exported files will be automatically deleted after this period
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );

  function checkFileAvailability(fileId: string): boolean {
    // Check if the required data is available for each file type
    switch (fileId) {
      case 'memo.pdf':
      case 'memo.md':
        return !!memoContent;
      case 'valuations.csv':
      case 'valuations.json':
      case 'valuation_summary.pdf':
        return !!valuationData;
      case 'term_sheet.pdf':
      case 'term_sheet.json':
        return !!termSheetData;
      case 'cap_table_pre.csv':
      case 'cap_table_post.csv':
      case 'waterfall.csv':
      case 'cap_table.json':
        return !!capTableData;
      case 'risks.csv':
      case 'risks.json':
        return !!riskAssessment;
      case 'panel_transcript.txt':
        return !!panelTranscript;
      case 'decision.json':
      case 'decision_summary.pdf':
        return !!decisionSummary;
      case 'bundle.zip':
        return selectedFiles.size > 1; // Available if other files are selected
      default:
        return true;
    }
  }
}
