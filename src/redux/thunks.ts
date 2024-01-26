import { resetTreeSlice, addSectionToTree, replaceTreeSlice, TreeState } from './treeSlice';
import { SectionState, replaceSectionSlice, resetSectionSlice, addIdeaToParentSection, addSection, deleteSection } from "./sectionSlice";
import { IdeaState, replaceIdeaSlice, resetIdeaSlice, addIdea, selectIdeasById } from "./ideaSlice";
import { CommentState, replaceCommentSlice, resetCommentSlice } from "./commentSlice";
import { resetDaemonSlice } from "./daemonSlice";
import { clearErrors } from './errorSlice';
import { resetConfigSlice } from './configSlice';
import { setActiveIdeaIds, setActiveSectionId, resetUiSlice, setActiveTreeId } from "./uiSlice";
import { Idea, Section } from "./models";
import { AppThunk } from './store';
import { getAllAncestorIds, getChildren, getMostRecentDescendent } from "./storeUtils";


export const switchBranch = (parentIdea: Idea, moveForward: boolean): AppThunk => (dispatch, getState) => {
  const state = getState();
  const section = state.section.sections[parentIdea.sectionId];
  const ideas = selectIdeasById(state, section.ideaIds);
  const childIdeas = getChildren(ideas, parentIdea.id);
  const currentChild = ideas.find(idea => idea.parentIdeaId === parentIdea.id && state.ui.activeIdeaIds.includes(idea.id));
  let newCurrentIdea: Idea;
  if (currentChild) {
    const currentIndex = childIdeas.findIndex(idea => idea.id === currentChild.id);
    const newChild = moveForward
      ? childIdeas[(currentIndex + 1) % childIdeas.length]
      : childIdeas[(currentIndex - 1 + childIdeas.length) % childIdeas.length];
    newCurrentIdea = getMostRecentDescendent(ideas, newChild.id);
  } else {
    // User was likely adding a new branch but changed their mind
    newCurrentIdea = getMostRecentDescendent(ideas, parentIdea.id);
  }

  dispatch(setActiveIdeaIds(getAllAncestorIds(ideas, newCurrentIdea.id)));
};

export const createSection = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const newSectionId = Date.now();
  const newSection: Section = {
    id: newSectionId,
    treeId: state.ui.activeTreeId,
    parentSectionId: state.ui.activeSectionId,
    parentIdeaId: state.ui.activeIdeaIds[state.ui.activeIdeaIds.length - 1],
    ideaIds: []
  };

  dispatch(addSection(newSection));
  dispatch(addSectionToTree(newSection));
  dispatch(setActiveSectionId(newSectionId));
  dispatch(setActiveIdeaIds([]));
};


export const navigateToParentSection = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const activeSection = state.section.sections[state.ui.activeSectionId];
  if (activeSection.parentSectionId !== null && activeSection.parentIdeaId !== null) {
    const parentSection = state.section.sections[activeSection.parentSectionId];
    const parentSectionIdeas = selectIdeasById(state, parentSection.ideaIds);
    const newActiveIdea = getMostRecentDescendent(parentSectionIdeas, activeSection.parentIdeaId);
    const newActiveIdeaIds = getAllAncestorIds(parentSectionIdeas, newActiveIdea.id);

    dispatch(setActiveSectionId(parentSection.id));
    dispatch(setActiveIdeaIds(newActiveIdeaIds));

    if (activeSection.ideaIds.length === 0) {
      // User cancelled creating a new section
      dispatch(deleteSection(activeSection.id))
    }
  }
};

export const navigateToChildSection = (rootIdea: Idea): AppThunk => (dispatch, getState) => {
  const state = getState();
  const childSection = state.section.sections[rootIdea.sectionId];
  const ideaIds = childSection.ideaIds;
  const allIdeas = state.idea.ideas;
  const ideas = ideaIds.map(id => allIdeas[id]);
  const newCurrentIdea = getMostRecentDescendent(ideas, rootIdea.id);
  const newActiveIdeaIds = getAllAncestorIds(ideas, newCurrentIdea.id);

  dispatch(setActiveSectionId(childSection.id));
  dispatch(setActiveIdeaIds(newActiveIdeaIds));
};

export const createIdea = (text: string, isUser: boolean = true): AppThunk => (dispatch, getState) => {
  const state = getState();
  const id = Date.now();
  const sectionId = state.ui.activeSectionId;
  const parentIdeaId = state.ui.activeIdeaIds[state.ui.activeIdeaIds.length - 1];
  const newIdea: Idea = {
    id,
    isUser,
    sectionId,
    parentIdeaId,
    text,
    textTokens: [],
    tokenSurprisals: []
  }
  const newActiveIdeaIds = [...state.ui.activeIdeaIds, id];

  dispatch(addIdea(newIdea));
  dispatch(addIdeaToParentSection(newIdea));
  dispatch(setActiveIdeaIds(newActiveIdeaIds))
}

export const importTree = (json: string): AppThunk => (dispatch, getState) => {
  try {
    const importedState = JSON.parse(json) as { tree: TreeState; section: SectionState; idea: IdeaState; comment: CommentState };
    console.debug(importedState)
    dispatch(replaceTreeSlice(importedState.tree))
    dispatch(replaceSectionSlice(importedState.section));
    dispatch(replaceIdeaSlice(importedState.idea));
    dispatch(replaceCommentSlice(importedState.comment));
    const allImportedIdeas = Object.values(importedState.idea.ideas);
    const mostRecentIdea = allImportedIdeas.reduce((prev, current) => (prev.id > current.id) ? prev : current);
    const currentSection = importedState.section.sections[mostRecentIdea.sectionId];
    console.debug(allImportedIdeas, mostRecentIdea)
    dispatch(setActiveTreeId(currentSection.treeId));
    dispatch(setActiveSectionId(currentSection.id));
    dispatch(setActiveIdeaIds(getAllAncestorIds(allImportedIdeas, mostRecentIdea.id)));
    console.info("Import finished successfully")
    // TODO Notify the user that the import was successful
  } catch (error) {
    console.error('Error parsing the imported file', error);
  }
}

export const resetState = (): AppThunk => (dispatch, getState) => {
  console.info("Resetting app state");
  dispatch(resetTreeSlice());
  dispatch(resetSectionSlice());
  dispatch(resetIdeaSlice());
  dispatch(resetCommentSlice());
  dispatch(resetDaemonSlice());
  dispatch(resetConfigSlice());
  dispatch(resetUiSlice());
  dispatch(clearErrors());
}