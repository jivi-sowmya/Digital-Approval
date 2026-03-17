import { useEffect, useMemo, useRef, useState } from "react";
import API from "../services/api";

const POLL_MS = 15000;
const MAX_ITEMS = 20;

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_err) {
    return fallback;
  }
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (_err) {
    // ignore storage errors
  }
}

export default function useEmployeeNotifications() {
  const email = localStorage.getItem("currentUserEmail") || "employee";
  const keyPrefix = `emp_notif_${email}`;
  const listKey = `${keyPrefix}_list`;
  const mapKey = `${keyPrefix}_status_map`;
  const baselineKey = `${keyPrefix}_baseline`;

  const [items, setItems] = useState(() => loadJson(listKey, []));
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    const markBaseline = () => localStorage.setItem(baselineKey, "true");
    const hasBaseline = () => localStorage.getItem(baselineKey) === "true";

    const run = async () => {
      try {
        const res = await API.get("/requests");
        const requests = Array.isArray(res.data) ? res.data : [];
        const prevMap = loadJson(mapKey, {});
        const nextMap = { ...prevMap };
        const nextItems = [];

        requests.forEach((r) => {
          const prevStatus = prevMap[r.id];
          const status = r.status;
          nextMap[r.id] = status;

          if (!hasBaseline()) {
            return;
          }

          if (prevStatus && prevStatus !== status && (status === "Approved" || status === "Rejected")) {
            nextItems.push({
              id: `${r.id}-${status}-${Date.now()}`,
              requestId: r.id,
              title: r.title || r.type || "Request",
              status,
              time: new Date().toISOString(),
              read: false
            });
          }
        });

        if (!hasBaseline()) {
          markBaseline();
        }

        if (nextItems.length > 0) {
          const merged = [...nextItems, ...loadJson(listKey, [])].slice(0, MAX_ITEMS);
          saveJson(listKey, merged);
          setItems(merged);
        }

        saveJson(mapKey, nextMap);
      } catch (_err) {
        // ignore polling failures
      }
    };

    run();
    pollRef.current = setInterval(run, POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [baselineKey, listKey, mapKey]);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutside = (event) => {
      const target = event.target;
      if (rootRef.current && target instanceof Node && !rootRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [isOpen]);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.read).length,
    [items]
  );

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      const updated = items.map((item) => ({ ...item, read: true }));
      setItems(updated);
      saveJson(listKey, updated);
    }
  };

  const clearAll = () => {
    setItems([]);
    saveJson(listKey, []);
    setIsOpen(false);
  };

  return {
    rootRef,
    items,
    unreadCount,
    isOpen,
    toggleOpen,
    clearAll
  };
}
