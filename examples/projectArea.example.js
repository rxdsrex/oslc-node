require('dotenv').config();
const { OSLCServer, namespaces } = require('../dist');

const serverUri = process.env.SERVER_URI;
const username = process.env.SERVER_USERNAME;
const password = process.env.SERVER_PASSWORD;
const projectAreaId = process.env.PROJECT_AREA_ID;
const { OSLCRM10 } = namespaces;

const server = new OSLCServer(serverUri, username, password);

server.connect(OSLCRM10('rmServiceProviders'))
  .then(() => server.getServiceProvidersList())
  .then((list) => server.use(list[0].serviceProviderName))
  .then(() => server.getJazzProjectAreaId())
  .then((paId) => {
    if (paId === projectAreaId) {
      console.log('Project area ID matches!');
    } else {
      console.error(`Got different project area ID: ${paId}`);
    }
  })
  .catch((err) => {
    console.error(err);
  });
