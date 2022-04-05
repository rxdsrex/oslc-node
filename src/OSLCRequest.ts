import got, { Got, Options, Response } from 'got';
import { Agent as HttpAgent, AgentOptions } from 'http';
import { Agent as HttpsAgent } from 'https';
import { CookieJar } from 'tough-cookie';

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
   * Constructs an instance of the `Got` and `CookieJar`
   * and assigns it to `this.gotInstance` and `this.cookieJar`
   *
   * @constructor
   */
  constructor(username: string, password: string) {
    this.cookieJar = new CookieJar();
    this.gotInstance = got.extend(this.getInitialGotOptions());
    this.username = username;
    this.password = password;
  }

  /**
   * Extend the HTTP GET method to respond to IBM ELM apps authentication requests.
   *
   * @param requestOptions - Options object for the request
   */
  public async ibmElmAuthGet<T extends RequestType>(requestOptions: T):
    Promise<Response<ResponseType<T>>> {
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
        response = await this.gotInstance(options) as Response<ResponseType<T>>;
        if (response && response.headers['x-com-ibm-team-repository-web-auth-msg'] === 'authrequired') {
          const authResponse = await this.ibmElmFormLogin(options);
          if (authResponse.headers['x-com-ibm-team-repository-web-auth-msg'] === 'authfailed') {
            throw new Error(`401 : Authentication failed while requesting: ${options.url.href}`);
          } else {
            response = await this.gotInstance(options) as Response<ResponseType<T>>;
          }
        } else if (response && response.headers['www-authenticate']) {
          options.method = 'GET';
          options.username = this.username;
          options.password = this.password;
          response = await this.gotInstance(options) as Response<ResponseType<T>>;
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
  public async ibmElmFormLogin<T extends RequestType>(authOptions: T):
    Promise<Response<ResponseType<T>>> {
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
      const response = await this.gotInstance(options) as Response<ResponseType<T>>;
      return Promise.resolve(response);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Create initial options for got instance
   */
  private getInitialGotOptions() {
    const httpAgentOptions: AgentOptions = {
      keepAlive: true,
      keepAliveMsecs: 1000,
      maxFreeSockets: 32,
      maxSockets: 256,
      timeout: 180000,
    };
    const defaultOptions: Options = {
      agent: {
        http: new HttpAgent(httpAgentOptions),
        https: new HttpsAgent(httpAgentOptions),
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
}

export default OSLCRequest;
