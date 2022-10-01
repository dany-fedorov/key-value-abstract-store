import { KvasDataSource, KvasMap, KvasPath, KvasTypeParameters } from '@lib/utils/kvas/kvas-interface';

type KvasSyncContainerConfiguration<KTP extends KvasTypeParameters> = {
  DataSource: new () => KvasDataSource<KTP>;
  Map: new () => KvasMap<KTP>;
};

export class KvasSyncContainer<KTP extends KvasTypeParameters> {
  constructor(private readonly config: KvasSyncContainerConfiguration<KTP>) {}

  get(path: KvasPath<KTP['Key']>): ;
}
