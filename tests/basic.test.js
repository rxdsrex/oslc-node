require('dotenv').config();
const { OSLCServer, namespaces } = require('../dist');

describe('Test basic functionalities', () => {
  const { OSLCCM10 } = namespaces;
  const serverUri = process.env.SERVER_URI;
  const username = process.env.SERVER_USERNAME;
  const password = process.env.SERVER_PASSWORD;
  const projectAreaName = process.env.PROJECT_AREA_NAME;

  const server = new OSLCServer(serverUri, username, password);

  test('OSLCServer.connect() is able to set the Service Provider Catalog and should not throw error', async () => {
    await expect(server.connect(OSLCCM10('cmServiceProviders'))).resolves.not.toThrow();
  });

  test('OSLCServer.use() is able to use the given ServiceProvider and should not throw error', async () => {
    await expect(server.use(projectAreaName)).resolves.not.toThrow();
  });

  test('OSLCServer.getJazzProjectAreaId() is able to get project area ID of '
    + projectAreaName + ' to be ' + '_t_RxYJYWEeyjQ_tStwnY_w', async () => {
      await expect(server.getJazzProjectAreaId()).resolves.toBe('_t_RxYJYWEeyjQ_tStwnY_w');
    });
});
