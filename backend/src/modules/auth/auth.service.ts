import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';
import { ConnectWalletInput } from './dto/connect-wallet.input';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /* ───── メール & パスワード検証 ───── */
  async validateUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /* ───── JWT 発行 ───── */
  async login(user: { id: string; email: string | null; tenantId: string | null }) {
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,     // ★ tenantId を含める
    };
    return { accessToken: this.jwtService.sign(payload) };
  }

  /* ───── 新規ユーザー登録 ───── */
  async register(email: string, pass: string) {
    const hash = await bcrypt.hash(pass, 10);

    /* ① Tenant を同時に作成 */
    const tenant = await this.prisma.tenant.create({
      data: {
        name: `${email}-tenant`,
        users: {
          create: { email, password: hash },
        },
      },
      include: { users: true },
    });

    /* ② ログイン用レスポンス */
    const user = tenant.users[0];
    const { password, ...result } = user;
    return result;
  }

  /* ───── ウォレット接続 ───── */
  async connectWallet(userId: string, dto: ConnectWalletInput) {
    const { address, signature, chainType } = dto;

    /* 署名検証 */
    const signer = ethers.utils.verifyMessage(address, signature);
    if (signer.toLowerCase() !== address.toLowerCase()) {
      throw new UnauthorizedException('Signature mismatch');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    /* ウォレット Upsert */
    await this.prisma.wallet.upsert({
      where: { address },
      create: {
        address,
        chainId: chainType,
        userId: user.id,
        tenantId: user.tenantId,
      },
      update: { userId: user.id, chainId: chainType },
    });
  }
}
