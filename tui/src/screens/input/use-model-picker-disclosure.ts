import { useCallback, useState } from "react";

type KeyLike = {
  name: string;
  preventDefault: () => void;
};

type Args = {
  disabled: boolean;
};

export function useModelPickerDisclosure({ disabled }: Args) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
  }, [disabled]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    if (disabled) return;
    setIsOpen((openState) => !openState);
  }, [disabled]);

  const handleKeyboard = useCallback((key: KeyLike): boolean => {
    if (disabled) {
      return false;
    }

    if (!isOpen && key.name === "down") {
      key.preventDefault();
      open();
      return true;
    }

    if (isOpen && key.name === "escape") {
      key.preventDefault();
      close();
      return true;
    }

    return false;
  }, [close, disabled, isOpen, open]);

  return {
    isOpen,
    open,
    close,
    toggle,
    handleKeyboard,
  };
}
