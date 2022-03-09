/* eslint-disable camelcase */
import { Quad_Object, Quad_Subject } from 'rdflib/lib/tf-types';
import Namespaces from './namespaces';
import OSLCResource from './OSLCResource';

class ServiceProvider extends OSLCResource {
  /**
   * Get the queryBase URL for an OSLC QueryCapability with the given oslc:resourceType
   *
   * @param resourceType - The type of resource to be queried
   * @returns The queryBase URL used to query resources of that type
   */
  queryBase(resourceType: string | Quad_Object) {
    const resourceTypeSym = typeof resourceType === 'string' ? this.kb.sym(resourceType) : resourceType;
    const services = this.kb.each(this.id, Namespaces.OSLC('service'));
    for (const service of services) {
      const queryCapabilities = this.kb.each(service as Quad_Subject, Namespaces.OSLC('queryCapability'));
      for (const queryCapability of queryCapabilities) {
        if (this.kb.statementsMatching(queryCapability as Quad_Subject, Namespaces.OSLC('resourceType'), resourceTypeSym).length) {
          return this.kb.the(queryCapability as Quad_Subject, Namespaces.OSLC('queryBase'))?.value;
        }
      }
    }
    return null;
  }

  /**
   * Get the creation URL for an OSLC CreationFactory with the given oslc:resourceType
   *
   * @param resourceType - The type of resource to be created
   * @returns The creation URL used to create resources of that type
   */
  creationFactory(resourceType: string | Quad_Object) {
    const resourceTypeSym = typeof resourceType === 'string' ? this.kb.sym(resourceType) : resourceType;
    const services = this.kb.each(this.id, Namespaces.OSLC('service'));
    for (const service of services) {
      const creationFactories = this.kb.each(service as Quad_Subject, Namespaces.OSLC('creationFactory'));
      for (const creationFactory of creationFactories) {
        if (this.kb.statementsMatching(creationFactory as Quad_Subject, Namespaces.OSLC('resourceType'), resourceTypeSym).length === 1) {
          return this.kb.the(creationFactory as Quad_Subject, Namespaces.OSLC('creation'))?.value;
        }
      }
    }
    return null;
  }
}

export default ServiceProvider;
