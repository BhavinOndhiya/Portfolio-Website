const { randomUUID } = require("crypto");
const initialContent = require("../../src/data/initialContent.json");

const cloneInitialContent = () => JSON.parse(JSON.stringify(initialContent));

const sectionsWithCollections = new Set([
  "services",
  "skills",
  "education",
  "projectTimeline",
  "experience",
  "portfolio",
  "personalInfo",
  "contactMethods",
]);

function cloneSection(items = []) {
  return items.map((item) => ({ ...item }));
}

function applyAction(state = cloneInitialContent(), payload = {}) {
  const draft = { ...state };

  switch (payload.action) {
    case "RESET_CONTENT":
      return cloneInitialContent();
    case "UPDATE_HERO":
      return {
        ...draft,
        hero: {
          ...draft.hero,
          ...(payload.data || {}),
        },
      };
    case "SET_CONTENT":
      return payload.content || state;
    case "ADD_ITEM": {
      const { section, data } = payload;
      if (!sectionsWithCollections.has(section)) {
        return draft;
      }
      const list = cloneSection(draft[section]);
      list.push({
        id: randomUUID(),
        ...data,
      });
      return { ...draft, [section]: list };
    }
    case "UPDATE_ITEM": {
      const { section, id, data } = payload;
      if (!sectionsWithCollections.has(section)) {
        return draft;
      }
      const list = cloneSection(draft[section]);
      const index = list.findIndex((item) => item.id === id);
      if (index === -1) {
        return draft;
      }
      list[index] = { ...list[index], ...data };
      return { ...draft, [section]: list };
    }
    case "DELETE_ITEM": {
      const { section, id } = payload;
      if (!sectionsWithCollections.has(section)) {
        return draft;
      }
      const list = cloneSection(draft[section]);
      const filtered = list.filter((item) => item.id !== id);
      return { ...draft, [section]: filtered };
    }
    default:
      return draft;
  }
}

module.exports = {
  applyAction,
};
