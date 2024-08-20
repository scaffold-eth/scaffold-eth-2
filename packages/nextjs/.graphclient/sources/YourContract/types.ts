// @ts-nocheck

import { InContextSdkMethod } from '@graphql-mesh/types';
import { MeshContext } from '@graphql-mesh/runtime';

export namespace YourContractTypes {
  export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigDecimal: { input: any; output: any; }
  BigInt: { input: any; output: any; }
  Bytes: { input: any; output: any; }
  Int8: { input: any; output: any; }
};

export type BlockChangedFilter = {
  number_gte: Scalars['Int']['input'];
};

export type Block_height = {
  hash?: InputMaybe<Scalars['Bytes']['input']>;
  number?: InputMaybe<Scalars['Int']['input']>;
  number_gte?: InputMaybe<Scalars['Int']['input']>;
};

export type Greeting = {
  id: Scalars['ID']['output'];
  sender: Sender;
  greeting: Scalars['String']['output'];
  premium?: Maybe<Scalars['Boolean']['output']>;
  value?: Maybe<Scalars['BigInt']['output']>;
  createdAt: Scalars['BigInt']['output'];
  transactionHash: Scalars['String']['output'];
};

export type Greeting_filter = {
  id?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  sender?: InputMaybe<Scalars['String']['input']>;
  sender_not?: InputMaybe<Scalars['String']['input']>;
  sender_gt?: InputMaybe<Scalars['String']['input']>;
  sender_lt?: InputMaybe<Scalars['String']['input']>;
  sender_gte?: InputMaybe<Scalars['String']['input']>;
  sender_lte?: InputMaybe<Scalars['String']['input']>;
  sender_in?: InputMaybe<Array<Scalars['String']['input']>>;
  sender_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  sender_contains?: InputMaybe<Scalars['String']['input']>;
  sender_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  sender_not_contains?: InputMaybe<Scalars['String']['input']>;
  sender_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  sender_starts_with?: InputMaybe<Scalars['String']['input']>;
  sender_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  sender_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  sender_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  sender_ends_with?: InputMaybe<Scalars['String']['input']>;
  sender_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  sender_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  sender_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  sender_?: InputMaybe<Sender_filter>;
  greeting?: InputMaybe<Scalars['String']['input']>;
  greeting_not?: InputMaybe<Scalars['String']['input']>;
  greeting_gt?: InputMaybe<Scalars['String']['input']>;
  greeting_lt?: InputMaybe<Scalars['String']['input']>;
  greeting_gte?: InputMaybe<Scalars['String']['input']>;
  greeting_lte?: InputMaybe<Scalars['String']['input']>;
  greeting_in?: InputMaybe<Array<Scalars['String']['input']>>;
  greeting_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  greeting_contains?: InputMaybe<Scalars['String']['input']>;
  greeting_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  greeting_not_contains?: InputMaybe<Scalars['String']['input']>;
  greeting_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  greeting_starts_with?: InputMaybe<Scalars['String']['input']>;
  greeting_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  greeting_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  greeting_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  greeting_ends_with?: InputMaybe<Scalars['String']['input']>;
  greeting_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  greeting_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  greeting_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  premium?: InputMaybe<Scalars['Boolean']['input']>;
  premium_not?: InputMaybe<Scalars['Boolean']['input']>;
  premium_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  premium_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  value?: InputMaybe<Scalars['BigInt']['input']>;
  value_not?: InputMaybe<Scalars['BigInt']['input']>;
  value_gt?: InputMaybe<Scalars['BigInt']['input']>;
  value_lt?: InputMaybe<Scalars['BigInt']['input']>;
  value_gte?: InputMaybe<Scalars['BigInt']['input']>;
  value_lte?: InputMaybe<Scalars['BigInt']['input']>;
  value_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  value_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  transactionHash?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not?: InputMaybe<Scalars['String']['input']>;
  transactionHash_gt?: InputMaybe<Scalars['String']['input']>;
  transactionHash_lt?: InputMaybe<Scalars['String']['input']>;
  transactionHash_gte?: InputMaybe<Scalars['String']['input']>;
  transactionHash_lte?: InputMaybe<Scalars['String']['input']>;
  transactionHash_in?: InputMaybe<Array<Scalars['String']['input']>>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  transactionHash_contains?: InputMaybe<Scalars['String']['input']>;
  transactionHash_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_contains?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  transactionHash_starts_with?: InputMaybe<Scalars['String']['input']>;
  transactionHash_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  transactionHash_ends_with?: InputMaybe<Scalars['String']['input']>;
  transactionHash_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Greeting_filter>>>;
  or?: InputMaybe<Array<InputMaybe<Greeting_filter>>>;
};

