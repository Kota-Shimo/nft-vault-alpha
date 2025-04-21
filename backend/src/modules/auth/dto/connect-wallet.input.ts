import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ConnectWalletInput {
  @Field() address!: string;     // 0x...
  @Field() signature!: string;   // personal_sign の結果
  @Field() chainType!: string;   // "EVM" | "APTOS" などチェーン識別子
}
