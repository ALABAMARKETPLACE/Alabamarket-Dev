interface InitialValue {
  status: boolean;
  type: string;
  item?: any;
}

interface AddAction {
  type: "add";
}

interface CloseAction {
  type: "close";
}

interface EditAction {
  type: "edit";
  item: any;
}

type Action = AddAction | EditAction | CloseAction;

function reducer(state: InitialValue, action: Action): InitialValue {
  if (action.type == "add") return { status: true, type: "add", item: {} };
  if (action.type == "edit")
    return { status: true, type: "edit", item: action?.item };
  return { status: false, type: "add", item: null };
}
interface PopconfirmInitialValue {
  open: boolean;
  id: number;
}

interface PopconfirmAddAction {
  type: "open";
  id: number;
}

interface PopconfirmCloseAction {
  type: "close";
}

type PopconfirmAction = PopconfirmAddAction | PopconfirmCloseAction;

function popconfirmReducer(
  state: PopconfirmInitialValue,
  action: PopconfirmAction
): PopconfirmInitialValue {
  switch (action.type) {
    case "open":
      return { open: true, id: action.id };
    case "close":
      return { open: false, id: -1 };
    default:
      return state;
  }
}

export { reducer, popconfirmReducer };
