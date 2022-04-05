import { IndexedFormula, parse } from 'rdflib';
import { NamedNode } from 'rdflib/lib/tf-types';
import OSLCRequest from './OSLCRequest';
import OSLCResource from './OSLCResource';
import Compact from './Compact';
import OSLCError from './OSLCError';
import Namespaces from './namespaces';
import RootServices from './RootServices';
import ServiceProviderCatalog from './ServiceProviderCatalog';
import ServiceProvider from './ServiceProvider';

/**
 * OSLCServer is he root of a JavaScript Node.js API for accessing OSLC resources.
 * It provides a convenient JavaScript interface to OSLC REST services. This function
 * constructs a generic OSLC server that can be used on any OSLC domain.
 *
 * @class
 */
class OSLCServer {
  /** The URI of the OSLC server being accessed */
  serverURI: string;

  /** The user name or authentication ID of the user */
  username: string;

  /** The user's password credentials */
  password: string;

  /** The Jazz rootservices document */
  rootServices: RootServices | undefined;

  /** The server's service provider catalog */
  serviceProviderCatalog: ServiceProviderCatalog | undefined;

  /** the project area name that user wants to access */
  serviceProviderTitle: string | undefined;

  /** A service provider describing available services */
  serviceProvider: ServiceProvider | undefined;

  /** Instance of the HTTP request client */
  request: OSLCRequest;

  /**
   * Construct a OSLCServer object
   *
   * @param serverURI - The server URI
   * @param username - User name or authentication ID of the user
   * @param password - User's password credentials
   */
  constructor(serverURI: string, username: string, password: string) {
    this.serverURI = serverURI;
    this.username = username;
    this.password = password;
    this.request = new OSLCRequest(username, password);
  }

  /**
   * Connect to the server with the given credentials
   */
  async connect(serviceProvider: NamedNode) {
    try {
      const { read, serverURI } = this;
      const rootServices = await read(`${serverURI}/rootservices`);
      this.rootServices = new RootServices(rootServices.id.value, rootServices.kb);
      // read the ServiceProviderCatalog, this does require authentication
      const catalogUri = this.rootServices.getServiceProviderCatalogUri(serviceProvider);
      if (catalogUri) {
        const catalog = await read(catalogUri);
        this.serviceProviderCatalog = new ServiceProviderCatalog(catalog.id.value, catalog.kb);
        Promise.resolve();
      } else {
        throw new OSLCError(`Service Provider Catalog URI could not be resolved for: ${serviceProvider.value}`, 404);
      }
    } catch (err) {
      OSLCServer.handleError(err);
    }
  }

  /**
   * Read or GET all the properties of a specific OSLC resource, An error is returned
   * if the resource doesn't exists.
   *
   * @param resourceUri - The URI of the resource to read.
   */
  async read(resourceUri: string | URL) {
    try {
      const { request } = this;
      const uri = typeof resourceUri === 'string' ? new URL(resourceUri) : resourceUri;

      const response = await request.ibmElmAuthGet({
        url: uri,
        requestType: 'OSLC',
      });

      if (response.headers['x-com-ibm-team-repository-web-auth-msg'] === 'authfailed' || response.statusCode === 401) {
        return Promise.reject(new OSLCError(`Authentication failed while requesting URL: ${uri}`, 401));
      }
      if (response.statusCode !== 200) {
        return Promise.reject(new OSLCError(`Could not read resource with URI: ${uri}. Status: ${response.statusCode}`, response.statusCode));
      }

      const { body } = response;

      const kb = new IndexedFormula();
      parse(body, kb, uri.href, 'application/rdf+xml');

      let results: Compact | OSLCResource;
      if (response.headers['content-type'] && response.headers['content-type'].startsWith('application/x-oslc-compact+xml')) {
        results = new Compact(uri.href, kb);
      } else {
        results = new OSLCResource(uri.href, kb, response.headers.etag);
      }
      return Promise.resolve(results);
    } catch (err) {
      return OSLCServer.handleError(err);
    }
  }

  private static handleError(err: unknown) {
    if (err instanceof OSLCError) {
      return Promise.reject(err);
    } if (err instanceof Error) {
      return Promise.reject(new OSLCError(err.message, 500, err.stack));
    }
    return Promise.reject(new OSLCError(err as string, 500));
  }
}

export default OSLCServer;
