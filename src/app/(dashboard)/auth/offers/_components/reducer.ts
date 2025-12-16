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
  
  function reducer(state: InitialValue, action: Action) {
    if (action.type == "add") return { status: true, type: "add" };
    if (action.type == "edit")
      return { status: true, type: "edit", item: action?.item };
    return { status: false, type: "add", item: null };
  }
  
  export { reducer };
  