const { config } = require('dotenv');
const { OSLCServer, namespaces } = require('../dist');

config();

(async function main() {
  try {
    const { OSLCCM10, OSLCCM, RDFS } = namespaces;
    const serverUri = process.env.SERVER_URI;
    const username = process.env.SERVER_USERNAME;
    const password = process.env.SERVER_PASSWORD;
    const projectAreaName = process.env.PROJECT_AREA_NAME;

    if (serverUri && username && password && projectAreaName) {
      const server = new OSLCServer(serverUri, username, password);
      await server.connect(OSLCCM10('cmServiceProviders'));
      await server.use(projectAreaName);

      const queryBase = server.serviceProvider.queryBase(OSLCCM('ChangeRequest'));

      if (queryBase) {
        const result = await server.query({
          from: queryBase,
          what: RDFS('member'),
        });
        const { resources } = result;
        const resource = resources[0];
        const response = await server.read(resource.getURI());
        const props = response.getProperties();
        console.log(JSON.stringify(props, null, 2));
      }
    }
  } catch (err) {
    console.error(err);
  }
}());
