import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

@Injectable()
export class ProofService {
  constructor(private prisma: PrismaService) {}

  /** Tx 1件 → PDF生成 → Celestiaハッシュ保存 → Proof登録 */
  async createProof(txId: string) {
    /* すでに Proof があればスキップ */
    const already = await this.prisma.proof.findUnique({ where: { txId } });
    if (already) return already;

    /* Tx を取得 */
    const tx = await this.prisma.tx.findUnique({ where: { id: txId } });
    if (!tx) throw new Error('Tx not found');

    /*── ① PDF 生成 ──*/
    const pdfName = `proof-${tx.id}.pdf`;
    const pdfPath = `${tmpdir()}/${pdfName}`;

    const doc = new PDFDocument({ font: 'Helvetica' });
    doc.pipe(fs.createWriteStream(pdfPath));
    doc.fontSize(14).text(`Tx Hash : ${tx.hash}`);
    doc.text(`Amount(¥): ${tx.amountJpy}`);
    doc.text(`Type     : ${tx.txType}`);
    doc.end();
    await new Promise((res) => doc.on('end', res));

    /*── ② ダミー Celestia ハッシュ ──*/
    const celestiaHash = `celestia://${randomUUID()}`;

    /*── ③ Proof 登録 ──*/
    return this.prisma.proof.create({
      data: { txId: tx.id, pdfUrl: pdfPath, celestiaHash },
    });
  }

  async list(tenantId: string) {
    return this.prisma.proof.findMany({
      where: { tx: { tenantId } },
      orderBy: { id: 'desc' },
    });
  }
}
