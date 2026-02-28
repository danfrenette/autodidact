export const PANEL_WIDTH = 92;

export const inputStyles = {
  panelBorder: "#2a323f",
  panelBackground: "#0f141b",
  fieldBorder: "#27303c",
  fieldBackground: "#0d1117",
  title: "#e6e9f0",
  icon: "#63d389",
  label: "#6f7887",
  value: "#d9deea",
  muted: "#8f97a5",
  comboboxMenuBorder: "#2c3744",
  comboboxMenuBackground: "#101722",
  comboboxRowText: "#cfd6e3",
  comboboxRowHighlightBackground: "#1b2533",
  comboboxRowHighlightText: "#f1f5fc",
  comboboxRowHighlightMarker: "#63d389",
} as const;

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
