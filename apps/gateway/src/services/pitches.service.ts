// Created automatically by Cursor AI (2024-12-19)

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pitch } from '../entities/pitch.entity';
import { CreatePitchDto, UpdatePitchDto, PitchResponseDto } from '../dto/pitch.dto';

@Injectable()
export class PitchesService {
  constructor(
    @InjectRepository(Pitch)
    private pitchRepository: Repository<Pitch>,
  ) {}

  async create(createPitchDto: CreatePitchDto): Promise<PitchResponseDto> {
    const pitch = this.pitchRepository.create({
      ...createPitchDto,
      org_id: 'demo-org-id', // TODO: Get from JWT token
      created_by: 'demo-user-id', // TODO: Get from JWT token
    });

    const savedPitch = await this.pitchRepository.save(pitch);
    return this.mapToResponseDto(savedPitch);
  }

  async findAll(status?: string): Promise<PitchResponseDto[]> {
    const query = this.pitchRepository.createQueryBuilder('pitch')
      .where('pitch.org_id = :orgId', { orgId: 'demo-org-id' }); // TODO: Get from JWT token

    if (status) {
      query.andWhere('pitch.status = :status', { status });
    }

    const pitches = await query.getMany();
    return pitches.map(pitch => this.mapToResponseDto(pitch));
  }

  async findOne(id: string): Promise<PitchResponseDto> {
    const pitch = await this.pitchRepository.findOne({
      where: { id, org_id: 'demo-org-id' }, // TODO: Get from JWT token
    });

    if (!pitch) {
      throw new NotFoundException(`Pitch with ID ${id} not found`);
    }

    return this.mapToResponseDto(pitch);
  }

  async update(id: string, updatePitchDto: UpdatePitchDto): Promise<PitchResponseDto> {
    const pitch = await this.findOne(id);
    
    await this.pitchRepository.update(id, updatePitchDto);
    
    const updatedPitch = await this.findOne(id);
    return updatedPitch;
  }

  async remove(id: string): Promise<void> {
    const pitch = await this.findOne(id);
    await this.pitchRepository.delete(id);
  }

  async startIngestion(id: string): Promise<{ message: string }> {
    const pitch = await this.findOne(id);
    
    // TODO: Trigger ingestion process via NATS/Celery
    await this.pitchRepository.update(id, { status: 'ingested' });
    
    return { message: 'Ingestion process started' };
  }

  async getKPIs(id: string): Promise<any[]> {
    const pitch = await this.findOne(id);
    // TODO: Implement KPI retrieval
    return [];
  }

  async getValuations(id: string): Promise<any[]> {
    const pitch = await this.findOne(id);
    // TODO: Implement valuation retrieval
    return [];
  }

  private mapToResponseDto(pitch: Pitch): PitchResponseDto {
    return {
      id: pitch.id,
      org_id: pitch.org_id,
      title: pitch.title,
      stage: pitch.stage,
      sector: pitch.sector,
      geo: pitch.geo,
      round_type: pitch.round_type,
      ask_usd: pitch.ask_usd,
      use_of_funds: pitch.use_of_funds,
      summary: pitch.summary,
      status: pitch.status,
      created_by: pitch.created_by,
      created_at: pitch.created_at,
    };
  }
}