export type Greeting_orderBy =
  | 'id'
  | 'sender'
  | 'sender__id'
  | 'sender__address'
  | 'sender__createdAt'
  | 'sender__greetingCount'
  | 'greeting'
  | 'premium'
  | 'value'
  | 'createdAt'
  | 'transactionHash';

/** Defines the order direction, either ascending or descending */
export type OrderDirection =
  | 'asc'
  | 'desc';

export type Query = {
  greeting?: Maybe<Greeting>;
  greetings: Array<Greeting>;
  sender?: Maybe<Sender>;
  senders: Array<Sender>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};


export type QuerygreetingArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerygreetingsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Greeting_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Greeting_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerysenderArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerysendersArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Sender_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Sender_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type Query_metaArgs = {
  block?: InputMaybe<Block_height>;
};

export type Sender = {
  id: Scalars['ID']['output'];
  address: Scalars['Bytes']['output'];
  greetings?: Maybe<Array<Greeting>>;
  createdAt: Scalars['BigInt']['output'];
  greetingCount: Scalars['BigInt']['output'];
};


export type SendergreetingsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Greeting_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Greeting_filter>;
};

export type Sender_filter = {
  id?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  address?: InputMaybe<Scalars['Bytes']['input']>;
  address_not?: InputMaybe<Scalars['Bytes']['input']>;
  address_gt?: InputMaybe<Scalars['Bytes']['input']>;
  address_lt?: InputMaybe<Scalars['Bytes']['input']>;
  address_gte?: InputMaybe<Scalars['Bytes']['input']>;
  address_lte?: InputMaybe<Scalars['Bytes']['input']>;
  address_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  address_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  address_contains?: InputMaybe<Scalars['Bytes']['input']>;
  address_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  greetings_?: InputMaybe<Greeting_filter>;
  createdAt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  greetingCount?: InputMaybe<Scalars['BigInt']['input']>;
  greetingCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  greetingCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  greetingCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  greetingCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  greetingCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  greetingCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  greetingCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Sender_filter>>>;
  or?: InputMaybe<Array<InputMaybe<Sender_filter>>>;
};

export type Sender_orderBy =
  | 'id'
  | 'address'
  | 'greetings'
  | 'createdAt'
  | 'greetingCount';

export type Subscription = {
  greeting?: Maybe<Greeting>;
  greetings: Array<Greeting>;
  sender?: Maybe<Sender>;
  senders: Array<Sender>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};


export type SubscriptiongreetingArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptiongreetingsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Greeting_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Greeting_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionsenderArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionsendersArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Sender_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Sender_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type Subscription_metaArgs = {
  block?: InputMaybe<Block_height>;
};

export type _Block_ = {
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']['output']>;
  /** The block number */
  number: Scalars['Int']['output'];
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']['output']>;
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   *
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String']['output'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean']['output'];
};

export type _SubgraphErrorPolicy_ =
  /** Data will be returned even if the subgraph has indexing errors */
  | 'allow'
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  | 'deny';

  export type QuerySdk = {
      /** null **/
  greeting: InContextSdkMethod<Query['greeting'], QuerygreetingArgs, MeshContext>,
  /** null **/
  greetings: InContextSdkMethod<Query['greetings'], QuerygreetingsArgs, MeshContext>,
  /** null **/
  sender: InContextSdkMethod<Query['sender'], QuerysenderArgs, MeshContext>,
  /** null **/
  senders: InContextSdkMethod<Query['senders'], QuerysendersArgs, MeshContext>,
  /** Access to subgraph metadata **/
  _meta: InContextSdkMethod<Query['_meta'], Query_metaArgs, MeshContext>
  };

  export type MutationSdk = {
    
  };

  export type SubscriptionSdk = {
      /** null **/
  greeting: InContextSdkMethod<Subscription['greeting'], SubscriptiongreetingArgs, MeshContext>,
  /** null **/
  greetings: InContextSdkMethod<Subscription['greetings'], SubscriptiongreetingsArgs, MeshContext>,
  /** null **/
  sender: InContextSdkMethod<Subscription['sender'], SubscriptionsenderArgs, MeshContext>,
  /** null **/
  senders: InContextSdkMethod<Subscription['senders'], SubscriptionsendersArgs, MeshContext>,
  /** Access to subgraph metadata **/
  _meta: InContextSdkMethod<Subscription['_meta'], Subscription_metaArgs, MeshContext>
  };

  export type Context = {
      ["YourContract"]: { Query: QuerySdk, Mutation: MutationSdk, Subscription: SubscriptionSdk },
      
    };
}
