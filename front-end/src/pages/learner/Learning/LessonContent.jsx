import ReactPlayer from "react-player";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageIcon, Send } from "lucide-react";

const LessonContent = ({ lesson, course }) => {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">{lesson.title}</h1>
            <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
                <ReactPlayer
                    url={lesson.videoUrl || "https://www.youtube.com/watch?v=gKDkDa3CfZY"}
                    width="100%"
                    height="100%"
                    controls
                />
            </div>
            <Tabs defaultValue="discussion" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    {/* <TabsTrigger value="discussion">Discussion</TabsTrigger> */}
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                    <TabsTrigger value="transcript">Transcript</TabsTrigger>
                </TabsList>

                <TabsContent value="summary">
                    <p><strong>Mô tả khóa học:</strong> {course.description || "Chưa có mô tả khóa học."}</p>
                </TabsContent>

                {/* <TabsContent value="discussion">
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
                </TabsContent> */}

                <TabsContent value="resources">
                    <p>Tài liệu sẽ hiển thị ở đây.</p>
                </TabsContent>
                <TabsContent value="transcript">
                    <p>Bản ghi lời thoại của video.</p>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default LessonContent;
