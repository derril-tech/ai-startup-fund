// Created automatically by Cursor AI (2024-12-19)

import { IsString, IsOptional, IsEnum, IsNumber, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePitchDto {
  @ApiProperty({ description: 'Pitch title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Pitch stage', enum: ['idea', 'preseed', 'seed', 'A'] })
  @IsEnum(['idea', 'preseed', 'seed', 'A'])
  @IsOptional()
  stage?: 'idea' | 'preseed' | 'seed' | 'A';

  @ApiProperty({ description: 'Sector' })
  @IsString()
  @IsOptional()
  sector?: string;

  @ApiProperty({ description: 'Geography' })
  @IsString()
  @IsOptional()
  geo?: string;

  @ApiProperty({ description: 'Round type', enum: ['SAFE', 'Equity'] })
  @IsEnum(['SAFE', 'Equity'])
  @IsOptional()
  round_type?: 'SAFE' | 'Equity';

  @ApiProperty({ description: 'Ask amount in USD' })
  @IsNumber()
  @IsOptional()
  ask_usd?: number;

  @ApiProperty({ description: 'Use of funds' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  use_of_funds?: string[];

  @ApiProperty({ description: 'Pitch summary' })
  @IsString()
  @IsOptional()
  summary?: string;
}

export class UpdatePitchDto {
  @ApiProperty({ description: 'Pitch title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Pitch stage', enum: ['idea', 'preseed', 'seed', 'A'] })
  @IsEnum(['idea', 'preseed', 'seed', 'A'])
  @IsOptional()
  stage?: 'idea' | 'preseed' | 'seed' | 'A';

  @ApiProperty({ description: 'Sector' })
  @IsString()
  @IsOptional()
  sector?: string;

  @ApiProperty({ description: 'Geography' })
  @IsString()
  @IsOptional()
  geo?: string;

  @ApiProperty({ description: 'Round type', enum: ['SAFE', 'Equity'] })
  @IsEnum(['SAFE', 'Equity'])
  @IsOptional()
  round_type?: 'SAFE' | 'Equity';

  @ApiProperty({ description: 'Ask amount in USD' })
  @IsNumber()
  @IsOptional()
  ask_usd?: number;

  @ApiProperty({ description: 'Use of funds' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  use_of_funds?: string[];

  @ApiProperty({ description: 'Pitch summary' })
  @IsString()
  @IsOptional()
  summary?: string;

  @ApiProperty({ description: 'Pitch status', enum: ['created', 'ingested', 'analyzing', 'valued', 'panel', 'decided', 'exported', 'archived'] })
  @IsEnum(['created', 'ingested', 'analyzing', 'valued', 'panel', 'decided', 'exported', 'archived'])
  @IsOptional()
  status?: 'created' | 'ingested' | 'analyzing' | 'valued' | 'panel' | 'decided' | 'exported' | 'archived';
}

export class PitchResponseDto {
  @ApiProperty({ description: 'Pitch ID' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Organization ID' })
  @IsUUID()
  org_id: string;

  @ApiProperty({ description: 'Pitch title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Pitch stage' })
  @IsString()
  stage: string;

  @ApiProperty({ description: 'Sector' })
  @IsString()
  sector: string;

  @ApiProperty({ description: 'Geography' })
  @IsString()
  geo: string;

  @ApiProperty({ description: 'Round type' })
  @IsString()
  round_type: string;

  @ApiProperty({ description: 'Ask amount in USD' })
  @IsNumber()
  ask_usd: number;

  @ApiProperty({ description: 'Use of funds' })
  @IsArray()
  use_of_funds: string[];

  @ApiProperty({ description: 'Pitch summary' })
  @IsString()
  summary: string;

  @ApiProperty({ description: 'Pitch status' })
  @IsString()
  status: string;

  @ApiProperty({ description: 'Created by user ID' })
  @IsUUID()
  created_by: string;

  @ApiProperty({ description: 'Created at timestamp' })
  created_at: Date;
}
