// Created automatically by Cursor AI (2024-12-19)

import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PitchesService } from '../services/pitches.service';
import { CreatePitchDto, UpdatePitchDto, PitchResponseDto } from '../dto/pitch.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Pitches')
@Controller('pitches')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PitchesController {
  constructor(private readonly pitchesService: PitchesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pitch' })
  @ApiResponse({ status: 201, description: 'Pitch created successfully', type: PitchResponseDto })
  async createPitch(@Body() createPitchDto: CreatePitchDto): Promise<PitchResponseDto> {
    return this.pitchesService.create(createPitchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pitches for the current organization' })
  @ApiResponse({ status: 200, description: 'Pitches retrieved successfully', type: [PitchResponseDto] })
  async getPitches(@Query('status') status?: string): Promise<PitchResponseDto[]> {
    return this.pitchesService.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a pitch by ID' })
  @ApiResponse({ status: 200, description: 'Pitch retrieved successfully', type: PitchResponseDto })
  async getPitch(@Param('id') id: string): Promise<PitchResponseDto> {
    return this.pitchesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a pitch' })
  @ApiResponse({ status: 200, description: 'Pitch updated successfully', type: PitchResponseDto })
  async updatePitch(
    @Param('id') id: string,
    @Body() updatePitchDto: UpdatePitchDto,
  ): Promise<PitchResponseDto> {
    return this.pitchesService.update(id, updatePitchDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pitch' })
  @ApiResponse({ status: 200, description: 'Pitch deleted successfully' })
  async deletePitch(@Param('id') id: string): Promise<void> {
    return this.pitchesService.remove(id);
  }

  @Post(':id/ingest')
  @ApiOperation({ summary: 'Start pitch ingestion process' })
  @ApiResponse({ status: 200, description: 'Ingestion started successfully' })
  async startIngestion(@Param('id') id: string): Promise<{ message: string }> {
    return this.pitchesService.startIngestion(id);
  }

  @Get(':id/kpis')
  @ApiOperation({ summary: 'Get KPIs for a pitch' })
  @ApiResponse({ status: 200, description: 'KPIs retrieved successfully' })
  async getKPIs(@Param('id') id: string): Promise<any[]> {
    return this.pitchesService.getKPIs(id);
  }

  @Get(':id/valuations')
  @ApiOperation({ summary: 'Get valuations for a pitch' })
  @ApiResponse({ status: 200, description: 'Valuations retrieved successfully' })
  async getValuations(@Param('id') id: string): Promise<any[]> {
    return this.pitchesService.getValuations(id);
  }
}
