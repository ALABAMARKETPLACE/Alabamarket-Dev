export const ExecuteFunction = (functi: any, ...args: any[]) => {
  if (typeof functi == "function") {
    functi(...args);
  }
};
