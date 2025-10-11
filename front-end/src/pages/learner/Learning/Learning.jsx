// src/pages/learner/Learning/Learning.jsx

import { Link, useParams } from "react-router-dom";
import ReactPlayer from "react-player";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Share,
  Bookmark,
  Check,
  PlayCircle,
  ThumbsUp,
  MessageSquare,
  Image as ImageIcon,
  Send,
} from "lucide-react";

// --- Dữ liệu giả lập ---
const learningData = {
  courseTitle: "UI Design, A User-Centered Approach",
  instructor: "Marc Waeber",
  rating: 4.9,
  reviewsCount: 1595,
  videoUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U", // URL video mẫu
  sessions: [
    { title: "Introduction", completed: true },
    { title: "Mollit vulputate adipiscing", completed: true },
    { title: "Officiis pariatur Lorem sit", completed: true },
    { title: "Asvoluptate adipiscing", completed: false, current: true },
    { title: "Exercitation elit incididunt esse", completed: false },
    { title: "Deserunt pariatur sit aluom", completed: false },
    // Thêm các session khác nếu cần
  ],
  completedCount: 3,
  totalSessions: 12,
  discussions: [
    {
      id: 1,
      user: { name: "User1", avatar: "/student-woman.png" },
      time: "12:02 PM",
      text: "Perfect 3D!",
      replies: [
        {
          id: 2,
          user: { name: "User2", avatar: "/student-man.jpg" },
          time: "02:10 AM",
          text: "very good",
        },
      ],
    },
    {
      id: 3,
      user: { name: "User3", avatar: "/professional-man.jpg" },
      time: "09:20 AM",
      text: "yes",
      isAuthor: true,
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
      replies: [
        {
          id: 4,
          user: { name: "User4", avatar: "/professional-woman-diverse.png" },
          time: "10:50 AM",
          text: "nice 3D",
        },
      ],
    },
  ],
};
// --- Hết dữ liệu giả lập ---

const Learning = () => {
  const { courseId } = useParams();
  // TODO: Dùng courseId để gọi API lấy dữ liệu thật

  return (
    <div className="bg-white py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                <Link to="/dashboard" className="hover:underline">
                  My Courses
                </Link>{" "}
                / In Progress
              </p>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {learningData.courseTitle}
            </h1>
            <p className="text-gray-600 mb-4">
              {learningData.instructor} | ⭐ {learningData.rating} (
              {learningData.reviewsCount} reviews)
            </p>

            <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
              <ReactPlayer
                url={learningData.videoUrl}
                width="100%"
                height="100%"
                controls
              />
            </div>

            <Tabs defaultValue="discussion" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="discussion">Discussion (50)</TabsTrigger>
                <TabsTrigger value="resources">
                  Resources & documents
                </TabsTrigger>
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
              </TabsList>

              <TabsContent value="summary">
                <p>Nội dung tóm tắt khóa học sẽ hiển thị ở đây.</p>
              </TabsContent>

              <TabsContent value="discussion">
                <div className="space-y-6">
                  {/* Input Comment */}
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

                  {/* Comments List */}
                  {learningData.discussions.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={comment.user.avatar} />
                        <AvatarFallback>
                          {comment.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">
                            {comment.user.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {comment.time}
                          </span>
                          {comment.isAuthor && (
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                              Author
                            </span>
                          )}
                        </div>
                        <p className="text-gray-800">{comment.text}</p>
                        {comment.images && (
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {comment.images.map((img, index) => (
                              <div
                                key={index}
                                className="bg-gray-100 rounded aspect-square flex items-center justify-center"
                              >
                                <ImageIcon className="w-8 h-8 text-gray-400" />
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <button className="flex items-center gap-1 hover:text-gray-800">
                            <ThumbsUp className="w-3.5 h-3.5" /> Like
                          </button>
                          <button className="flex items-center gap-1 hover:text-gray-800">
                            <MessageSquare className="w-3.5 h-3.5" /> Reply
                          </button>
                        </div>

                        {/* Replies */}
                        {comment.replies?.map((reply) => (
                          <div
                            key={reply.id}
                            className="flex items-start gap-4 mt-4"
                          >
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={reply.user.avatar} />
                              <AvatarFallback>
                                {reply.user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm">
                                  {reply.user.name}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {reply.time}
                                </span>
                              </div>
                              <p className="text-gray-800">{reply.text}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <button className="flex items-center gap-1 hover:text-gray-800">
                                  <ThumbsUp className="w-3.5 h-3.5" /> Like
                                </button>
                                <button className="flex items-center gap-1 hover:text-gray-800">
                                  <MessageSquare className="w-3.5 h-3.5" />{" "}
                                  Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="text-center">
                    <Button variant="outline">Show more discussion (47)</Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="resources">
                <p>Tài liệu và tài nguyên khóa học sẽ hiển thị ở đây.</p>
              </TabsContent>
              <TabsContent value="transcript">
                <p>Bản ghi lời thoại của video sẽ hiển thị ở đây.</p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Sessions</h2>
              <p className="text-sm text-gray-500">
                {learningData.completedCount}/{learningData.totalSessions}{" "}
                Completed
              </p>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <ul className="divide-y">
                {learningData.sessions.map((session, index) => (
                  <li
                    key={index}
                    className={`p-4 flex items-center justify-between cursor-pointer ${
                      session.current
                        ? "bg-indigo-50 border-l-4 border-indigo-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 font-mono text-sm">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p
                        className={`font-medium ${
                          session.current ? "text-indigo-700" : "text-gray-800"
                        }`}
                      >
                        {session.title}
                      </p>
                    </div>
                    {session.completed ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : session.current ? (
                      <PlayCircle className="w-5 h-5 text-indigo-500" />
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learning;
