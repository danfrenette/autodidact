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
import * as analyzeSourceRequest from "./requests/analyze-source/index.ts";
import type { AnalysisResult } from "./requests/analyze-source/index.ts";
import * as setupStatusRequest from "./requests/setup-status/index.ts";
import type { SetupStatus } from "./requests/setup-status/index.ts";
import * as updateConfigRequest from "./requests/update-config/index.ts";
import type {
  ConfigParams,
  UpdateConfigResult,
} from "./requests/update-config/index.ts";
import * as getOnboardingStateRequest from "./requests/get-onboarding-state/index.ts";
import * as setOnboardingStateRequest from "./requests/set-onboarding-state/index.ts";
import type { OnboardingPersistedState } from "./onboarding/types";

type PendingRequest = {
  resolve: (response: ServiceResult) => void;
  reject: (error: Error) => void;
};

function spawnBackend() {
  const binPath = resolve(import.meta.dir, "../../bin/autodidact");
  return spawn(["ruby", binPath], {
    stdin: "pipe",
    stdout: "pipe",
    stderr: "inherit",
  });
}

type BackendProcess = ReturnType<typeof spawnBackend>;

export class Backend {
  private process: BackendProcess;
  private nextId = 1;
  private pending = new Map<number, PendingRequest>();
  private listeners = new Set<NotificationHandler>();
  private disposed = false;

  constructor() {
    this.process = this.spawnProcess();
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

  async analyzeSource(path: string): Promise<AnalysisResult> {
    const result = await this.send(analyzeSourceRequest.method, { path });
    const wire = analyzeSourceRequest.decode(result);
    return analyzeSourceRequest.toAnalysisResult(wire);
  }

  async setupStatus(): Promise<SetupStatus> {
    const result = await this.send(setupStatusRequest.method, {});
    const wire = setupStatusRequest.decode(result);
    return setupStatusRequest.toSetupStatus(wire);
  }

  async updateConfig(params: ConfigParams): Promise<UpdateConfigResult> {
    const wireParams = updateConfigRequest.toWireParams(params);
    const result = await this.send(updateConfigRequest.method, wireParams);
    const wire = updateConfigRequest.decode(result);
    return updateConfigRequest.toUpdateConfigResult(wire);
  }

  async getOnboardingState(): Promise<OnboardingPersistedState | null> {
    const result = await this.send(getOnboardingStateRequest.method, {});
    const wire = getOnboardingStateRequest.decode(result);
    return getOnboardingStateRequest.toOnboardingState(wire);
  }

  async setOnboardingState(state: OnboardingPersistedState): Promise<void> {
    const result = await this.send(
      setOnboardingStateRequest.method,
      setOnboardingStateRequest.toWireParams(state),
    );
    setOnboardingStateRequest.decode(result);
  }

  subscribe(handler: NotificationHandler) {
    this.listeners.add(handler);
    return () => {
      this.listeners.delete(handler);
    };
  }

  cancel() {
    this.rejectAll(new Error("Request cancelled"));
    this.process.kill();
    this.process = this.spawnProcess();
  }

  async shutdown() {
    if (this.disposed) return;

    this.disposed = true;
    this.rejectAll(new Error("Backend was shut down"));
    this.process.stdin.end();
    await this.process.exited;
  }

  private spawnProcess(): BackendProcess {
    const proc = spawnBackend();

    void proc.exited.then(() => {
      if (proc === this.process) {
        this.rejectAll(new Error("Backend process exited"));
      }
    });

    this.readResponses(proc);

    return proc;
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

  private async readResponses(proc: BackendProcess) {
    const reader = proc.stdout.getReader();
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
            if (proc === this.process) {
              this.handleMessage(msg);
            }
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
