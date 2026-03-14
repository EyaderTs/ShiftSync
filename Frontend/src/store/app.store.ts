import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { appApi } from "./app.api";
import entityListReducer from "../shared/store/slice/entity-list/entity-list-slice";
import authReducer from "../shared/auth/auth-slice/auth-slice";


export const store = configureStore({
  reducer: {
    [appApi.reducerPath]: appApi.reducer,
    authReducer,
    entityListReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(appApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;

setupListeners(store.dispatch);
