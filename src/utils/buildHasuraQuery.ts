export type HasuraQuery =
  | HasuraCustomQueryDef
  | HasuraQueryDef
  | HasuraMutationDef;
type HasuraOrderByDirection =
  | 'ASC'
  | 'ASC_NULLS_LAST'
  | 'ASC_NULLS_FIRST'
  | 'DESC'
  | 'DESC_NULLS_LAST'
  | 'DESC_NULLS_FIRST';
type HasuraOrderBy = Record<string, HasuraOrderByDirection>;

type HasuraCustomQueryDef = {
  type: 'custom';
  query: string;
  variables: Record<string, any>;
};

type HasuraQueryDef = {
  type?: 'query' | 'subscription';
  source: string;
  selection: string | string[];
  where?: Record<string, any>;
  orderBy?: HasuraOrderBy | HasuraOrderBy[];
  distinctOn?: string[];
  offset?: number;
  limit?: number;
  aggregation?: boolean;
};

type HasuraMutationDef = {
  type: 'mutation';
  source: string;
  selection?: string;
} & (
  | HasuraMutationUpdateDef
  | HasuraMutationInsertDef
  | HasuraMutationInsertOneDef
);

type HasuraMutationUpdateDef = {
  action: 'update';
  where?: Record<string, any>;
  set?: Record<string, any>;
  inc?: Record<string, number>;
};

type HasuraMutationInsertDef = {
  action: 'insert';
  items: Record<string, any>[];
};

type HasuraMutationInsertOneDef = {
  action: 'insertOne';
  item: Record<string, any>;
};

type ResultHasuraQuery = {
  query: string;
  variables?: Record<string, any>;
  extractResult?: (data: any) => any;
};

export function buildHasuraQuery(query: HasuraQuery): ResultHasuraQuery {
  if (query.type === 'custom') {
    return { query: query.query, variables: query.variables };
  }

  const { source } = query;
  const Source = query.source.charAt(0).toUpperCase() + query.source.slice(1);

  if (!query.type || query.type === 'query' || query.type === 'subscription') {
    return {
      query: `${
        query.type || 'query'
      } Query${Source}($where: ${Source}BoolExp, $orderBy: [${Source}OrderBy!], $offset: Int, $limit: Int, $distinctOn: [${Source}SelectColumn!]) {
        data: ${
          query.aggregation ? `${source}Aggregate` : source
        }(where: $where, orderBy: $orderBy, offset: $offset, limit: $limit, distinctOn: $distinctOn) {
          ${
            typeof query.selection === 'string'
              ? query.selection
              : query.selection.join(' ')
          }
        }
      }`
        .replace(/\n/g, ' ')
        .replace(/ +/g, ' ')
        .trim(),
      variables: {
        where: query.where,
        orderBy: query.orderBy,
        offset: query.offset,
        limit: query.limit,
        distinctOn: query.distinctOn,
      },
      extractResult: (data) => data.data,
    };
  }

  if (query.type === 'mutation' && query.action === 'update') {
    return {
      query: `mutation Update${Source}($where: ${Source}BoolExp!${
        query.set ? `, $set: ${Source}SetInput` : ''
      }${query.inc ? `, $inc: ${Source}IncInput` : ''}) {
        data: update${Source}(where: $where${query.set ? ', _set: $set' : ''}${
        query.inc ? ', _inc: $inc' : ''
      }) {
          ${query.selection || '__typename'}
        }
      }`
        .replace(/\n/g, ' ')
        .replace(/ +/g, ' ')
        .trim(),
      variables: {
        where: query.where,
        set: query.set,
        inc: query.inc,
      },
      extractResult: (data) => data.data,
    };
  }

  if (query.type === 'mutation' && query.action === 'insert') {
    return {
      query: `mutation Insert${Source}($insert: [${Source}InsertInput!]!) {
        data: insert${Source}(objects: $insert) {
          ${query.selection || '__typename'}
        }
      }`
        .replace(/\n/g, ' ')
        .replace(/ +/g, ' ')
        .trim(),
      variables: {
        insert: query.items,
      },
      extractResult: (data) => data.data,
    };
  }

  if (query.type === 'mutation' && query.action === 'insertOne') {
    return {
      query: `mutation InsertOne${Source}($insert: ${Source}InsertInput!) {
        data: insert${Source}One(object: $insert) {
          ${query.selection || '__typename'}
        }
      }`
        .replace(/\n/g, ' ')
        .replace(/ +/g, ' ')
        .trim(),
      variables: {
        insert: query.item,
      },
      extractResult: (data) => data.data,
    };
  }

  throw new Error('Not implemented');
}
