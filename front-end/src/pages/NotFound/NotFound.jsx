import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Không tìm thấy trang</h2>
        <p>Trang bạn đang tìm kiếm không tồn tại.</p>
        <Link to="/" className="btn btn-primary">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
