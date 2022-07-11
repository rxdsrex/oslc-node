import { IndexedFormula, parse } from 'rdflib';
import {
  NamedNode, Quad_Object as QuadObject, Quad_Predicate as QuadPredicate, Quad_Subject as QuadSubject,
} from 'rdflib/lib/tf-types';
import { urlJoin } from './utils';
import OSLCRequest from './OSLCRequest';
import OSLCResource from './OSLCResource';
import Compact from './Compact';
import OSLCError from './OSLCError';
import Namespaces from './namespaces';
import RootServices from './RootServices';
import ServiceProviderCatalog from './ServiceProviderCatalog';
import ServiceProvider from './ServiceProvider';
import { QueryOptions, QueryResponse } from './types';

/**
 * OSLCServer is he root of a JavaScript Node.js API for accessing OSLC resources.
 * It provides a convenient JavaScript interface to OSLC REST services. This function
 * constructs a generic OSLC server that can be used on any OSLC domain.
 *
 * @class
 */
class OSLCServer {
  /** The URI of the OSLC server being accessed */
  public serverURI: string;

  /** The user name or authentication ID of the user */
  public username: string;

  /** The user's password credentials */
  public password: string;

  /** The Jazz rootservices document */
  public rootServices: RootServices | undefined;

  /** The server's service provider catalog */
  public serviceProviderCatalog: ServiceProviderCatalog | undefined;

  /** the project area name that user wants to access */
  public serviceProviderTitle: string | undefined;

  /** A service provider describing available services */
  public serviceProvider: ServiceProvider | undefined;

  /** Instance of the HTTP request client */
  public request: OSLCRequest;

  /**
   * Construct a OSLCServer object
   *
   * @param serverURI - The server URI
   * @param username - User name or authentication ID of the user
   * @param password - User's password credentials
   * @param proxyUrl - (Optional) Proxy URL to connect to the server
   * @param networkInterface - (Optional) Network interface IP to bind for network connections.
   *                           Generally needed when connecting through a VPN.
   */
  public constructor(serverURI: string, username: string, password: string, proxyUrl?: string, networkInterface?: string) {
    this.serverURI = serverURI;
    this.username = username;
    this.password = password;
    this.request = new OSLCRequest(username, password, proxyUrl, networkInterface);

    // Explicitly binding 'this' to all async instance methods
    // to access 'this' inside async methods.
    this.connect = this.connect.bind(this);
    this.use = this.use.bind(this);
    this.getJazzProjectAreaId = this.getJazzProjectAreaId.bind(this);
    this.query = this.query.bind(this);
    this.read = this.read.bind(this);
    this.getServiceProvidersList = this.getServiceProvidersList.bind(this);
    this.readById = this.readById.bind(this);
  }

  /**
   * Connect to the server and set the Service Provider Catalog
   * @param serviceProviderCatalog - the rootservices oslc_*:*serviceProviders to connect to
   */
  public async connect(serviceProviderCatalog: NamedNode) {
    try {
      const { read, serverURI } = this;
      const rootServices = await read(urlJoin(serverURI, 'rootservices'));
      this.rootServices = new RootServices(rootServices.id.value, rootServices.kb);
      // read the ServiceProviderCatalog, this does require authentication
      const catalogUri = this.rootServices.getServiceProviderCatalogUri(serviceProviderCatalog);
      if (catalogUri) {
        const catalog = await read(catalogUri);
        this.serviceProviderCatalog = new ServiceProviderCatalog(catalog.id.value, catalog.kb);
      } else {
        throw new OSLCError(`Service Provider Catalog URI could not be resolved for: ${serviceProviderCatalog.value}`, 404);
      }
      return Promise.resolve();
    } catch (err) {
      return OSLCServer.handleError(err);
    }
  }

  /**
   * Set the OSLCServer context to use the given
   * ServiceProvider(e.g., project area for the jazz.net apps).
   * After this call, all the Services for the ServiceProvider are known.
   *
   * @param serviceProviderTitle - the ServiceProvider or LDP Container (e.g., project area) name
   */
  public async use(serviceProviderTitle: string) {
    try {
      this.serviceProviderTitle = serviceProviderTitle;
      const { serviceProviderCatalog, read } = this;

      if (serviceProviderCatalog) {
        // From the service provider catalog, get the service provider resource
        const serviceProviderURL = serviceProviderCatalog.serviceProvider(serviceProviderTitle);
        if (serviceProviderURL) {
          const resource = await read(serviceProviderURL);
          this.serviceProvider = new ServiceProvider(resource.id.value, resource.kb);
          return Promise.resolve();
        }
        throw new OSLCError(`Service Provider URL could not be resolved for: ${serviceProviderTitle}`, 404);
      } else {
        throw new OSLCError('serviceProviderCatalog is not initialized.'
          + ' Please call the "connect" function before calling this function.', 500);
      }
    } catch (err) {
      return OSLCServer.handleError(err);
    }
  }

