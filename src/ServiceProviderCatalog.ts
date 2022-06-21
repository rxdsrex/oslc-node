import {
  IndexedFormula, Literal, NamedNode, Variable,
} from 'rdflib';
import { ServiceProviderDetails } from './types';
import Namespaces from './namespaces';
import OSLCResource from './OSLCResource';

/**
 * Encapsulates a OSLC ServiceProviderCatalog resource as in-memroy RDF knowledge base
 * @class
 * @extends OSLCResource
 */
class ServiceProviderCatalog extends OSLCResource {
  /** The RDF:XMLLiteral NamedNode to use as Object */
  xmlLiteral: NamedNode;

  /**
   * Initializes this Service Provider Catalog Resource
   * @constructor
   * @param uri - URI of the Resource
   * @param kb - Parsed RDF resource
   */
  constructor(uri: string, kb: IndexedFormula) {
    super(uri, kb);
    this.xmlLiteral = this.kb.sym(Namespaces.RDF('XMLLiteral').value);
  }

  /**
   * Get the ServiceProvider with the given service provider name. This will also load all the
   * services for that service provider so they are available for use.
   *
   * @param serviceProviderTitle - The dcterms:title of the service provider
   * (e.g., an RTC project area)
   * @returns The ServiceProvider URL had been populated with Services
   */
  serviceProvider(serviceProviderTitle: string) {
    let sp: Variable[] | null = [];
    sp = this.kb.each(
      undefined,
      Namespaces.DCTERMS('title'),
      new Literal(serviceProviderTitle, null, this.xmlLiteral),
    ) as Variable[] | null;
    if (sp && !sp.length) {
      sp = this.kb.each(undefined, Namespaces.DCTERMS('title'), new Literal(serviceProviderTitle)) as Variable[] | null;
    }
    if (sp && !sp.length) {
      return null;
    }
    return sp ? sp[0]?.uri : null;
  }

  getServiceProvidersList() {
    const serviceProvidersList: ServiceProviderDetails[] = [];
    const serviceProviders = this.kb.each(undefined, undefined, Namespaces.OSLC('ServiceProvider'));
    if (serviceProviders && serviceProviders.length > 0) {
      for (const serviceProvider of serviceProviders) {
        const titleNode = this.kb.the(serviceProvider as NamedNode, Namespaces.DCTERMS('title'));
        const detailsNode = this.kb.the(serviceProvider as NamedNode, Namespaces.OSLC('details'));
        if (titleNode && detailsNode) {
          const obj = {
            servicesUrl: serviceProvider.value,
            detailsUrl: detailsNode.value,
            serviceProviderName: titleNode.value,
          };
          serviceProvidersList.push(obj);
        }
      }
    }
    return serviceProvidersList;
  }
}

export default ServiceProviderCatalog;
