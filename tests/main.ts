// import { hostToKvasInMemoryJsonMapRecur } from '../src/implementations/in-memory-json/kvas-in-memory-json-utils';
import { KvasInMemoryJsonMap } from '../src/implementations/in-memory-json/kvas-in-memory-json-map';
import { KvasInMemoryJsonDataSource } from '../src/implementations/in-memory-json/kvas-in-memory-json-data-source';
import { KvasInMemoryJsonMapOperations } from '../src/implementations/in-memory-json/kvas-in-memory-json-map-operations';
import type { JsonPrimitive } from '../src/implementations/in-memory-json/kvas-in-memory-json-types';
// import { jsonStringifySafe } from 'configurable-tree-traversal/utils/jsonStringifySafe';

// const main = () => {
//   const obj = {
//     f: 1,
//     e: { ee: 1234, ff: 2, f: { c: 3 } },
//   };
//   const arr = [1, 2, 3, { a: 4 }, [5, 6, 7, obj]];
//   console.log(jsonStringifySafe(arr));
//   // const m = hostToKvasInMemoryJsonMapRecur(obj);
//   // console.log(m);
//   const km = new KvasInMemoryJsonMap({ data: arr });
//   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//   // @ts-ignore
//   // console.log(km?.getKey?.('e')?.sync?.()?.value?.getKey('ff')?.sync?.());
//   // console.log(km?.getKey?.(3)?.sync?.()?.value?.getKey('a')?.sync?.());
//   // console.log(km?.getKey?.(4)?.sync?.());
//   // console.log(m?.getKey?.('e')?.sync?.());
//   // console.log(m);
//   console.log(jsonStringifySafe(kvasInMemoryJsonMapToDataObjectRecur(km)));
//   // console.log(jsonStringifySafe());
// };

const main = () => {
  const obj = {
    f: 1,
    e: { ee: 1234, ff: 2, f: { c: 3 } },
  };
  const arr = [1, 2, 3, { a: 4 }, [5, 6, 7, obj]];
  const ds = new KvasInMemoryJsonDataSource<JsonPrimitive>({
    operations: new KvasInMemoryJsonMapOperations<JsonPrimitive>(),
  });
  ds.initialize({
    // fromJsObject: obj,
    fromJsObject: arr,
  })?.sync?.();
  // console.log(ds.rootMap);
  console.log(ds.getJsObject([4, 0])?.sync?.());
  // console.log(
  //   ds.get(['e'])?.sync?.()?.prop?.value?.toJsObject?.()?.sync()?.object,
  // );
  // console.log(ds.get(['e'])?.sync?.()?.prop?.value);
  // console.log(ds.getJsObject(['e'])?.sync?.()?.prop?.value);
  // console.log(ds.getJsObject(['e', 'ff'])?.sync?.());
  // console.log(jsonStringifySafe(arr));
  // const m = hostToKvasInMemoryJsonMapRecur(obj);
  // console.log(m);
  const km = new KvasInMemoryJsonMap({ data: arr });
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // console.log(km?.getKey?.('e')?.sync?.()?.value?.getKey('ff')?.sync?.());
  // console.log(km?.getKey?.(3)?.sync?.()?.value?.getKey('a')?.sync?.());
  // console.log(km?.getKey?.(4)?.sync?.());
  // console.log(m?.getKey?.('e')?.sync?.());
  // console.log(m);
  // console.log(jsonStringifySafe(kvasInMemoryJsonMapToDataObjectRecur(km)));
  // console.log(jsonStringifySafe());
};

main();
