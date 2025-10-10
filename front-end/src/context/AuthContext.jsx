// import { createContext, useState, useEffect } from "react";
// import { authService } from "@services/authService";
// import { toast } from "react-toastify";

// export const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     checkAuth();
//   }, []);

//   const checkAuth = async () => {
//     try {
//       const token = localStorage.getItem("accessToken");
//       if (token) {
//         const userData = await authService.getCurrentUser();
//         setUser(userData);
//       }
//     } catch (error) {
//       console.error("Auth check failed:", error);
//       localStorage.removeItem("accessToken");
//       localStorage.removeItem("refreshToken");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (email, password) => {
//     try {
//       const response = await authService.login(email, password);
//       const { accessToken, refreshToken, user: userData } = response;

//       localStorage.setItem("accessToken", accessToken);
//       localStorage.setItem("refreshToken", refreshToken);
//       setUser(userData);

//       toast.success("Đăng nhập thành công!");
//       return { success: true };
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Đăng nhập thất bại");
//       return { success: false, error };
//     }
//   };

//   const register = async (userData) => {
//     try {
//       const response = await authService.register(userData);
//       toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
//       return { success: true, data: response };
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Đăng ký thất bại");
//       return { success: false, error };
//     }
//   };

//   const logout = async () => {
//     try {
//       await authService.logout();
//       setUser(null);
//       toast.success("Đăng xuất thành công!");
//     } catch (error) {
//       console.error("Logout failed:", error);
//     }
//   };

//   const updateUser = (userData) => {
//     setUser((prev) => ({ ...prev, ...userData }));
//   };

//   const value = {
//     user,
//     loading,
//     login,
//     register,
//     logout,
//     updateUser,
//     isAuthenticated: !!user,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// ============================
import { createContext, useState, useEffect } from "react";
// authService không còn cần thiết cho việc đăng nhập tĩnh, nhưng giữ lại cho các hàm khác
import { authService } from "@services/authService";
import { toast } from "react-toastify";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tạm thời không gọi checkAuth() vì không có backend
    // checkAuth();
    setLoading(false); // Bỏ qua việc kiểm tra và cho phép ứng dụng chạy ngay
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        // Hàm này sẽ gây lỗi nếu không có backend, nên chúng ta không gọi nó trong useEffect
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } finally {
      setLoading(false);
    }
  };

  // ===== BẮT ĐẦU PHẦN CHỈNH SỬA =====
  const login = async (email, password) => {
    // Giả lập độ trễ của API
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (email === "learner@eduverse.com" && password === "password123") {
      const mockUserData = {
        name: "Test Learner",
        email: "learner@eduverse.com",
        role: "student",
      };

      setUser(mockUserData);

      toast.success("Đăng nhập thành công!");
      return { success: true };
    } else {
      toast.error("Sai email hoặc mật khẩu.");
      return { success: false, error: "Invalid credentials" };
    }
  };
  // ===== KẾT THÚC PHẦN CHỈNH SỬA =====

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      return { success: true, data: response };
    } catch (error) {
      toast.error(error.response?.data?.message || "Đăng ký thất bại");
      return { success: false, error };
    }
  };

  const logout = async () => {
    // Khi không có backend, chỉ cần xóa user state là đủ
    setUser(null);
    toast.success("Đăng xuất thành công!");
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
