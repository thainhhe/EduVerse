import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageIcon, Send } from "lucide-react";
import api from "@/services/api";

const LessonContent = ({ lesson, course }) => {
  console.log("lesson", lesson);
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
        else setMaterials([]);
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

      {materials.length > 0 &&
        materials.find(
          (m) => m.type === "video" && m.lessonId === lesson._id
        ) && (
          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
            <iframe
              src={
                materials.find(
                  (m) => m.type === "video" && m.lessonId === lesson._id
                ).url
              }
              width="100%"
              height="100%"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Video bài học"
              style={{ border: "0" }}
            />
          </div>
        )}

      <Tabs defaultValue="discussion" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="discussion">Discussion</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <p>
            <strong>Mô tả bài học:</strong>{" "}
            {lesson.content || "Chưa có mô tả bài học."}
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
                <Input
                  placeholder="Add a public comment..."
                  className="pr-24"
                />
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
          {(() => {
            const documents = materials.filter(
              (item) => item.type !== "video" && item.lessonId === lesson._id
            );

            return documents.length === 0 ? (
              <p>Không có tài liệu nào cho bài học này.</p>
            ) : (
              <div className="space-y-8">
                {documents.map((item) => (
                  <div
                    key={item._id}
                    className="border rounded-lg p-4 bg-white shadow-sm"
                  >
                    <div className="mb-3 flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <p className="text-sm text-gray-600">
                          {item.description}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500 text-right">
                        <div>
                          {item.fileSize &&
                            (item.fileSize / 1024 / 1024).toFixed(2)}{" "}
                          MB
                        </div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          Mở tab mới ↗
                        </a>
                      </div>
                    </div>

                    {/* Embedded document preview */}
                    <div className="w-full h-[500px] bg-gray-100 rounded border overflow-hidden">
                      <iframe
                        src={item.url}
                        width="100%"
                        height="100%"
                        title={item.title}
                        style={{ border: "none" }}
                        allow="autoplay; encrypted-media"
                      ></iframe>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </TabsContent>

        <TabsContent value="transcript">
          <p>Bản ghi lời thoại của video.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LessonContent;
