import got, { Got, Options, Response } from 'got';
import url from 'url';
import { AgentOptions, Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import { CookieJar } from 'tough-cookie';
import ProxyAgent from 'proxy-agent';
import { RequestType, ResponseType } from './types';

/**
 * The HTTP request client to communicate with OSLC Server
 *
 * @class
 */
class OSLCRequest {
  /**
   * An instance of HTTP request client
   */
  gotInstance: Got;

  /**
   * A 🍪 jar containing the cookies for the domain
   */
  cookieJar: CookieJar;

  /**
   * Username credential for the domain
   */
  username: string;

  /**
   * Password credential for the domain
   */
  password: string;

  /**
   * (Optional) Proxy URL to connect to the server
   */
  proxyUrl: string | undefined;

  /**
   * (Optional) Network interface IP to bind for network connections.
   * Generally needed when connecting through a VPN. Set the VPN interface IP.
   */
  networkInterface: string | undefined;

  /**
   * Constructs an instance of the `Got` and `CookieJar`
   * and assigns it to `this.gotInstance` and `this.cookieJar`
   *
   * @constructor
   */
  constructor(username: string, password: string, proxyUrl?: string, networkInterface?: string) {
    this.cookieJar = new CookieJar();
    this.gotInstance = got.extend(this.getInitialGotOptions());
    this.username = username;
    this.password = password;
    this.proxyUrl = proxyUrl;
    this.networkInterface = networkInterface;
  }

  /**
   * Extend the HTTP GET method to respond to IBM ELM apps authentication requests.
   *
   * @param requestOptions - Options object for the request
   */
  public async ibmElmAuthGet<T extends RequestType>(requestOptions: T): Promise<Response<ResponseType<T>>> {
    try {
      const { requestType } = requestOptions;
      const options = {
        ...requestOptions,
        responseType: 'text',
      };

      switch (requestType) {
        case 'OSLC':
          options.headers = {
            Accept: 'application/rdf+xml',
            'OSLC-Core-Version': '2.0',
            'Content-Type': 'application/x-www-form-urlencoded',
          };
          break;
        case 'REST':
          options.headers = {
            Accept: 'application/xml',
            'Content-Type': 'application/x-www-form-urlencoded',
          };
          break;
        case 'RESTJSON':
          options.headers = {
            Accept: 'text/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          };
          break;
        case 'IMAGE':
          options.headers = {
            Accept: 'image/jpeg,image/png',
          };
          options.responseType = 'buffer';
          break;
        default:
          throw new Error('requestType not provided properly in the requestOptions object. Request not completed.');
      }

      if (typeof options.url === 'string') {
        options.url = new URL(options.url);
      }

      let response: Response<ResponseType<T>>;
      if (options.url) {
        response = (await this.gotInstance(options)) as Response<ResponseType<T>>;
        if (response && response.headers['x-com-ibm-team-repository-web-auth-msg'] === 'authrequired') {
          const authResponse = await this.ibmElmFormLogin(options);
          if (authResponse.headers['x-com-ibm-team-repository-web-auth-msg'] === 'authfailed') {
            throw new Error(`401 : Authentication failed while requesting: ${options.url.href}`);
          } else {
            response = (await this.gotInstance(options)) as Response<ResponseType<T>>;
          }
        } else if (response && response.headers['www-authenticate']) {
          options.method = 'GET';
          options.username = this.username;
          options.password = this.password;
          response = (await this.gotInstance(options)) as Response<ResponseType<T>>;
        }
      } else {
        return Promise.reject(new Error('requestUri is undefined. Request not completed.'));
      }
      return Promise.resolve(response);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * JEE Form base authentication for IBM ELM applications
   *
   * @param authOptions - Options for request
   */
  public async ibmElmFormLogin<T extends RequestType>(authOptions: T): Promise<Response<ResponseType<T>>> {
    try {
      const options = { ...authOptions };
      if (typeof options.url === 'string') {
        options.url = new URL(options.url);
      }
      const hrefWOParams = `${options.url.origin}/${options.url.pathname.split('/')[1]}/auth/authrequired`;
      options.method = 'POST';
      options.headers = {
        ...options.headers,
        Accept: 'text/html',
      };
      options.body = `j_username=${encodeURIComponent(this.username)}&j_password=${encodeURIComponent(this.password)}`;
      const loginUrlStr = `${hrefWOParams}/j_security_check`;
      options.url = new URL(loginUrlStr);
      const response = (await this.gotInstance(options)) as Response<ResponseType<T>>;
      return Promise.resolve(response);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Create initial options for got instance
   */
  private getInitialGotOptions() {
    const defaultOptions: Options = {
      agent: {
        http: this.getAgent('http'),
        https: this.getAgent('https') as HttpsAgent,
      },
      cookieJar: this.cookieJar,
      followRedirect: true,
      https: {
        rejectUnauthorized: false,
      },
      throwHttpErrors: false,
    };
    return defaultOptions;
  }

  /**
   * Get an agent for HTTP/HTTPS connection depending on the configuration
   *
   * @param type 'http' or 'https'
   * @returns An agent depending on the configuration
   */
  private getAgent(type: string) : HttpAgent | HttpsAgent {
    const httpAgentOptions: AgentOptions = {
      keepAlive: true,
      keepAliveMsecs: 1000,
      maxFreeSockets: 32,
      maxSockets: 256,
      timeout: 180000,
      localAddress: this.networkInterface,
    };

    if (this.proxyUrl) {
      const proxyObj = url.parse('socks5h://localhost:15649');
      return new ProxyAgent({ ...httpAgentOptions, ...proxyObj });
    }
    if (type === 'http') {
      return new HttpAgent(httpAgentOptions);
    }
    return new HttpsAgent(httpAgentOptions);
  }
}

export default OSLCRequest;
