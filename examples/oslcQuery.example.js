const path = require('path');
const dotEnv = require('dotenv');
const { OSLCServer, namespaces } = require('../dist');

const envpath = path.join(__dirname, '.env');
dotEnv.config({ path: envpath });

(async function main() {
  try {
    const { OSLCRM10, OSLCRM, RDFS } = namespaces;
    const serverUri = process.env.SERVER_URI;
    const username = process.env.SERVER_USERNAME;
    const password = process.env.SERVER_PASSWORD;
    const projectAreaName = process.env.PROJECT_AREA_NAME;

    if (serverUri && username && password && projectAreaName) {
      const server = new OSLCServer(serverUri, username, password);
      await server.connect(OSLCRM10('rmServiceProviders'));
      await server.use(projectAreaName);

      const queryBase = server.serviceProvider.queryBase(OSLCRM('Requirement'));

      if (queryBase) {
        const result = await server.query({
          from: queryBase,
          what: RDFS('member'),
          properties: 'dcterms:identifier,dcterms:title',
          prefix: 'dcterms=<http://purl.org/dc/terms/>',
          paginate: true,
          pageSize: 5,
          totalCount: true,
        });
        const { resources, nextPage, totalCount } = result;
        const resource = resources[0];
        const response = await server.read(resource.getURI());
        const props = response.getProperties();
        console.log(`Total: ${totalCount}`);
        console.log(`Next Page: ${nextPage}`);
        console.log(JSON.stringify(props, null, 2));
      }
    }
  } catch (err) {
    console.error(err);
  }
}());
