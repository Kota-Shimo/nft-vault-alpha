import {
  Resolver,
  Mutation,
  Args,
} from '@nestjs/graphql';               // GraphQL 用デコレーター

import { UnauthorizedException } from '@nestjs/common'; // ← 例外はこちら
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  /** ------------------------------------------------------------
   *  新規登録
   *  成功したら固定文字列 "Registration successful" を返す
   * ----------------------------------------------------------- */
  @Mutation(() => String)
  async register(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<string> {
    await this.authService.register(email, password);
    return 'Registration successful';
  }

  /** ------------------------------------------------------------
   *  ログイン
   *  成功したら JWT アクセストークン文字列を返す
   * ----------------------------------------------------------- */
  @Mutation(() => String)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<string> {
    /* メアド＆パスワード検証 */
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    /* JWT 発行（email は null の可能性があるため “!” で断言）*/
    const token = await this.authService.login({
      id: user.id,
      email: user.email!,        // ← null を許容した上で non‑null 断言
    });

    return token.accessToken;
  }
}
