/* eslint-disable camelcase */
import { Variable } from 'rdflib';
import { Quad_Predicate } from 'rdflib/lib/tf-types';
import OSLCResource from './OSLCResource';

/**
 * Encapsulates a Jazz rootservices document as in-memroy RDF knowledge base
 *
 * @class
 * @extends OSLCResource
 */
class RootServices extends OSLCResource {
  /**
   * Get the URI for the Service Provider Catalog.
   *
   * @param serviceProvider - The domain of the service provider catalog you want to get
   * @returns The service provider catalog URI
   */
  getServiceProviderCatalogUri(serviceProvider: Quad_Predicate) {
    const catalog = this.kb.the(this.id, serviceProvider) as Variable | null;
    return catalog?.uri;
  }
}

export default RootServices;