  /**
   * Gets the project area ID from serviceProvider.
   * This function will yield results only if serviceProvider is set.
   * Otherwise, it will throw an OSLCError.
   */
  public async getJazzProjectAreaId() {
    try {
      const { serviceProvider } = this;
      const { OSLC } = Namespaces;
      if (serviceProvider) {
        const paDetails = serviceProvider.get(OSLC('details'));
        if (paDetails) {
          const paURL = new URL(paDetails[0]);
          const regex = /\/process\/project-areas\/(.+)$/g;
          const { pathname } = paURL;
          const matches = [...pathname.matchAll(regex)];
          if (matches.length) {
            const match = matches[0];
            if (match.length && match.length > 1) {
              return Promise.resolve(match[1]);
            }
          }
        }
        return Promise.resolve(null);
      }
      throw new OSLCError('serviceProvider is not initialized.'
        + ' Please call the "use" function before calling this function.', 500);
    } catch (err) {
      return OSLCServer.handleError(err);
    }
  }

  /**
   * Get a list of service providers (Project areas) on the server.
   *
   * @returns List of service providers (Project areas) on the server.
   */
  public async getServiceProvidersList() {
    try {
      const { serviceProviderCatalog } = this;
      if (serviceProviderCatalog) {
        const serviceProviderList = serviceProviderCatalog.getServiceProvidersList();
        return Promise.resolve(serviceProviderList);
      }
      throw new OSLCError('serviceProviderCatalog is not initialized.'
          + ' Please call the "connect" function before calling this function.', 500);
    } catch (err) {
      return OSLCServer.handleError(err);
    }
  }

  /**
   * Execute an OSLC query on server resources (e.g., ChangeRequests).
   *
   * A query with only a where clause returns a list of matching members URIs
   * A query with a select/properties clause returns the matching members and the
   * RDF representation of the resource including the selected properties.
   *
   * @param options - options for the query.
   */
  public async query<T extends QueryOptions>(options: T) : Promise<QueryResponse<T>> {
    try {
      const { request } = this;
      const { OSLC } = Namespaces;

      const queryURL = new URL(OSLCServer.getQueryURLFromOptions(options));
      const response = await request.ibmElmAuthGet({
        url: queryURL,
        requestType: 'OSLC',
      });

      if (response.headers['x-com-ibm-team-repository-web-auth-msg'] === 'authfailed' || response.statusCode === 401) {
        throw new OSLCError(`Authentication failed while requesting URL: ${queryURL.href}`, 401);
      }
      if (response.statusCode !== 200) {
        const { body } = response;
        const kb = new IndexedFormula();
        if (body.trim().length) {
          parse(body, kb, queryURL.href, 'application/rdf+xml');
          const errorMsg = kb.statementsMatching(undefined, OSLC('message')).length
            ? kb.statementsMatching(undefined, OSLC('nextPage'))[0].object.value
            : '';
          throw new OSLCError(
            `Error while executing OSLC query: ${queryURL.href}. Status: ${response.statusCode}. Error message: ${errorMsg}`,
            response.statusCode,
          );
        }
        throw new OSLCError(
          `Error while executing OSLC query: ${queryURL.href}. Status: ${response.statusCode}`,
          response.statusCode,
        );
      }

      const { body } = response;
      const kb = new IndexedFormula();
      parse(body, kb, queryURL.href, 'application/rdf+xml');

      let totalCount = -1;
      let nextPage;
      if (options.totalCount) {
        totalCount = 0;
        const totalCountStatements = kb.statementsMatching(undefined, OSLC('totalCount'));
        if (totalCountStatements.length) {
          totalCount = parseInt(totalCountStatements[0].object.value, 10);
        }
      }
      if (options.paginate) {
        nextPage = kb.statementsMatching(undefined, OSLC('nextPage')).length
          ? kb.statementsMatching(undefined, OSLC('nextPage'))[0].object.value
          : '';
      }

      const resources = [];
      // TODO: getting the members must use the discovered member predicate,
      // TODO: rdfs:member is the default
      const predicate = typeof options.what === 'string' ? kb.sym(options.what) : options.what;
      const members = kb.each(kb.sym(options.from), predicate);
      for (const member of members) {
        const memberStatements = kb.statementsMatching(member as QuadSubject, undefined, undefined);
        const memberKb = new IndexedFormula();
        memberKb.add(memberStatements);
        resources.push(new OSLCResource(member.value, memberKb));
      }

      const resolveObj = {
        resources,
        nextPage: nextPage ? undefined : nextPage,
        totalCount: totalCount > -1 ? undefined : totalCount,
      };

      return Promise.resolve(resolveObj) as Promise<QueryResponse<T>>;
    } catch (err) {
      return OSLCServer.handleError(err);
    }
  }

