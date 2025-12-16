import { useNavigate } from "react-router-dom";
import "./NotFound.css";
import { Button } from "@/components/ui/button";

const NotFound = () => {
    const navigate = useNavigate();
    return (
        <div className="not-found-page">
            <div className="not-found-content">
                <h1>404</h1>
                <h2>Không tìm thấy trang</h2>
                <p>Trang bạn đang tìm kiếm không tồn tại.</p>
                <Button onClick={() => navigate(-1)}>Về trang trước</Button>
            </div>
        </div>
    );
};

export default NotFound;
