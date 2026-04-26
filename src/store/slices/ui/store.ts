import type { StateCreator } from "zustand";

import type { IUiStore } from "./types";

const createUiSlice: StateCreator<IUiStore> = () => ({
  sidebarOpen: true,
});

export default createUiSlice;
