"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getUnreadNotificationsCount } from "@/lib/actions/notifications";

interface NotificationContextType {
  unreadCount: number;
  refreshCount: () => Promise<void>;
  decrementCount: () => void;
  resetCount: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  refreshCount: async () => {},
  decrementCount: () => {},
  resetCount: () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [authId, setAuthId] = useState<string | null>(null);
  const supabase = createClient();

  const refreshCount = async () => {
    if (!authId) return;
    const count = await getUnreadNotificationsCount(authId);
    setUnreadCount(count);
  };

  const decrementCount = () => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const resetCount = () => {
    setUnreadCount(0);
  };

  useEffect(() => {
    // Get initial auth user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setAuthId(user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setAuthId(session.user.id);
        } else {
          setAuthId(null);
          setUnreadCount(0);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (authId) {
      refreshCount();
      
      const channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'Notification',
          },
          () => {
            // When any new notification is inserted, refresh the count.
            // (We could filter by customerId if we fetched it, but refreshing is fine for now)
            refreshCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [authId]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshCount, decrementCount, resetCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
