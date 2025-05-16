import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface DecodedToken {
  exp: number;
  role: string;
  [key: string]: unknown;
}

export function useAuth(requiredRole = "AGENT") {
  const router = useRouter();
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/agent-auth/login");
        return false;
      }

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setDecodedToken(payload);
        const isExpired = payload.exp * 1000 < Date.now();
        const hasValidRole = payload.role === requiredRole;

        if (isExpired || !hasValidRole) {
          if (!isRefreshingRef.current) {
            const refreshed = await attemptRefresh();
            if (!refreshed) {
              localStorage.removeItem("token");
              localStorage.removeItem("refresh_token");
              router.push("/agent-auth/login");
              return false;
            }
          }
        }

        if (payload.exp * 1000 - Date.now() < 300000 && !isRefreshingRef.current) {
          await attemptRefresh();
        }

        return true;
      } catch (error) {
        console.error("Error checking auth:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        router.push("/agent-auth/login");
        return false;
      }
    };

    const attemptRefresh = async () => {
      if (isRefreshingRef.current) return false;
      isRefreshingRef.current = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        console.log("Sending refresh token:", refreshToken);
        
        if (!refreshToken) {
          return false;
        }

        const response = await fetch("http://localhost:3001/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Received new tokens:", data);
          localStorage.setItem("token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          
          // Update decoded token with new token payload
          const payload = JSON.parse(atob(data.access_token.split(".")[1]));
          setDecodedToken(payload);
          return true;
        } else {
          console.error("Refresh failed:", await response.json());
          return false;
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
        return false;
      } finally {
        isRefreshingRef.current = false;
      }
    };

    checkAuth();
    const interval = setInterval(checkAuth, 30000);
    return () => clearInterval(interval);
  }, [router, requiredRole]);

  return { decodedToken };
}