import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { User } from "../../user/dto/user.dto";

@ObjectType()
export class NftItem {
  @Field()
  id!: string;

  @Field({ nullable: true })
  title?: string;

  @Field()
  chainType!: string;

  @Field()
  metadataHash!: string;

  @Field(() => User, { nullable: true })
  owner?: User;

  @Field()
  isForSale!: boolean;

  @Field({ nullable: true })
  price?: number;
}

@InputType()
export class MintNftInput {
  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field()
  imageBase64!: string;
}

@InputType()
export class ListForSaleInput {
  @Field()
  nftId!: string;

  @Field(() => Int)
  price!: number;
}

@InputType()
export class BuyNftInput {
  @Field()
  nftId!: string;
}
