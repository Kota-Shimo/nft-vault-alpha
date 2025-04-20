import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../prisma.service';
import * as fs from 'fs';

@Controller('proof')
export class ProofController {
  constructor(private prisma: PrismaService) {}

  @Get(':id')
  async download(@Param('id') id: string, @Res() res: Response) {
    const proof = await this.prisma.proof.findUnique({ where: { id } });
    if (!proof) return res.status(404).send('Not found');
    res.setHeader('Content-Type', 'application/pdf');
    fs.createReadStream(proof.pdfUrl).pipe(res);
  }
}
