import OSLCRequest from 'OSLCRequest';
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
}

export default OSLCServer;
