import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

import createUiSlice from "./slices/ui";
import createTradingSlice from "./slices/trading";

import type { IUiStore } from "./slices/ui";
import type { ITradingStore } from "./slices/trading";

export type IAppStore = IUiStore & ITradingStore;

const compare = <T>(a: T, b: T) => a === b || shallow(a, b);

export const useAppStore = createWithEqualityFn<IAppStore>(
  (...args) => ({
    ...createUiSlice(...args),
    ...createTradingSlice(...args),
  }),
  compare,
);

export const getAppStore = useAppStore.getState;
export const setAppStore = useAppStore.setState;
