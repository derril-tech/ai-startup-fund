// Created automatically by Cursor AI (2024-12-19)

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface PanelTurn {
  turn: number;
  speaker: string;
  content: string;
  timestamp: string;
  agent_type: 'investor' | 'analyst' | 'founder' | 'other';
}

interface PanelCondition {
  source: string;
  turn: number;
  content: string;
  type: string;
  extracted_at: string;
}

interface DecisionSummary {
  overall_sentiment: 'positive' | 'negative' | 'neutral';
  investor_positions: Record<string, string>;
  key_concerns: string[];
  recommendations: string[];
  conditions_count: number;
  debate_quality: string;
}

interface PanelRoomProps {
  panelData?: {
    transcript: PanelTurn[];
    conditions: PanelCondition[];
    decision_summary: DecisionSummary;
    participants: string[];
    debate_turns: number;
  };
  onStartSimulation?: () => void;
  onPauseSimulation?: () => void;
  onResetSimulation?: () => void;
  isLoading?: boolean;
  isLive?: boolean;
}

export function PanelRoom({ 
  panelData, 
  onStartSimulation, 
  onPauseSimulation, 
  onResetSimulation,
  isLoading = false,
  isLive = false 
}: PanelRoomProps) {
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const agentIcons = {
    'Angel Investor': '👼',
    'Venture Capitalist': '💰',
    'Risk Analyst': '🔍',
    'Founder Advocate': '🚀',
    'Moderator': '🎤'
  };

  const agentColors = {
    'Angel Investor': 'bg-blue-100 text-blue-800',
    'Venture Capitalist': 'bg-green-100 text-green-800',
    'Risk Analyst': 'bg-purple-100 text-purple-800',
    'Founder Advocate': 'bg-orange-100 text-orange-800',
    'Moderator': 'bg-gray-100 text-gray-800'
  };

  const sentimentColors = {
    positive: 'bg-green-100 text-green-800',
    negative: 'bg-red-100 text-red-800',
    neutral: 'bg-gray-100 text-gray-800'
  };

  useEffect(() => {
    if (isPlaying && panelData?.transcript) {
      const timer = setTimeout(() => {
        if (currentTurn < panelData.transcript.length - 1) {
          setCurrentTurn(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, 3000 / playbackSpeed);

      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentTurn, panelData?.transcript, playbackSpeed]);

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      onPauseSimulation?.();
    } else {
      setIsPlaying(true);
      onStartSimulation?.();
    }
  };

  const handleReset = () => {
    setCurrentTurn(0);
    setIsPlaying(false);
    onResetSimulation?.();
  };

  const visibleTranscript = panelData?.transcript?.slice(0, currentTurn + 1) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Panel Room</CardTitle>
          <CardDescription>Loading panel simulation...</CardDescription>
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
      {/* Panel Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Investment Panel Room
              </CardTitle>
              <CardDescription>
                Real-time simulation of investment panel discussion
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isLive && (
                <Badge className="bg-red-100 text-red-800 animate-pulse">
                  LIVE
                </Badge>
              )}
              <Badge variant="outline">
                Turn {currentTurn + 1} of {panelData?.debate_turns || 0}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={handlePlayPause}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Speed:</span>
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="text-sm border rounded px-2 py-1"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Panel Discussion */}
      <Tabs defaultValue="transcript" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
        </TabsList>

        <TabsContent value="transcript" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Panel Discussion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {visibleTranscript.map((turn, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 p-3 rounded-lg border ${
                      index === currentTurn && isPlaying ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {agentIcons[turn.speaker as keyof typeof agentIcons] || '👤'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{turn.speaker}</span>
                        <Badge className={agentColors[turn.speaker as keyof typeof agentColors]}>
                          {turn.agent_type}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Turn {turn.turn}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{turn.content}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {new Date(turn.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Decision Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {panelData?.decision_summary ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Overall Sentiment</h4>
                      <Badge className={sentimentColors[panelData.decision_summary.overall_sentiment]}>
                        {panelData.decision_summary.overall_sentiment.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Debate Quality</h4>
                      <Badge variant="outline">
                        {panelData.decision_summary.debate_quality.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Investor Positions</h4>
                    <div className="space-y-1">
                      {Object.entries(panelData.decision_summary.investor_positions).map(([investor, position]) => (
                        <div key={investor} className="flex items-center gap-2">
                          <span className="text-sm">{investor}:</span>
                          <Badge className={sentimentColors[position as keyof typeof sentimentColors]}>
                            {position}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Key Concerns</h4>
                    <ul className="space-y-1">
                      {panelData.decision_summary.key_concerns.map((concern, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <AlertTriangle className="h-3 w-3 mt-0.5 text-orange-500" />
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Recommendations</h4>
                    <ul className="space-y-1">
                      {panelData.decision_summary.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 mt-0.5 text-green-500" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No decision summary available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conditions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Investment Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {panelData?.conditions && panelData.conditions.length > 0 ? (
                <div className="space-y-3">
                  {panelData.conditions.map((condition, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{condition.source}</span>
                        <Badge variant="outline">Turn {condition.turn}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{condition.content}</p>
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(condition.extracted_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No conditions identified yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Panel Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {panelData?.participants?.map((participant) => (
                  <div key={participant} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Avatar>
                      <AvatarFallback>
                        {agentIcons[participant as keyof typeof agentIcons] || '👤'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{participant}</div>
                      <Badge className={agentColors[participant as keyof typeof agentColors]}>
                        {getAgentType(participant)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getAgentType(participant: string): string {
  if (participant.includes('Angel') || participant.includes('VC')) {
    return 'investor';
  } else if (participant.includes('Risk')) {
    return 'analyst';
  } else if (participant.includes('Founder')) {
    return 'founder';
  } else {
    return 'other';
  }
}
