import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Section, Tree } from './models';

export interface TreeState {
  trees: { [key: number]: Tree };
}

const initialState: TreeState = {
  trees: {
    0: {
      id: 0,
      sectionIds: [0]
    }
  }
};

const treeSlice = createSlice({
  name: 'tree',
  initialState,
  reducers: {
    addTree(state, action: PayloadAction<Tree>) {
      const tree = action.payload;
      state.trees[tree.id] = tree;
    },
    deleteTree(state, action: PayloadAction<number>) {
      delete state.trees[action.payload];
    },
    addSectionToTree(state, action: PayloadAction<Section>) {
      const tree = state.trees[action.payload.treeId];
      tree.sectionIds.push(action.payload.id);
    },
    updateTree(state, action: PayloadAction<Tree>) {
      const tree = action.payload;
      state.trees[tree.id] = tree;
    },
    replaceSlice: (_, action: PayloadAction<TreeState>) => action.payload,
    resetSlice: (_) => initialState
  },
});

export const { addTree, deleteTree, addSectionToTree, updateTree, replaceSlice: replaceTreeSlice, resetSlice: resetTreeSlice } = treeSlice.actions;
export const initialTreeState = initialState;
export default treeSlice.reducer;
