import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class User {
  @Field()
  id!: string;

  @Field(() => [String], { nullable: true })
  walletAddresses?: string[];

  @Field({ nullable: true })
  role?: string;
}
