import { Outlet } from "react-router-dom";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import "./MainLayout.css";

const MainLayout = () => {
    return (
        <div className="main-layout">
            <Header />
            <div className="flex-1 bg-gray-50 w-full">
                <main className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-2">
                    <Outlet />
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default MainLayout;
