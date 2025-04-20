import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../../prisma.module';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { GqlLocalAuthGuard, GqlJwtAuthGuard } from './gql-auth.guard';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'CHANGE_ME',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '3600s' },
    }),
  ],
  providers: [
    AuthService,
    AuthResolver,
    LocalStrategy,
    JwtStrategy,
    GqlLocalAuthGuard,
    GqlJwtAuthGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
