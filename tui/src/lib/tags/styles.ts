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
