import { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "@/redux/createSlices";
interface initialState {
  categries: any[];
}
const initialState: initialState = {
  categries: [],
};
export const CategorySlice = createAppSlice({
  name: "Category",
  initialState,
  reducers: {
    storeCategory: (state: initialState, action: PayloadAction<any[]>) => {
      state.categries = action.payload;
    },
    clearCategory: (state: initialState) => {
      state.categries = [];
    },
  },
  selectors: {
    reduxCategoryItems: (items: initialState) => items?.categries ?? [],
    reduxSubcategoryItems: (items: initialState) => {
      if (!Array.isArray(items.categries)) return [];
      const subcategories: any[] = [];
      for (const item of items.categries) {
        if (!Array.isArray(item?.sub_categories)) continue;
        for (const ite of item?.sub_categories) {
          subcategories.push(ite);
        }
      }
      return subcategories;
    },
  },
});

export const { storeCategory, clearCategory } = CategorySlice.actions;

export const { reduxCategoryItems, reduxSubcategoryItems } =
  CategorySlice.selectors;
