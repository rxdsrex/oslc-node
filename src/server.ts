import OSLCError from './OSLCError';
import Namespaces from './namespaces';

class OSLCServer {
  serverURI: string;

  username: string;

  password: string;

  // rootservices: null;

  // serviceProviderCatalog: null;

  // serviceProviderTitle: null;

  // serviceProvider: null;

  constructor(serverURI: string, username: string, password: string) {
    this.serverURI = serverURI;
    this.username = username;
    this.password = password;
  }
}

export default OSLCServer;
