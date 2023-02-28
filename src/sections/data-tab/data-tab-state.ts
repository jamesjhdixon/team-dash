import { atom, selectorFamily } from 'recoil';

import { DataTabConfig } from '../../data/models/data-tab';

export const allTabsState = atom<DataTabConfig[]>({
  key: 'allTabs',
  default: new Promise(() => {}),
});

export const tabBySlugState = selectorFamily<DataTabConfig, string>({
  key: 'tabBySlug',
  get:
    (slug) =>
    ({ get }) => {
      const tab = get(allTabsState).find((x) => x.slug === slug);

      if (tab == null) {
        throw new Error(`Data tab '${slug}' not found`);
      }

      return tab;
    },
});
