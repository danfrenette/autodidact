import { spawn } from "bun";
import { resolve } from "path";

type JsonRpcResponse = {
  id?: number;
  method?: string;
  result?: Record<string, unknown>;
  error?: { message: string };
  params?: Record<string, unknown>;
};

type PendingRequest = {
  resolve: (value: Record<string, unknown>) => void;
  reject: (error: Error) => void;
};

export class Backend {
  private process;
  private nextId = 1;
  private pending = new Map<number, PendingRequest>();
  private onNotification?: (method: string, params: Record<string, unknown>) => void;

  constructor() {
    const binPath = resolve(import.meta.dir, "../../bin/autodidact");

    this.process = spawn(["ruby", binPath], {
      stdin: "pipe",
      stdout: "pipe",
      stderr: "inherit",
    });

    this.readResponses();
  }

  async request(method: string, params: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const id = this.nextId++;

    const message = JSON.stringify({ id, method, params }) + "\n";
    this.process.stdin.write(message);
    this.process.stdin.flush();

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  subscribe(handler: (method: string, params: Record<string, unknown>) => void) {
    this.onNotification = handler;
  }

  async shutdown() {
    this.process.stdin.end();
    await this.process.exited;
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
          this.handleMessage(JSON.parse(line) as JsonRpcResponse);
        }
      }
    }
  }

  private handleMessage(msg: JsonRpcResponse) {
    if (msg.id !== undefined && this.pending.has(msg.id)) {
      const pending = this.pending.get(msg.id)!;
      this.pending.delete(msg.id);

      if (msg.error) {
        pending.reject(new Error(msg.error.message));
      } else {
        pending.resolve(msg.result ?? {});
      }
    } else if (msg.method && this.onNotification) {
      this.onNotification(msg.method, msg.params ?? {});
    }
  }
}
