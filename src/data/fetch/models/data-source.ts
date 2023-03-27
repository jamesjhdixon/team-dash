import { dict, number, object, string } from '@recoiljs/refine';

import { MutableCheckerReturn } from '../../../utils/recoil/refine';

export const dataSourceChecker = object({
  pathSchema: string(),
  title: string(),
  yAxisTitle: string(),
  numberFractionalDigits: number(),
});

export type DataSourceConfig = MutableCheckerReturn<typeof dataSourceChecker>;

export const allDataSourcesChecker = dict(dataSourceChecker);

export type AllDataSourcesConfig = MutableCheckerReturn<
  typeof allDataSourcesChecker
>;
