// backend/src/modules/auth/strategies/jwt.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'CHANGE_ME',
    });
  }

  // ★ tenantId を返すようにする ―――――――――――――――――――――――――――――――
  async validate(payload: any) {
    return {
      userId:   payload.sub,
      email:    payload.email,
      tenantId: payload.tenantId,   // ← これを追加
    };
  }
}
