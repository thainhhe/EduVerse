import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageIcon, Send } from "lucide-react";
import api from "@/services/api";

const LessonContent = ({ lesson, course }) => {
    console.log("lesson", lesson)
    const [materials, setMaterials] = useState([]);
    // Tạo state nếu muốn đổi video dynamically
    const [videoFileId, setVideoFileId] = useState(
        lesson.videoUrlFileId || "1CjFwqQ-gU4mjyFdQ6LkmIj25GQaVZs3y"
    );
    useEffect(() => {
        if (!lesson._id) return;
        const fetchData = async () => {
            try {
                const res = await api.get(`/material/${lesson._id}`);
                if (res.success) setMaterials(res.data);
            } catch (error) {
                console.error("Lỗi lấy materials:", error);
            } finally {
                // setLoading(false);
            }
        };
        fetchData();
    }, [lesson._id]);
    console.log(materials);

    // Link iframe của Google Drive
    const iframeSrc = `https://drive.google.com/file/d/${videoFileId}/preview`;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">{lesson.title}</h1>

            {/* <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
                {videoFileId ? (
                    <iframe
                        src={iframeSrc}
                        width="100%"
                        height="100%"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        title="Google Drive Video"
                        style={{ border: "0" }}
                    />
                ) : (
                    <p>Vui lòng cung cấp File ID để xem video.</p>
                )}
            </div> */}
            <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
                {materials.length > 0 ? (
                    // Tìm video đầu tiên trong danh sách materials
                    (() => {
                        const videoMaterial = materials.find((m) => m.type === "video");
                        return videoMaterial ? (
                            <iframe
                                src={videoMaterial.url}
                                width="100%"
                                height="100%"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                                title={videoMaterial.title}
                                style={{ border: "0" }}
                            />
                        ) : (
                            <p className="text-white text-center mt-20">
                                Không có video nào cho bài học này.
                            </p>
                        );
                    })()
                ) : (
                    <p className="text-white text-center mt-20">Đang tải video...</p>
                )}
            </div>

            <Tabs defaultValue="discussion" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="discussion">Discussion</TabsTrigger>
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                    <TabsTrigger value="transcript">Transcript</TabsTrigger>
                </TabsList>

                <TabsContent value="summary">
                    <p>
                        <strong>Mô tả khóa học:</strong> {course.description || "Chưa có mô tả khóa học."}
                    </p>
                </TabsContent>

                <TabsContent value="discussion">
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <Avatar>
                                <AvatarImage src="/placeholder-user.jpg" />
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 relative">
                                <Input placeholder="Add a public comment..." className="pr-24" />
                                <div className="absolute top-0 right-0 h-full flex items-center pr-2 gap-2">
                                    <Button variant="ghost" size="icon">
                                        <ImageIcon className="w-5 h-5 text-gray-500" />
                                    </Button>
                                    <Button variant="ghost" size="icon">
                                        <Send className="w-5 h-5 text-gray-500" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="resources">
                    {materials.length === 0 ? (
                        <p>Không có tài liệu nào cho bài học này.</p>
                    ) : (
                        <div className="space-y-4">
                            {materials
                                .filter((item) => item.type !== "video") // 👈 chỉ lấy tài liệu, loại bỏ video
                                .map((item) => (
                                    <div key={item._id} className="border rounded-lg p-3">
                                        <h3 className="font-semibold mb-1">{item.title}</h3>
                                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>

                                        {/* Link mở tài liệu */}
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 underline hover:text-blue-800"
                                        >
                                            📄 Xem / tải tài liệu
                                        </a>

                                        {/* Thông tin thêm */}
                                        <div className="mt-2 text-xs text-gray-500">
                                            <span>Tải lên bởi: {item.uploadedBy}</span> •{" "}
                                            <span>Kích thước: {(item.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </TabsContent>




                <TabsContent value="transcript">
                    <p>Bản ghi lời thoại của video.</p>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default LessonContent;

