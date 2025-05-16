"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

// Define allowed roles type
export type UserRole = "ADMIN" | "AGENT" | "USER";

// Define JWT payload type
interface JwtPayload {
  role: UserRole;
  exp: number;
  [key: string]: unknown; // For other possible properties
}

export function useAuth(requiredRole?: UserRole) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [decodedToken, setDecodedToken] = useState<JwtPayload | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const getRoleLoginPath = (role?: string): string => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return "/login/admin";
      case "AGENT": 
        return "/login/agent";
      case "USER":
        return "/login/customer";
      default:
        return "/login";
    }
  };

  const redirectToDashboard = useCallback((role: string) => {
    switch (role) {
      case "ADMIN":
        router.push("/admin");
        break;
      case "AGENT":
        router.push("/agent");
        break;
      case "USER":
        router.push("/customer");
        break;
      default:
        router.push("/");
    }
  }, [router]);

  const login = useCallback(async (email: string, password: string, role?: UserRole) => {
    try {
      setIsLoading(true);
      let endpoint = "";
      
      // Set endpoint based on role
      switch (role) {
        case "ADMIN":
          endpoint = "/admin/login";
          break;
        case "AGENT":
          endpoint = "/agent/login";
          break;
        case "USER":
          endpoint = "/customer/login";
          break;
        default:
          throw new Error("Invalid role specified");
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }

      // Decode token to get role
      const payload = JSON.parse(atob(data.access_token.split(".")[1]));
      setDecodedToken(payload);
      setUserRole(payload.role);
      setIsAuthenticated(true);
      
      // Redirect to appropriate dashboard
      redirectToDashboard(payload.role);
      
      return payload;
    } catch (error) {
      console.error("Login error:", error);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [redirectToDashboard]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    setIsAuthenticated(false);
    setUserRole(null);
    const timeout = refreshTimeoutRef.current;
    if (timeout) clearTimeout(timeout);
    
    // Redirect to appropriate login page based on current route
    if (pathname.startsWith("/admin")) {
      router.push("/login/admin");
    } else if (pathname.startsWith("/agent")) {
      router.push("/login/agent");
    } else if (pathname.startsWith("/customer")) {
      router.push("/login/customer");
    } 
    else {
      router.push("/login");
    }
    
    toast.success("Logged out successfully");
  }, [router, pathname]);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setDecodedToken(payload);
      const isExpired = payload.exp * 1000 < Date.now();
      const currentRole = payload.role;
      
      // Check if user has the required role
      if (requiredRole && currentRole !== requiredRole) {
        console.log(`Role mismatch. Required: ${requiredRole}, Current: ${currentRole}`);
        logout();
        toast.error(`Access denied. ${requiredRole} privileges required.`);
        setIsLoading(false);
        return false;
      }

      if (isExpired) {
        const refreshed = await attemptRefresh();
        if (!refreshed) {
          logout();
          setIsLoading(false);
          return false;
        }
        setIsLoading(false);
        return true;
      }

      // Set user role and authentication state
      setUserRole(currentRole);
      setIsAuthenticated(true);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Error checking auth:", error);
      logout();
      setIsLoading(false);
      return false;
    }
  }, [requiredRole, logout]);

  const attemptRefresh = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) return false;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token);
        }
        
        // Decode and set the new token payload
        const payload = JSON.parse(atob(data.access_token.split(".")[1]));
        setDecodedToken(payload);
        setUserRole(payload.role);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  };

  // Add debug logging
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("Token payload:", payload);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      const isAuthorized = await checkAuth();
      
      if (!isAuthorized && requiredRole) {
        router.push(getRoleLoginPath(requiredRole));
      }
    };
    
    initialize();
    
    const interval = setInterval(checkAuth, 30000);
    const currentTimeout = refreshTimeoutRef.current;
    
    return () => {
      clearInterval(interval);
      if (currentTimeout) {
        clearTimeout(currentTimeout);
      }
    };
  }, [checkAuth, requiredRole, router]);

  return { 
    login, 
    logout, 
    isAuthenticated, 
    userRole,
    checkAuth,
    isLoading,
    decodedToken
  };
}