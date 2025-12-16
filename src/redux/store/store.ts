import type { Action, ThunkAction } from "@reduxjs/toolkit";
import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { CartSlice } from "@/redux/slice/cartSlice";
import { SettingsSlice } from "@/redux/slice/settingsSlice";
import { CategorySlice } from "@/redux/slice/categorySlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "@/redux/storage";
import { LocationSlice } from "@/redux/slice/locationSlice";
import { LanguageSlice } from "@/redux/slice/languageSlice";
import { AuthSlice } from "@/redux/slice/authSlice";
import { CheckoutSlice } from "@/redux/slice/checkoutSlice";
import { UserSlice } from "@/redux/slice/userSlice";
import { paystackSlice } from "@/redux/slice/paystackSlice";

const rootReducer = combineSlices(
  CartSlice,
  CategorySlice,
  SettingsSlice,
  LocationSlice,
  LanguageSlice,
  AuthSlice,
  CheckoutSlice,
  UserSlice,
  paystackSlice
);

const persistConfig = {
  key: "alaba-nextjs",
  storage,
  whitelist: ["Cart", "Category", "Settings", "Location", "Language", "Auth","Checkout","User","paystack"],
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

export type RootState = ReturnType<typeof rootReducer>;

export const makeStore = () => {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => {
      return getDefaultMiddleware({
        serializableCheck: {
          // Ignore these action types
          ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        },
      }).concat();
    },
  });

  const persistor = persistStore(store);

  return { store, persistor };
};

let storeInstance: ReturnType<typeof makeStore> | null = null;

const initializeStore = () => {
  if (!storeInstance) {
    storeInstance = makeStore();
  }
  return storeInstance;
};

const { store, persistor } = initializeStore();

export { store, persistor, initializeStore };

export type AppStore = ReturnType<typeof makeStore>["store"];
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>;
