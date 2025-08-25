// Created automatically by Cursor AI (2024-12-19)

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const pitchSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  stage: z.enum(['idea', 'preseed', 'seed', 'A']),
  sector: z.string().min(1, 'Sector is required'),
  geo: z.string().min(1, 'Geography is required'),
  round_type: z.enum(['SAFE', 'Equity']),
  ask_usd: z.number().positive('Ask amount must be positive'),
  summary: z.string().min(10, 'Summary must be at least 10 characters'),
  use_of_funds: z.array(z.string()).min(1, 'At least one use of funds is required'),
});

type PitchFormData = z.infer<typeof pitchSchema>;

interface PitchWizardProps {
  onSubmit: (data: PitchFormData) => void;
  isLoading?: boolean;
}

export function PitchWizard({ onSubmit, isLoading = false }: PitchWizardProps) {
  const [useOfFunds, setUseOfFunds] = useState<string[]>(['']);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PitchFormData>({
    resolver: zodResolver(pitchSchema),
    defaultValues: {
      stage: 'idea',
      round_type: 'SAFE',
      use_of_funds: [''],
    },
  });

  const addUseOfFunds = () => {
    setUseOfFunds([...useOfFunds, '']);
  };

  const removeUseOfFunds = (index: number) => {
    const newUseOfFunds = useOfFunds.filter((_, i) => i !== index);
    setUseOfFunds(newUseOfFunds);
    setValue('use_of_funds', newUseOfFunds);
  };

  const updateUseOfFunds = (index: number, value: string) => {
    const newUseOfFunds = [...useOfFunds];
    newUseOfFunds[index] = value;
    setUseOfFunds(newUseOfFunds);
    setValue('use_of_funds', newUseOfFunds);
  };

  const onFormSubmit = (data: PitchFormData) => {
    onSubmit(data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Pitch</CardTitle>
        <CardDescription>
          Fill in the details below to create a new pitch for evaluation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Pitch Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter pitch title"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stage">Stage *</Label>
              <Select onValueChange={(value) => setValue('stage', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idea">Idea</SelectItem>
                  <SelectItem value="preseed">Pre-seed</SelectItem>
                  <SelectItem value="seed">Seed</SelectItem>
                  <SelectItem value="A">Series A</SelectItem>
                </SelectContent>
              </Select>
              {errors.stage && (
                <p className="text-sm text-red-500">{errors.stage.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="round_type">Round Type *</Label>
              <Select onValueChange={(value) => setValue('round_type', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select round type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAFE">SAFE</SelectItem>
                  <SelectItem value="Equity">Equity</SelectItem>
                </SelectContent>
              </Select>
              {errors.round_type && (
                <p className="text-sm text-red-500">{errors.round_type.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sector">Sector *</Label>
              <Input
                id="sector"
                {...register('sector')}
                placeholder="e.g., SaaS, Fintech, Healthtech"
              />
              {errors.sector && (
                <p className="text-sm text-red-500">{errors.sector.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="geo">Geography *</Label>
              <Input
                id="geo"
                {...register('geo')}
                placeholder="e.g., US, EU, Global"
              />
              {errors.geo && (
                <p className="text-sm text-red-500">{errors.geo.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ask_usd">Ask Amount (USD) *</Label>
            <Input
              id="ask_usd"
              type="number"
              {...register('ask_usd', { valueAsNumber: true })}
              placeholder="Enter amount in USD"
            />
            {errors.ask_usd && (
              <p className="text-sm text-red-500">{errors.ask_usd.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Use of Funds *</Label>
            {useOfFunds.map((_, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={useOfFunds[index]}
                  onChange={(e) => updateUseOfFunds(index, e.target.value)}
                  placeholder="e.g., Product development, Marketing, Hiring"
                />
                {useOfFunds.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeUseOfFunds(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addUseOfFunds}
              className="w-full"
            >
              Add Use of Funds
            </Button>
            {errors.use_of_funds && (
              <p className="text-sm text-red-500">{errors.use_of_funds.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Pitch Summary *</Label>
            <Textarea
              id="summary"
              {...register('summary')}
              placeholder="Describe your startup, problem, solution, and market opportunity..."
              rows={4}
            />
            {errors.summary && (
              <p className="text-sm text-red-500">{errors.summary.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating Pitch...' : 'Create Pitch'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
