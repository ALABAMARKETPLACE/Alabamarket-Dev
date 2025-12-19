/**
 * Suppresses Ant Design React 19 compatibility warning
 * This is safe because we're using React 18 which is fully supported
 */
if (typeof window !== "undefined") {
  const originalWarn = console.warn;

  console.warn = function (...args: any[]) {
    // Suppress the Ant Design React 19 compatibility warning
    if (
      args[0] &&
      typeof args[0] === "string" &&
      args[0].includes("[antd: compatible]") &&
      args[0].includes("React is 16 ~ 18")
    ) {
      return;
    }

    // Call original warn for all other warnings
    originalWarn.apply(console, args);
  };
}
