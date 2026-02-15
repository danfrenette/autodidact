import { spawn } from "bun";
import { resolve } from "path";
import type {
  RpcMessage,
  NotificationHandler,
  ServiceResult,
} from "./types/rpc.ts";
import * as pingRequest from "./requests/ping/index.ts";
import * as detectSourceRequest from "./requests/detect-source/index.ts";
import type { SourceInfo } from "./requests/detect-source/index.ts";

type PendingRequest = {
  resolve: (response: ServiceResult) => void;
  reject: (error: Error) => void;
};

export class Backend {
  private process;
  private nextId = 1;
  private pending = new Map<number, PendingRequest>();
  private listeners = new Set<NotificationHandler>();
  private disposed = false;

  constructor() {
    const binPath = resolve(import.meta.dir, "../../bin/autodidact");

    this.process = spawn(["ruby", binPath], {
      stdin: "pipe",
      stdout: "pipe",
      stderr: "inherit",
    });

    this.readResponses();

    void this.process.exited.then(() => {
      this.rejectAll(new Error("Backend process exited"));
    });
  }

  async ping(): Promise<{ status: string; version: string }> {
    const result = await this.send(pingRequest.method, {});
    return pingRequest.decode(result);
  }

  async detectSource(path: string): Promise<SourceInfo> {
    const result = await this.send(detectSourceRequest.method, { path });
    const wire = detectSourceRequest.decode(result);
    return detectSourceRequest.toSourceInfo(wire);
  }

  subscribe(handler: NotificationHandler) {
    this.listeners.add(handler);
    return () => {
      this.listeners.delete(handler);
    };
  }

  async shutdown() {
    if (this.disposed) return;

    this.disposed = true;
    this.rejectAll(new Error("Backend was shut down"));
    this.process.stdin.end();
    await this.process.exited;
  }

  private send(
    method: string,
    params: Record<string, unknown>,
  ): Promise<ServiceResult> {
    if (this.disposed) {
      throw new Error("Backend is not available");
    }

    const id = this.nextId++;
    const message = JSON.stringify({ id, method, params }) + "\n";
    this.process.stdin.write(message);
    this.process.stdin.flush();

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  private async readResponses() {
    const reader = this.process.stdout.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newlineIndex).trim();
        buffer = buffer.slice(newlineIndex + 1);

        if (line.length > 0) {
          try {
            const msg: RpcMessage = JSON.parse(line);
            this.handleMessage(msg);
          } catch {
            // skip malformed lines
          }
        }
      }
    }
  }

  private handleMessage(msg: RpcMessage) {
    if ("id" in msg) {
      const pending = this.pending.get(msg.id);
      if (!pending) return;

      this.pending.delete(msg.id);
      pending.resolve(msg.result);
      return;
    }

    for (const listener of this.listeners) {
      listener(msg.method, msg.params);
    }
  }

  private rejectAll(error: Error) {
    for (const pending of this.pending.values()) {
      pending.reject(error);
    }
    this.pending.clear();
  }
}
