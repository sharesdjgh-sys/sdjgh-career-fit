"use client";

import { useEffect, useState } from "react";
import { campusFetch, setCampusToken } from "@/lib/campus-client";

const PARENT = "https://platform.sdjgh-ai.kr";
const TOKEN_KEY = "career-campus-token";

function returnToCampus() {
  const path = window.location.pathname + window.location.search;
  window.location.replace(`${PARENT}/launch/career?path=${encodeURIComponent(path)}`);
}

export default function CampusGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("스마트캠퍼스 계정과 앱 권한을 확인하고 있어요.");

  useEffect(() => {
    const standalone = window.parent === window;
    let active = true;
    let checking = false;
    let launchedWithToken = false;
    async function check() {
      if (!active || checking) return;
      checking = true;
      try {
        const response = await campusFetch("/api/auth/session");
        if (!active) return;
        if (!response.ok) {
          setCampusToken("");
          sessionStorage.removeItem(TOKEN_KEY);
          setReady(false);
          if (standalone) {
            // 플랫폼에서 방금 재발급한 토큰까지 거절되면 재왕복하지 않는다.
            if (launchedWithToken) window.location.replace(PARENT + "/");
            else returnToCampus();
          }
          else window.parent.postMessage({ type: "sso:expired" }, PARENT);
          setNotice("스마트캠퍼스에서 다시 로그인해 주세요.");
        } else { setReady(true); setNotice(""); }
      } catch {
        if (active) { setReady(false); setNotice("권한 확인이 지연되고 있어요. 잠시 후 다시 시도해 주세요."); }
      } finally { checking = false; }
    }
    function receive(event: MessageEvent) {
      if (event.origin !== PARENT || event.source !== window.parent || event.data?.type !== "sso:token") return;
      const token = event.data.token;
      if (typeof token !== "string" || token.length < 20 || token.length > 8192) return;
      setCampusToken(token);
      void check();
    }
    if (standalone) {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const incoming = hash.get("token");
      if (incoming) {
        launchedWithToken = true;
        sessionStorage.setItem(TOKEN_KEY, incoming);
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
      const saved = sessionStorage.getItem(TOKEN_KEY);
      if (saved) { setCampusToken(saved); void check(); }
      else returnToCampus();
    } else {
      window.addEventListener("message", receive);
      window.parent.postMessage({ type: "sso:ready" }, PARENT);
    }
    const timer = window.setInterval(() => { if (!document.hidden) void check(); }, 60_000);
    const onVisible = () => { if (!document.hidden) void check(); };
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      setCampusToken("");
      window.clearInterval(timer);
      window.removeEventListener("message", receive);
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return ready ? <>{children}</> : <main style={{ padding: "3rem", textAlign: "center" }} role="status">{notice}</main>;
}
