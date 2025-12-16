type orderTypes = {
  query: (query: string) => void;
  status: (status: string) => void;
  date: (from: string, to: string) => void;
};

export default orderTypes;
