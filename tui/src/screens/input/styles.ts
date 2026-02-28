export { uiStyles } from "@/components/ui-styles";

export const PANEL_WIDTH = 92;

export const modalStyles = {
  border: "#2f6b45",
  background: "#0d1a12",
  title: "#77d18a",
  body: "#d6dfd9",
  path: "#a7c2af",
  hint: "#88a593",
  close: "#9cc9a7",
} as const;

export function inputBadgeStyles(supported: boolean) {
  if (supported) {
    return {
      root: {
        color: "#77d18a",
        backgroundColor: "#13261b",
        paddingX: 1,
        paddingY: 0,
      },
    };
  }

  return {
    root: {
      color: "#f29a9a",
      backgroundColor: "#2a1515",
      paddingX: 1,
      paddingY: 0,
    },
  };
}

export function tagBadgeStyles(selected: boolean) {
  if (selected) {
    return {
      root: {
        color: "#77d18a",
        backgroundColor: "#173122",
        paddingX: 1,
        paddingY: 0,
      },
    };
  }

  return {
    root: {
      color: "#8f97a5",
      backgroundColor: "#12161e",
      paddingX: 1,
      paddingY: 0,
    },
  };
}
