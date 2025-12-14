/**
 * Lead Controller - Presentation Layer
 *
 * Controllers são finos e apenas:
 * 1. Extraem dados do request
 * 2. Chamam Use Cases
 * 3. Formatam response
 *
 * NÃO contêm lógica de negócio.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/prisma/client';
import { LeadRepository } from '@/infrastructure/repositories/lead.repository';
import { LeadMapper } from '@/application/mappers/lead.mapper';
import {
  CreateLeadUseCase,
  ListLeadsUseCase,
  UpdateLeadStatusUseCase,
} from '@/application/use-cases/leads';
import { LeadStatus, LeadSource } from '@/core/domain/entities/lead.entity';

export class LeadController {
  /**
   * GET /api/leads
   */
  static async list(req: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url);

      // Extrair parâmetros
      const organizationId = searchParams.get('organizationId');
      if (!organizationId) {
        return NextResponse.json(
          { error: 'Organization ID is required' },
          { status: 400 }
        );
      }

      const status = searchParams.get('status') as LeadStatus | null;
      const source = searchParams.get('source') as LeadSource | null;
      const search = searchParams.get('search');
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');

      // Criar use case com repository
      const repository = new LeadRepository(prisma);
      const useCase = new ListLeadsUseCase(repository);

      // Executar use case
      const result = await useCase.execute({
        organizationId,
        status: status || undefined,
        source: source || undefined,
        search: search || undefined,
        page,
        limit,
      });

      // Formatar response
      return NextResponse.json({
        leads: LeadMapper.toResponseList(result.leads),
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (error: any) {
      console.error('[LeadController] Error listing leads:', error);
      return NextResponse.json(
        { error: error.message || 'Internal server error' },
        { status: 500 }
      );
    }
  }

  /**
   * POST /api/leads
   */
  static async create(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();

      // Criar use case com repository
      const repository = new LeadRepository(prisma);
      const useCase = new CreateLeadUseCase(repository);

      // Executar use case
      const result = await useCase.execute({
        organizationId: body.organizationId,
        name: body.name,
        email: body.email,
        phone: body.phone,
        company: body.company,
        position: body.position,
        status: body.status,
        source: body.source,
        value: body.value,
        notes: body.notes,
        tags: body.tags,
        assignedTo: body.assignedTo,
      });

      // Formatar response
      return NextResponse.json(
        LeadMapper.toResponse(result.lead),
        { status: 201 }
      );
    } catch (error: any) {
      console.error('[LeadController] Error creating lead:', error);
      return NextResponse.json(
        { error: error.message || 'Internal server error' },
        { status: 500 }
      );
    }
  }

  /**
   * PATCH /api/leads/[id]
   */
  static async updateStatus(
    req: NextRequest,
    leadId: string
  ): Promise<NextResponse> {
    try {
      const body = await req.json();

      // Criar use case com repository
      const repository = new LeadRepository(prisma);
      const useCase = new UpdateLeadStatusUseCase(repository);

      // Executar use case
      const result = await useCase.execute({
        leadId,
        newStatus: body.status,
      });

      // Formatar response
      return NextResponse.json(LeadMapper.toResponse(result.lead));
    } catch (error: any) {
      console.error('[LeadController] Error updating lead status:', error);
      return NextResponse.json(
        { error: error.message || 'Internal server error' },
        { status: 500 }
      );
    }
  }
}
