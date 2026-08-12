const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from "react";

export function useSubscription() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const me = await db.auth.me();
        setUser(me);
        const subs = await db.entities.Subscription.filter(
          { user_email: me.email, status: "active" },
          "-created_date",
          1
        );
        if (subs.length > 0) {
          const sub = subs[0];
          if (sub.end_date && new Date(sub.end_date) < new Date()) {
            await db.entities.Subscription.update(sub.id, { status: "expired" });
            setSubscription(null);
          } else {
            setSubscription(sub);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { subscription, loading, user };
}