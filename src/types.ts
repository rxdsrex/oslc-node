import { Options } from 'got';
import { Quad_Predicate as QPredicate } from 'rdflib/lib/tf-types';

export interface QueryOptions {
  /** The queryBase URI to use for executing the query from the service provider */
  from: string;

  /** Resource type being queried. Generally it is rdfs:member */
  what: QPredicate | string;

  /** A list of namespace prefixes and URIs to resolve prefixes in the query.
   * Eg. 'prefix=<URI>,...' */
  prefix?: string;

  /** A list of resource properties to return. Eg. 'literal:property' */
  properties?: string;

  /** A list of resource properties to return. Eg. 'literal:property' */
  select: string;

  /** What resources to return. Eg. 'property=value' */
  where?: string;

  /** What properties and order to sort the result. Eg. '+property' */
  orderBy?: string;

  /** Set to true get the number of results yielded from the query.
   * @default false */
  getCount?: boolean;

  /** Set to true to enable pagination.
   * @default false */
  paginate?: boolean;

  /** Size of each page (Application only when paginate is true) */
  pageSize?: Number;

  /** Page number of the Query results (Application only when paginate is true) */
  pageArg?: {
    key: string;
    value: Number;
  };
}

export type RequestType = {
  url: string | URL;
  requestType: 'OSLC' | 'REST' | 'RESTJSON' | 'IMAGE';
  isStream?: false;
  resolveBodyOnly?: false;
} & Options;

export type ResponseType<T> =
  T extends { requestType: 'OSLC' | 'REST' | 'RESTJSON' } ? string :
  T extends { requestType: 'IMAGE'; } ? Buffer :
  never;
