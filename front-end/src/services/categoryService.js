import api from "./api";

/**
 * Helpers to normalize backend response shapes.
 */
const pickItem = (c) => ({
  id: c.id ?? c._id ?? "",
  name: c.name ?? c.title ?? "Untitled",
  description: c.description ?? "",
  ...c,
});

const normalizeList = (res) => {
  const body = res?.data ?? res;
  const items = body?.data ?? body;
  if (!Array.isArray(items)) return [];
  return items.map(pickItem);
};

const normalizeOne = (res) => {
  const body = res?.data ?? res;
  const item = body?.data ?? body;
  if (!item) return null;
  // sometimes list comes even for single endpoint
  if (Array.isArray(item)) return pickItem(item[0] ?? {});
  return pickItem(item);
};

const categoryService = {
  // GET /category
  getAll: async () => {
    try {
      const res = await api.get("/category");
      return normalizeList(res);
    } catch (err) {
      // bubble up error for caller to handle
      throw err;
    }
  },

  // GET /category/:id
  getById: async (id) => {
    if (!id) return null;
    try {
      const res = await api.get(`/category/${id}`);
      return normalizeOne(res);
    } catch (err) {
      if (err?.response?.status === 404) return null;
      throw err;
    }
  },

  // POST /category
  create: async (payload) => {
    try {
      const res = await api.post("/category", payload);
      return normalizeOne(res);
    } catch (err) {
      throw err;
    }
  },

  // PUT /category/:id
  update: async (id, payload) => {
    if (!id) throw new Error("Missing category id");
    try {
      const res = await api.put(`/category/${id}`, payload);
      return normalizeOne(res);
    } catch (err) {
      throw err;
    }
  },

  // DELETE /category/:id
  remove: async (id) => {
    if (!id) throw new Error("Missing category id");
    try {
      const res = await api.delete(`/category/${id}`);
      const body = res?.data ?? res;
      return body;
    } catch (err) {
      throw err;
    }
  },
};

export default categoryService;
