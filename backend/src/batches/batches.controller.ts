import { Controller, Post, Get, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { BatchesService } from './batches.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';

class CreateBatchDto {
  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsNotEmpty()
  origin: string;

  @IsString()
  @IsNotEmpty()
  batchIdentifier: string;

  @IsString()
  @IsOptional()
  plantingDate?: string;

  @IsString()
  @IsOptional()
  harvestDate?: string;

  @IsString()
  @IsOptional()
  fertilizerUsed?: string;
}

class UpdateStageDto {
  @IsString()
  @IsNotEmpty()
  stage: string;

  @IsObject()
  @IsOptional()
  details?: Record<string, any>;
}

@Controller()
export class BatchesController {
  constructor(private batchesService: BatchesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('batches')
  async create(@Request() req, @Body() dto: CreateBatchDto) {
    // Only Farmer can create batches
    if (req.user.role !== 'Farmer') {
      throw new ForbiddenException('Only Farmers can create new food batches');
    }
    return this.batchesService.createBatch(
      dto.productName,
      dto.origin,
      dto.batchIdentifier,
      dto.plantingDate || '',
      dto.harvestDate || '',
      dto.fertilizerUsed || '',
      req.user.userId,
      req.user.walletAddress,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('batches')
  async listAll() {
    return this.batchesService.getAllBatches();
  }

  @UseGuards(JwtAuthGuard)
  @Get('batches/:id')
  async getOne(@Param('id') id: string) {
    return this.batchesService.getBatch(parseInt(id, 10));
  }

  @UseGuards(JwtAuthGuard)
  @Post('batches/:id/stage')
  async updateStage(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateStageDto,
  ) {
    // Farmer, Processor, Logistics, Retailer can update stages. Consumer is read-only.
    if (req.user.role === 'Consumer') {
      throw new ForbiddenException('Consumers cannot update supply chain stages');
    }
    return this.batchesService.updateStage(
      parseInt(id, 10),
      dto.stage,
      dto.details || {},
      req.user.userId,
      req.user.walletAddress,
    );
  }

  // Public endpoint for consumers tracing product history
  @Get('trace/:batchId')
  async trace(@Param('batchId') batchId: string) {
    return this.batchesService.traceBatch(batchId);
  }
}
