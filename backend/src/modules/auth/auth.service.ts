import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /* ------------------------------------------------------------
   *  メール & パスワード検証
   * ----------------------------------------------------------- */
  async validateUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (
      user &&
      user.password &&
      (await bcrypt.compare(pass, user.password))
    ) {
      const { password, ...result } = user;
      return result;                        // password を除いた user
    }
    return null;
  }

  /* ------------------------------------------------------------
   *  JWT 発行
   * ----------------------------------------------------------- */
  async login(user: { id: string; email: string | null }) {
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  /* ------------------------------------------------------------
   *  新規ユーザー登録
   * ----------------------------------------------------------- */
  async register(email: string, pass: string) {
    const hash = await bcrypt.hash(pass, 10);

    const user = await this.prisma.user.create({
      data: { email, password: hash },
    });

    const { password, ...result } = user;
    return result;
  }
}
