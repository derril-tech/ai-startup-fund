// Created automatically by Cursor AI (2024-12-19)

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Pitch, KPI, Valuation, Risk, Decision, CapTable, TermSheet } from './types';

export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = 'http://localhost:3001', token?: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
  }

  // Pitch endpoints
  async createPitch(pitch: Partial<Pitch>): Promise<Pitch> {
    const response: AxiosResponse<Pitch> = await this.client.post('/pitches', pitch);
    return response.data;
  }

  async getPitch(id: string): Promise<Pitch> {
    const response: AxiosResponse<Pitch> = await this.client.get(`/pitches/${id}`);
    return response.data;
  }

  async listPitches(): Promise<Pitch[]> {
    const response: AxiosResponse<Pitch[]> = await this.client.get('/pitches');
    return response.data;
  }

  // KPI endpoints
  async getKPIs(pitchId: string): Promise<KPI[]> {
    const response: AxiosResponse<KPI[]> = await this.client.get(`/pitches/${pitchId}/kpis`);
    return response.data;
  }

  // Valuation endpoints
  async runValuation(pitchId: string, method: string, inputs: any): Promise<Valuation> {
    const response: AxiosResponse<Valuation> = await this.client.post(
      `/pitches/${pitchId}/valuation/${method}`,
      inputs
    );
    return response.data;
  }

  async getValuations(pitchId: string): Promise<Valuation[]> {
    const response: AxiosResponse<Valuation[]> = await this.client.get(`/pitches/${pitchId}/valuations`);
    return response.data;
  }

  // Risk endpoints
  async getRisks(pitchId: string): Promise<Risk[]> {
    const response: AxiosResponse<Risk[]> = await this.client.get(`/pitches/${pitchId}/risks`);
    return response.data;
  }

  // Decision endpoints
  async createDecision(pitchId: string, decision: Partial<Decision>): Promise<Decision> {
    const response: AxiosResponse<Decision> = await this.client.post(`/pitches/${pitchId}/decision`, decision);
    return response.data;
  }

  async getDecision(pitchId: string): Promise<Decision> {
    const response: AxiosResponse<Decision> = await this.client.get(`/pitches/${pitchId}/decision`);
    return response.data;
  }

  // Cap table endpoints
  async simulateCapTable(pitchId: string, params: any): Promise<CapTable> {
    const response: AxiosResponse<CapTable> = await this.client.post(
      `/pitches/${pitchId}/cap-table/simulate`,
      params
    );
    return response.data;
  }

  // Term sheet endpoints
  async createTermSheet(pitchId: string, params: any): Promise<TermSheet> {
    const response: AxiosResponse<TermSheet> = await this.client.post(
      `/pitches/${pitchId}/term-sheet`,
      params
    );
    return response.data;
  }
}
