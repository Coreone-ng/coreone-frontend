"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/features/auth/client";
import type { Snapshot } from "@/features/auth/model";
import { sampleContacts, type Contact } from "./model";
import { createDemoState, type DemoState } from "./demo";
import styles from "./Dashboard.module.css";

type Workspace = {
  demo: DemoState;
  setDemo: React.Dispatch<React.SetStateAction<DemoState>>;
  snapshot: Snapshot;
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  bankConnected: boolean;
  setBankConnected: (connected: boolean) => void;
  imported: boolean;
  setImported: (imported: boolean) => void;
};
const Context = createContext<Workspace | null>(null);
export function useWorkspace() {
  const context = useContext(Context);
  if (!context) throw new Error("Workspace provider is required");
  return context;
}
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [demo, setDemo] = useState(createDemoState);
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<Snapshot>();
  const [error, setError] = useState("");
  const [contacts, setContacts] = useState(() =>
    sampleContacts.map((contact) => ({ ...contact })),
  );
  const [bankConnected, setBankConnected] = useState(false);
  const [imported, setImported] = useState(false);
  const checking = useRef(false);
  const check = useCallback(async () => {
    if (checking.current) return;
    checking.current = true;
    try {
      const data = await loadSession();
      setError("");
      if (!data.user) {
        setSnapshot(undefined);
        router.replace(data.pending ? "/onboarding/verify" : "/sign-in");
        return;
      }
      if (!data.user.email_verified || !data.user.phone_verified) {
        setSnapshot(undefined);
        router.replace("/onboarding/verify");
        return;
      }
      setSnapshot(data);
    } catch {
      setError("We couldn’t check your session. Please retry.");
    } finally {
      checking.current = false;
    }
  }, [router]);
  useEffect(() => {
    void check();
    const focus = () => {
      if (document.visibilityState === "visible") void check();
    };
    window.addEventListener("focus", focus);
    const timer = setInterval(focus, 240000);
    return () => {
      window.removeEventListener("focus", focus);
      clearInterval(timer);
    };
  }, [check]);
  if (!snapshot?.user || error)
    return (
      <main id="main-content" className={styles.sessionGate}>
        <img
          src="/assets/brand/coreone.svg"
          width="147"
          height="30"
          alt="CoreOne"
        />
        <p role={error ? "alert" : "status"}>
          {error || "Checking your account…"}
        </p>
        {error && (
          <button className={styles.button} onClick={() => void check()}>
            Try again
          </button>
        )}
        <a href="/sign-in">Back to sign in</a>
      </main>
    );
  return (
    <Context.Provider
      value={{
        demo,
        setDemo,
        snapshot,
        contacts,
        setContacts,
        bankConnected,
        setBankConnected,
        imported,
        setImported,
      }}
    >
      {children}
    </Context.Provider>
  );
}
