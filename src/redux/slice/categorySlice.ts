import { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "@/redux/createSlices";
import { createSelector } from "@reduxjs/toolkit";

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
    reduxSubcategoryItemsBase: (items: initialState) => items?.categries ?? [],
  },
});

export const { storeCategory, clearCategory } = CategorySlice.actions;

export const { reduxCategoryItems, reduxSubcategoryItemsBase } =
  CategorySlice.selectors;

// Memoized selector to prevent unnecessary re-renders
export const reduxSubcategoryItems = createSelector(
  [reduxSubcategoryItemsBase],
  (categories: any[]) => {
    if (!Array.isArray(categories)) return [];
    const subcategories: any[] = [];
    for (const item of categories) {
      if (!Array.isArray(item?.sub_categories)) continue;
      for (const ite of item?.sub_categories) {
        subcategories.push(ite);
      }
    }
    return subcategories;
  }
);
