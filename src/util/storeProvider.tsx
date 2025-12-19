"use client";
import type { AppStore } from "@/redux/store/store";
import { makeStore } from "@/redux/store/store";
import { setupListeners } from "@reduxjs/toolkit/query";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import useIsClient from "@/shared/hook/useClient";
import { initializeStore } from "@/redux/store/store";

interface Props {
  readonly children: ReactNode;
}

export const StoreProvider = ({ children }: Props) => {
  const storeRef = useRef(initializeStore());

  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  useEffect(() => {
    if (storeRef.current != null) {
      // Configure listeners using the provided defaults
      // Optional, but required for `refetchOnFocus`/`refetchOnReconnect` behaviors
      const unsubscribe = setupListeners(storeRef.current.store.dispatch);
      return () => {
        unsubscribe();
      };
    }
  }, []);
  const isClient = useIsClient();
  return (
    <Provider store={storeRef.current.store}>
      {isClient ? (
        <PersistGate loading={null} persistor={storeRef.current.persistor}>
          {children}
        </PersistGate>
      ) : (
        children
      )}
    </Provider>
  );
};
