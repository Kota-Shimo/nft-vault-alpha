import { InputType, Field, ObjectType } from "@nestjs/graphql";
import { User } from "../../user/dto/user.dto";

@InputType()
export class WalletConnectInput {
  @Field()
  walletAddress!: string;

  @Field()
  signature!: string;

  @Field()
  chainType!: string;
}

@ObjectType()
export class AuthPayload {
  @Field()
  token!: string;

  @Field(() => User)
  user!: User;
}
