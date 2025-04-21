import { registerEnumType } from '@nestjs/graphql';

export enum Plan {
  STARTER     = 'STARTER',
  BUSINESS    = 'BUSINESS',
  ENTERPRISE  = 'ENTERPRISE',
}

/* ★ GraphQL Enum として公開 */
registerEnumType(Plan, {
  name: 'Plan',             // GraphQL 上の名前
  description: 'Subscription plan',
});
