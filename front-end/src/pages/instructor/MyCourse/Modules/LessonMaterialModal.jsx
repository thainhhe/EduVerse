import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import api from "@/services/api";

const LessonMaterialModal = ({ open, onOpenChange, lessonId }) => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!lessonId) return;
        const fetchData = async () => {
            try {
                const res = await api.get(`/material/${lessonId}`);
                if (res.success) setMaterials(res.data);
            } catch (error) {
                console.error("Lỗi lấy materials:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [lessonId]);
    console.log("materrial", materials)
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl p-6 overflow-y-auto max-h-[80vh]">
                <h2 className="text-lg font-semibold mb-4">Lesson Materials</h2>

                {loading ? (
                    <p>Loading...</p>
                ) : materials.length === 0 ? (
                    <p>No materials found.</p>
                ) : (
                    <div className="space-y-4">
                        {materials.map((item) => (
                            <div key={item._id} className="border p-3 rounded-lg">
                                <h3 className="font-medium">{item.title}</h3>
                                <p className="text-sm text-gray-600 mb-2">
                                    {item.description}
                                </p>
                                {item.type === "video" ? (
                                    <iframe
                                        src={item.url}
                                        className="w-full aspect-video rounded-lg border"
                                        allowFullScreen
                                    />
                                ) : (
                                    <iframe
                                        src={item.url}
                                        className="w-full h-[500px] rounded-lg border"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default LessonMaterialModal;
