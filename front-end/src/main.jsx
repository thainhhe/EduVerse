import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ToastContainer } from "react-toastify";
import App from "./App";
import { AuthProvider } from "@context/AuthContext";
import "react-toastify/dist/ReactToastify.css";
import "./styles/global.css";
import { SystemProvider } from "./context/SystemContext";

import { EnrollmentProvider } from "./context/EnrollmentContext";
import { LoadingProvider } from "./context/LoadingContext";
import ScrollToTop from "@components/layout/ScrollToTop";

import { SocketProvider } from "./context/SocketContext";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <SystemProvider>
                <ScrollToTop />
                <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                        <LoadingProvider>
                            <SocketProvider>
                                <EnrollmentProvider>
                                    <App />
                                    <ToastContainer
                                        position="top-right"
                                        autoClose={2000}
                                        hideProgressBar={false}
                                        newestOnTop={false}
                                        closeOnClick
                                        rtl={false}
                                        pauseOnFocusLoss
                                        draggable
                                        pauseOnHover
                                    />
                                </EnrollmentProvider>
                            </SocketProvider>
                        </LoadingProvider>
                    </AuthProvider>
                </QueryClientProvider>
            </SystemProvider>
        </BrowserRouter>
    </React.StrictMode>
);
