import { KvasSyncDataStoreContainer } from './key-value-abstract-store.containers';
import { KvasInMemoryJsonDataStore } from './key-value-abstract-store.in-memory-json';

function mkNewContainer() {
  const c = new KvasSyncDataStoreContainer(new KvasInMemoryJsonDataStore());
  c.initialize();
  return c;
}

describe('KvasInMemoryJsonDataStore', function () {
  describe('set', function () {
    it('should set a value for one level path', () => {
      // const c = mkNewContainer();
      // c.set();
      const d = new KvasInMemoryJsonDataStore();
      d.set(['key1'], 'val1');
    });
  });
  describe('get', function () {
    it('should fetch undefined value for non-exising type', () => {});
  });
});
