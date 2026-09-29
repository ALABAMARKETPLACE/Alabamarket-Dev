"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { pixelPageView } from "@/utils/metaPixel";

/**
 * The base pixel snippet in `layout.tsx` fires PageView once, on the initial
 * document load. Every navigation after that is a client-side route change, so
 * without this the pixel would only ever record the landing page.
 *
 * The first effect run is skipped — the snippet already covered it.
 */
export default function MetaPixelRouteTracker() {
  const pathname = usePathname();
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    pixelPageView();
  }, [pathname]);

  return null;
}
