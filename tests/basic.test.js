const path = require('path');
const dotEnv = require('dotenv');
const { OSLCServer, namespaces } = require('../dist');

const envpath = path.join(__dirname, '.env');
dotEnv.config({ path: envpath });

describe('Test basic functionalities', () => {
  const { OSLCRM10 } = namespaces;
  const serverUri = process.env.SERVER_URI;
  const username = process.env.SERVER_USERNAME;
  const password = process.env.SERVER_PASSWORD;
  const projectAreaName = process.env.PROJECT_AREA_NAME;
  const projectAreaId = process.env.PROJECT_AREA_ID;

  const server = new OSLCServer(serverUri, username, password);

  test('OSLCServer.connect() is able to set the Service Provider Catalog and should not throw error', async () => {
    await expect(server.connect(OSLCRM10('rmServiceProviders'))).resolves.not.toThrow();
  });

  test('OSLCServer.use() is able to use the given ServiceProvider and should not throw error', async () => {
    await expect(server.use(projectAreaName)).resolves.not.toThrow();
  });

  test(`OSLCServer.getJazzProjectAreaId() is able to get project area ID of ${
    projectAreaName} to be ${projectAreaId}`, async () => {
    await expect(server.getJazzProjectAreaId()).resolves.toBe(projectAreaId);
  });
});
