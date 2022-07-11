const path = require('path');
const dotEnv = require('dotenv');

const envpath = path.join(__dirname, '.env');
dotEnv.config({ path: envpath });
const { OSLCServer, namespaces } = require('../dist');

const serverUri = process.env.SERVER_URI;
const username = process.env.SERVER_USERNAME;
const password = process.env.SERVER_PASSWORD;
const projectAreaName = process.env.PROJECT_AREA_NAME;
const projectAreaId = process.env.PROJECT_AREA_ID;
const artifactId = parseInt(process.env.ARTIFACT_ID, 10);

const server = new OSLCServer(serverUri, username, password);
const { OSLCRM10, OSLCRM } = namespaces;

server
  .connect(OSLCRM10('rmServiceProviders'))
  .then(() => server.getServiceProvidersList())
  .then((list) => server.use(list.filter((projectArea) => projectArea.serviceProviderName === projectAreaName)[0].serviceProviderName))
  .then(() => server.getJazzProjectAreaId())
  .then((paId) => {
    if (paId === projectAreaId) {
      console.log('Project area ID matches!');
      return server.readById(OSLCRM('Requirement'), artifactId);
    }
    return Promise.reject(new Error(`Got different project area ID: ${paId}`));
  })
  .then((resource) => {
    console.log({
      id: resource.getIdentifier(),
      name: resource.getTitle(),
    });
  })
  .catch((err) => {
    console.error(err);
  });
