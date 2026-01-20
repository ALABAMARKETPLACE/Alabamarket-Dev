export interface Category {
  id?: string | number;
  name?: string;
  [key: string]: unknown;
}

interface InitialValue {
  status: boolean;
  type: string;
  item?: Category | null;
}

interface AddAction {
  type: "add";
}

interface CloseAction {
  type: "close";
}

interface EditAction {
  type: "edit";
  item: Category;
}

type Action = AddAction | EditAction | CloseAction;

function reducer(state: InitialValue, action: Action) {
  if (action.type == "add") return { status: true, type: "add" };
  if (action.type == "edit")
    return { status: true, type: "edit", item: action?.item };
  return { status: false, type: "add", item: null };
}

export { reducer };
