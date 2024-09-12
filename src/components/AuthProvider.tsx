"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

import { useRouter, usePathname } from "next/navigation";
import app from "@/lib/firebase";

const auth = getAuth(app);

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userRole: "admin" | "seller" | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userRole: null,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"admin" | "seller" | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        if (user.email === "rishadkhn@gmail.com") {
          setUserRole("admin");
        } else {
          setUserRole("seller");
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
      if (!user && pathname !== "/" && !pathname?.startsWith("/login")) {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading, userRole }}>
      {children}
    </AuthContext.Provider>
  );
}
