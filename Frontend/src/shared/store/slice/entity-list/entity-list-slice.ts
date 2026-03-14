import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CollectionQuery } from "../../../../models/collection.model";
import type { RootState } from "../../../../store/app.store";

export interface EntityListStateModel {
  collection: CollectionQuery | null;
  key: string;
}
export interface EntityListState {
  collections: EntityListStateModel[];
  viewAll: boolean;
}

const initialState: EntityListState = {
  collections: [],
  viewAll: false,
};

type uiKeys = "shipments" | "dashboard";

export const entityListSlice = createSlice({
  name: "entityList",
  initialState,
  reducers: {
    setEntityListCollection: (state, action: PayloadAction<any>): void => {
      const filteredCollection = state.collections.filter(
        (collection) => collection.key === action.payload.key
      );
      if (filteredCollection.length > 0) {
        state.collections = state.collections.map((collection) => {
          if (collection.key === action.payload.key) {
            return action.payload;
          }
          return collection;
        });
      } else {
        state.collections = [...state.collections, action.payload];
      }
    },
    removeEntityListCollection: (
      state,
      action: PayloadAction<string>
    ): void => {
      state.collections = state?.collections?.filter(
        (collection) => collection.key !== action.payload
      );
    },
    setUiState: (state, action: PayloadAction<boolean>): void => {
      state.viewAll = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setEntityListCollection,
  removeEntityListCollection,
  setUiState,
} = entityListSlice.actions;

export default entityListSlice.reducer;
