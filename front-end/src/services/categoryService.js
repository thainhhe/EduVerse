import api from "./api";

export const categoryService = {
  getAll: async () => {
    // backend returns { success, message, data: [...] }
    const endpoints = ["/category"];
    for (const ep of endpoints) {
      try {
        const res = await api.get(ep);
        const body = res?.data ?? res;
        const items = body?.data ?? body;
        if (!Array.isArray(items)) return [];
        return items
          .map((c) => ({
            id: c.id ?? c._id ?? "",
            name: c.name ?? c.title ?? "Untitled",
            description: c.description,
          }))
          .filter((c) => typeof c.id === "string" && c.id.length > 0);
      } catch (err) {
        if (err?.response?.status === 404) continue;
        throw err;
      }
    }
    return [];
  },
};

export default categoryService;
