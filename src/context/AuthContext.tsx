// // /src/context/AuthContext.tsx
// "use client";
// import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";

// interface User {
//   user_id: number;
//   name: string;
//   email: string;
//   role?: string;
// }

// interface AuthContextType {
//   user: User | null;
//   login: (email: string, password: string, isAdmin?: boolean) => Promise<void>;
//   logout: () => void;
//   isAuthenticated: boolean;
//   loading: boolean;
//   error: string | null;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// function isApiUser(data: any): data is User {
//   if (!data) {
//     console.error("No data received");
//     return false;
//   }

//   const isValid = (
//     typeof data?.user_id === 'number' &&
//     typeof data?.name === 'string' &&
//     typeof data?.email === 'string'
//   );

//   if (!isValid) {
//     console.error("Invalid user data structure:", {
//       received: data,
//       expected: {
//         user_id: "number",
//         name: "string",
//         email: "string",
//         role: "optional string"
//       }
//     });
//   }

//   return isValid;
// }

// export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();
//   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

//   const fetchUserData = async (token: string) => {
//     if (!token) {
//       console.warn("No token provided to fetchUserData");
//       setUser(null);
//       return;
//     }

//     try {
//       console.log("Fetching user data from", `${API_URL}/users/me`);
//       const response = await fetch(`${API_URL}/users/me`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         credentials: 'include',
//       });

//       if (!response.ok) {
//         console.error("fetchUserData failed", { status: response.status });
//         if (response.status === 401) {
//           localStorage.removeItem("token");
//           localStorage.removeItem("refresh_token");
//           setUser(null);
//           throw new Error("Session expired, please login again");
//         }
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const userData = await response.json();
//       console.log("Received user data:", userData);
      
//       if (!isApiUser(userData)) {
//         console.error("Invalid user data structure");
//         throw new Error("Invalid user data structure received from server");
//       }

//       setUser({
//         user_id: userData.user_id,
//         name: userData.name,
//         email: userData.email,
//         role: userData.role,
//       });
//       console.log("User data set successfully");
//     } catch (err) {
//       console.error("Error fetching user data:", err);
//       throw new Error(
//         `Failed to fetch user data: ${err instanceof Error ? err.message : String(err)}`
//       );
//     }
//   };

//   useEffect(() => {
//     const initializeAuth = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (token) {
//           await fetchUserData(token);
//         }
//       } catch (err) {
//         console.error("Auth initialization error:", err);
//         localStorage.removeItem("token");
//         localStorage.removeItem("refresh_token");
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     const timeout = setTimeout(() => {
//       if (loading) {
//         console.warn("Auth initialization timed out");
//         setLoading(false);
//         setError("Authentication timed out");
//       }
//     }, 10000);

//     initializeAuth();
//     return () => clearTimeout(timeout);
//   }, []);

//   const login = async (email: string, password: string, isAdmin: boolean = false) => {
//     setLoading(true);
//     setError(null);
//     console.log("Starting login process", { email, isAdmin });

//     try {
//       const endpoint = "/auth/login";
//       console.log("Sending login request to", `${API_URL}${endpoint}`);
//       const res = await fetch(`${API_URL}${endpoint}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await res.json();
//       console.log("Login response:", data);

//       if (!res.ok) {
//         console.error("Login request failed", { status: res.status, data });
//         throw new Error(data.message || "Login failed");
//       }

//       const token = data.access_token || data.token;
//       if (!token) {
//         console.error("No token in response", data);
//         throw new Error("No authentication token received");
//       }

//       localStorage.setItem("token", token);
//       if (data.refresh_token) {
//         localStorage.setItem("refresh_token", data.refresh_token);
//       }
//       console.log("Token stored", { token });

//       console.log("Fetching user data with token");
//       await fetchUserData(token);
      
//       console.log("User data set, navigating to dashboard");
//       toast.success("Logged in successfully");
      
//       const redirectPath = "/customer/dashboard";
//       console.log("Attempting navigation to", redirectPath);
//       router.replace(redirectPath);
//       router.refresh();
//       console.log("Navigation initiated");
//     } catch (err) {
//       const errorMessage = err instanceof Error ? err.message : "Login failed";
//       console.error("Login error:", err);
//       setError(errorMessage);
//       toast.error(errorMessage);
//       throw err;
//     } finally {
//       console.log("Login process complete, setting loading to false");
//       setLoading(false);
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("refresh_token");
//     setUser(null);
//     router.push("/");
//     toast.success("Logged out successfully");
//   };

//   const isAuthenticated = !!user;

//   if (loading) {
//     return <div className="flex justify-center items-center h-screen">Loading...</div>;
//   }

//   return (
//     <AuthContext.Provider value={{ 
//       user, 
//       login, 
//       logout, 
//       isAuthenticated, 
//       loading,
//       error
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error("useAuth must be used within an AuthProvider");
//   return context;
// };