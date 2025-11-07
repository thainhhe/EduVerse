// src/utils/ToastHelper.ts
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const ToastHelper = {
    success: (message, data) => {
        console.log("✅ Success:", data || message);
        toast.success(message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
        });
    },

    error: (message, data) => {
        console.error("❌ Error:", data || message);
        toast.error(message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
        });
    },

    info: (message, data) => {
        console.log("ℹ️ Info:", data || message);
        toast.info(message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
        });
    },

    warning: (message, data) => {
        console.warn("⚠️ Warning:", data || message);
        toast.warning(message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
        });
    },
};
