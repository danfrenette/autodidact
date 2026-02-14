import { useEffect, useRef } from "react";
import { useRenderer } from "@opentui/react";

/**
 * Workaround for paste not working in OpenTUI React.
 *
 * The core InputRenderable.handlePaste() relies on StdinBuffer detecting
 * bracketed paste sequences (\x1b[200~...\x1b[201~), but this doesn't
 * fire in React apps. We listen on the renderer's internal key handler
 * for the "paste" event, and fall back to raw stdin parsing if needed.
 */
export function usePaste(callback: (text: string) => void) {
  const renderer = useRenderer();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!renderer) return;

    // Try the official paste event first
    const onPaste = (event: { text: string }) => {
      callbackRef.current(event.text);
    };
    renderer.keyInput.on("paste", onPaste);

    // Fallback: parse bracketed paste from raw stdin
    const PASTE_START = "\x1b[200~";
    const PASTE_END = "\x1b[201~";
    let pasteBuffer = "";
    let isPasting = false;

    const onData = (data: Buffer | string) => {
      const str = typeof data === "string" ? data : data.toString("utf-8");

      if (isPasting) {
        pasteBuffer += str;
        const endIdx = pasteBuffer.indexOf(PASTE_END);
        if (endIdx !== -1) {
          const pasted = pasteBuffer.slice(0, endIdx);
          isPasting = false;
          pasteBuffer = "";
          callbackRef.current(pasted);
        }
        return;
      }

      const startIdx = str.indexOf(PASTE_START);
      if (startIdx !== -1) {
        const afterStart = str.slice(startIdx + PASTE_START.length);
        const endIdx = afterStart.indexOf(PASTE_END);
        if (endIdx !== -1) {
          // Complete paste in one chunk
          callbackRef.current(afterStart.slice(0, endIdx));
        } else {
          // Paste spans multiple chunks
          isPasting = true;
          pasteBuffer = afterStart;
        }
      }
    };

    process.stdin.on("data", onData);

    return () => {
      renderer.keyInput.off("paste", onPaste);
      process.stdin.off("data", onData);
    };
  }, [renderer]);
}