  /**
   * Read or GET all the properties of a specific OSLC resource, An error is returned
   * if the resource doesn't exists.
   *
   * @param resourceUri - The URI of the resource to read.
   */
  public async read(resourceUri: string | URL) {
    try {
      const uri = typeof resourceUri === 'string' ? new URL(resourceUri) : resourceUri;

      const response = await this.request.ibmElmAuthGet({
        url: uri,
        requestType: 'OSLC',
      });

      if (response.headers['x-com-ibm-team-repository-web-auth-msg'] === 'authfailed' || response.statusCode === 401) {
        throw new OSLCError(`Authentication failed while requesting URL: ${uri.href}`, 401);
      }
      if (response.statusCode !== 200) {
        throw new OSLCError(`Could not read resource with URI: ${uri.href}. Status: ${response.statusCode}`, response.statusCode);
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

  /**
   * Read a specific OSLC resource by its ID. An error is returned
   * if the resource doesn't exist
   */

  /**
   * Read a specific OSLC resource by its ID. An error is returned
   * if the resource doesn't exist.
   * (This is a convenience method combining the `query` & the `read` methods of the class)
   *
   * @param resourceType - The OSLC resource type (like `Requirement`)
   * @param resourceId - The OSLC resource ID (i.e., its dcterms:identifier value)
   * @param what - The discovered member predicate for Query. Default: `rdfs:member`
   */
  public async readById(resourceType: string | QuadObject, resourceId: number, what?: QuadPredicate | string) {
    try {
      const { query, read, serviceProvider } = this;
      if (serviceProvider) {
        const queryBase = serviceProvider.queryBase(resourceType);
        if (queryBase) {
          const queryResult = await query({
            from: queryBase,
            what: what || Namespaces.RDFS('member'),
            prefix: 'dcterms=<http://purl.org/dc/terms/>',
            where: `dcterms:identifier=${resourceId}`,
            properties: 'dcterms:identifier',
          });
          if (queryResult.resources.length) {
            const resourceUri = queryResult.resources[0].getURI();
            const resource = await read(resourceUri);
            return Promise.resolve(resource);
          }
          throw new OSLCError(`No such resource with Resource Id: ${resourceId}`, 404);
        } else {
          const resTypeStr = typeof resourceType === 'string' ? resourceType : resourceType.value;
          throw new OSLCError(`QueryBase not found for resource type: ${resTypeStr}`, 404);
        }
      }
      throw new OSLCError('serviceProvider is not initialized.'
        + ' Please call the "use" function before calling this function.', 500);
    } catch (err) {
      return OSLCServer.handleError(err);
    }
  }

  private static getQueryURLFromOptions(options: QueryOptions) {
    const queryBase = options.from;
    let queryURL = '';
    if (options.paginate && queryBase.includes('oslc.paging=true')) {
      queryURL += `?oslc.paging=true&oslc.pageSize=${options.pageSize || 512}`;
    }
    if (options.paginate && options.pageArg) {
      queryURL += queryURL.startsWith('?') || queryBase.includes('?') ? '&' : '?';
      queryURL += `${options.pageArg.key}=${options.pageArg.value}`;
    }
    if (options.prefix) {
      queryURL += queryURL.startsWith('?') || queryBase.includes('?') ? '&' : '?';
      queryURL += `oslc.prefix=${options.prefix}`;
    }
    if (options.properties) {
      queryURL += queryURL.startsWith('?') || queryBase.includes('?') ? '&' : '?';
      queryURL += `oslc.properties=${options.properties}`;
    }
    if (options.select) {
      queryURL += queryURL.startsWith('?') || queryBase.includes('?') ? '&' : '?';
      queryURL += `oslc.select=${options.select}`;
    }
    if (options.where) {
      queryURL += queryURL.startsWith('?') || queryBase.includes('?') ? '&' : '?';
      queryURL += `oslc.where=${options.where}`;
    }
    if (options.orderBy) {
      queryURL += queryURL.startsWith('?') || queryBase.includes('?') ? '&' : '?';
      queryURL += `oslc.orderBy=${options.orderBy}`;
    }
    queryURL = `${queryBase}${queryURL}`;
    return queryURL;
  }

  private static handleError(err: unknown) {
    if (err instanceof OSLCError && Object.getPrototypeOf(err) === OSLCError.prototype) {
      return Promise.reject(err);
    } if (err instanceof Error) {
      return Promise.reject(new OSLCError(err.message, 500, err.stack));
    }
    return Promise.reject(new OSLCError(err as string, 500));
  }
}

export default OSLCServer;
