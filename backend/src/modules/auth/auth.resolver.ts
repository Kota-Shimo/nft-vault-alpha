import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { UnauthorizedException, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { ConnectWalletInput } from './dto/connect-wallet.input';
import { GqlJwtAuthGuard } from '../../guards/gql-auth.guard';
import { Public } from '../../common/public.decorator';       // ★ 追加

@Resolver()
export class AuthResolver {
  constructor(private readonly authSvc: AuthService) {}

  /* ───── 新規登録 ───── */
  @Mutation(() => String)
  @Public()                                                   // ★ Guard を完全スキップ
  async register(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<string> {
    await this.authSvc.register(email, password);
    return 'Registration successful';
  }

  /* ───── ログイン ───── */
  @Mutation(() => String)
  @Public()                                                   // ★ Guard を完全スキップ
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<string> {
    const user = await this.authSvc.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    /* tenantId を含めて JWT を発行 */
    const token = await this.authSvc.login({
      id: user.id,
      email: user.email!,
      tenantId: user.tenantId ?? null,
    });
    return token.accessToken;
  }

  /* ───── ウォレット接続 ───── */
  @UseGuards(GqlJwtAuthGuard)                                 // 認証が必要
  @Mutation(() => Boolean)
  async connectWallet(
    @Args('input') input: ConnectWalletInput,
    @Context() ctx: any,
  ): Promise<boolean> {
    const uid: string | undefined = ctx.req.user?.sub;
    if (!uid) throw new UnauthorizedException();
    await this.authSvc.connectWallet(uid, input);
    return true;
  }
}
