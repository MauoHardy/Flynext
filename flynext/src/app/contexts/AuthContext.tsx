"use client";
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { User } from "@prisma/client"; // Use Prisma's User type

// Only extend User with properties not in the schema
type UserWithoutPassword = Omit<User, "password"> & {
  ownedHotels?: Array<{ id: string; name: string }>;
};

interface AuthContextType {
  user: UserWithoutPassword | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserWithoutPassword | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Function to refresh tokens and session
  const refreshSession = async (): Promise<boolean> => {
    try {
      console.log("Attempting to refresh session");
      
      // Get the refresh token from localStorage if available
      const storedRefreshToken = localStorage.getItem("refreshToken");
      
      if (!storedRefreshToken) {
        console.log("No refresh token available");
        return false;
      }
      
      console.log("Sending refresh request with token:", storedRefreshToken.substring(0, 10) + "...");
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
        credentials: "include",
        cache: "no-store",
      });
      
      if (!response.ok) {
        console.log("Token refresh failed with status:", response.status);
        // Clear invalid data
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("user");
        localStorage.removeItem("refreshToken");
        return false;
      }
      
      const data = await response.json();
      console.log("Refresh response data:", data);
      
      if (data.user) {
        console.log("Session refreshed successfully");
        setUser(data.user);
        setIsAuthenticated(true);
        
        // Safely store user data and refresh token
        try {
          localStorage.setItem("user", JSON.stringify(data.user));
          if (data.refreshToken) {
            localStorage.setItem("refreshToken", data.refreshToken);
          }
        } catch (err) {
          console.error("Error storing auth data:", err);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error refreshing session:", error);
      return false;
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (typeof window === "undefined") return;

      try {
        console.log("Checking auth status on mount");
        
        // First check for stored user (faster UI response)
        try {
          const storedUser = localStorage.getItem("user");
          
          if (storedUser && storedUser !== "undefined") {
            const parsedUser = JSON.parse(storedUser);
            
            // Validate the user object has necessary fields
            if (parsedUser && parsedUser.id && parsedUser.email) {
              setUser(parsedUser);
              setIsAuthenticated(true);
            } else {
              localStorage.removeItem("user");
            }
          }
        } catch (e) {
          console.error("Error parsing stored user:", e);
          localStorage.removeItem("user");
        }
        
        // Then verify with server (might update UI if storage was stale)
        const response = await fetch("/api/auth/status", { 
          credentials: "include",
          cache: "no-store",
        });
        
        if (!response.ok) {
          throw new Error("Status check failed");
        }
        
        const data = await response.json();
        
        if (data.isAuthenticated) {
          // Server confirms authentication, get fresh profile data
          try {
            const profileResponse = await fetch("/api/profile", { 
              credentials: "include",
              cache: "no-store",
            });
            
            if (profileResponse.ok) {
              const userData = await profileResponse.json();
              
              if (userData && userData.id) {
                setUser(userData);
                setIsAuthenticated(true);
                localStorage.setItem("user", JSON.stringify(userData));
              } else {
                throw new Error("Invalid profile data");
              }
            } else {
              throw new Error("Failed to fetch profile");
            }
          } catch (error) {
            console.error("Error fetching profile:", error);
            // Try refreshing the session as a fallback
            const refreshed = await refreshSession();
            if (!refreshed) {
              setUser(null);
              setIsAuthenticated(false);
              localStorage.removeItem("user");
              localStorage.removeItem("refreshToken");
            }
          }
        } else {
          // Not authenticated according to server - try refreshing
          const refreshed = await refreshSession();
          if (!refreshed) {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem("user");
            localStorage.removeItem("refreshToken");
          }
        }
      } catch (error) {
        console.error("Auth status check error:", error);
        
        // Try to refresh as a last resort
        const refreshed = await refreshSession();
        if (!refreshed) {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem("user");
          localStorage.removeItem("refreshToken");
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
    
    // Set up a timer to periodically refresh the session
    const refreshTimer = setInterval(() => {
      if (isAuthenticated) {
        console.log("Performing scheduled token refresh");
        refreshSession().catch(console.error);
      }
    }, 15 * 60 * 1000); // Refresh every 15 minutes if authenticated
    
    return () => {
      clearInterval(refreshTimer); // Clean up timer on unmount
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Important for cookie handling
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || "Login failed");
      }

      const responseData = await response.json();
      console.log("Login response:", responseData);

      // Validate the response data
      if (!responseData.user) {
        throw new Error("No user data received from server");
      }

      // Safely store user data and refresh token
      try {
        localStorage.setItem("user", JSON.stringify(responseData.user));
        if (responseData.refreshToken) {
          localStorage.setItem("refreshToken", responseData.refreshToken);
        }
      } catch (err) {
        console.error("Error storing auth data:", err);
      }

      // Update state
      setUser(responseData.user);
      setIsAuthenticated(true);

      // Redirect after UI update
      setTimeout(() => {
        router.push("/"); // Use router instead of window.location for better Next.js integration
        router.refresh();
      }, 300);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
        credentials: "include",
        cache: "no-store",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Signup failed");
      }

      const data = await response.json();

      // Safely store user data and refresh token
      try {
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }
      } catch (err) {
        console.error("Error storing auth data:", err);
      }

      // Update state
      setUser(data.user);
      setIsAuthenticated(true);
      
      // Redirect after UI update using full page navigation
      setTimeout(() => {
        window.location.href = "/";
      }, 300);
      
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
      
      // Clear all auth data
      try {
        localStorage.removeItem("user");
        localStorage.removeItem("refreshToken");
      } catch (err) {
        console.error("Error clearing auth data:", err);
      }
      
      // Update state
      setUser(null);
      setIsAuthenticated(false);
      
      // Redirect using full page navigation
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        signup,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

