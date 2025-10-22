import { toast } from "react-toastify";

/**
 * Hiển thị toast thông báo thành công
 * @param {string} message
 */
export const notifySuccess = (message) => {
  toast.success(message, {
    autoClose: 3000,
    pauseOnHover: true,
  });
};

/**
 * Hiển thị toast thông báo lỗi
 * @param {string} message
 */
export const notifyError = (message) => {
  toast.error(message, {
    autoClose: 3000,
    pauseOnHover: true,
  });
};

/**
 * Hiển thị toast xác nhận trước khi thực hiện hành động
 * Trả về Promise<boolean> để bạn dùng await
 * @param {string} message
 * @returns {Promise<boolean>}
 */
export const confirmAction = (message) => {
  return new Promise((resolve) => {
    const id = toast.info(
      <div className="flex flex-col gap-2">
        <span>{message}</span>
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={() => {
              toast.dismiss(id);
              resolve(true);
            }}
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            Yes
          </button>
          <button
            onClick={() => {
              toast.dismiss(id);
              resolve(false);
            }}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            No
          </button>
        </div>
      </div>,
      {
        autoClose: false, // Không tự đóng
        closeOnClick: false,
        closeButton: false,
      }
    );
  });
};
