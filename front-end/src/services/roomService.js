import api from "./api"; // Import tệp api.js
//

// Dựa trên các route ở back-end
const roomService = {
  // GET /room-meeting/:courseId
  getAllRooms: () => {
    return api.get(`/room-meeting`);
  },
  getRoomsByCourse: (courseId) => {
    return api.get(`/room-meeting/${courseId}`);
  },

  // POST /room-meeting/create
  createRoom: (roomData) => {
    // roomData nên bao gồm { name, courseId, link, createdBy }
    return api.post("/room-meeting/create", roomData);
  },

  // PUT /room-meeting/update/:id
  updateRoom: (roomId, roomData) => {
    // roomData nên bao gồm { name, link }
    return api.put(`/room-meeting/update/${roomId}`, roomData);
  },

  // DELETE /room-meeting/delete/:id
  deleteRoom: (roomId) => {
    return api.delete(`/room-meeting/delete/${roomId}`);
  },
};

export default roomService;
