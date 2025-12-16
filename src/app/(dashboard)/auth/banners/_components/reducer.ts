interface InitialValue {
  open: boolean;
  id: number;
}

interface AddAction {
  type: "open";
  id: number;
}

interface CloseAction {
  type: "close";
}

type Action = AddAction | CloseAction;

function reducer(state: InitialValue, action: Action): InitialValue {
  switch (action.type) {
    case "open":
      return { open: true, id: action.id };
    case "close":
      return { open: false, id: -1 };
    default:
      return state;
  }
}

export { reducer };
