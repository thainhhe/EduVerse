import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { FaCheckCircle, FaPlayCircle, FaFileAlt, FaStar } from "react-icons/fa";

// Dữ liệu giả lập, bạn sẽ thay thế bằng API call
const courseData = {
  id: 1,
  title: "Mastering Advanced React: Hooks, Context & Performance",
  instructor: {
    name: "Dr. Evelyn Reed",
    title: "Senior Frontend Developer",
    avatar: "/professional-woman-diverse.png",
  },
  price: 99.99,
  rating: 4.8,
  reviewsCount: 120,
  whatYoullLearn: [
    "Master advanced React Hooks for state management.",
    "Utilize the Context API for efficient state propagation.",
    "Optimize React components for maximum performance.",
    "Implement advanced patterns for reusable components.",
  ],
  overview:
    "This course is designed for React developers looking to deepen their understanding of advanced concepts. We'll explore powerful features like Hooks, Context API, and performance optimization techniques to build scalable and efficient applications.",
  curriculum: [
    {
      title: "Intro to the Course",
      lessons: [{ title: "Course Overview", type: "video", duration: "2 min" }],
    },
    {
      title: "React Hooks in-depth",
      lessons: [
        { title: "useState and useEffect", type: "video", duration: "15 min" },
        {
          title: "useContext and useReducer",
          type: "video",
          duration: "20 min",
        },
        { title: "Custom Hooks", type: "document", duration: "10 min read" },
      ],
    },
  ],
  reviews: [
    {
      id: 1,
      name: "Alice",
      avatar: "/student-woman.png",
      rating: 5,
      text: "Excellent course! The instructor explains complex topics clearly.",
    },
    {
      id: 2,
      name: "Bob",
      avatar: "/student-man.jpg",
      rating: 4,
      text: "Very helpful for advancing my React skills. Highly recommended.",
    },
  ],
  discussion: [
    {
      id: 1,
      author: { name: "Mr A", avatar: "/student-man-2.jpg" },
      date: "May 12, 2024, 2:30 PM",
      text: "Just finished the module on useCallback. When should I prioritize memoizing functions versus just letting them re-render if the performance impact is minimal?",
    },
    {
      id: 2,
      author: {
        name: "Dr. Evelyn Reed",
        avatar: "/professional-woman-diverse.png",
      },
      date: "May 12, 2024, 3:00 PM",
      text: "Great question, David! It's generally a balance. Start by measuring. If you identify a re-render bottleneck, then apply memoization. Over-optimization can lead to more complex code without significant gains.",
    },
  ],
};

const CourseDetail = () => {
  const { id } = useParams();

  // TODO: Fetch course data from API using the 'id'
  const course = courseData; // Using mock data for now

  if (!course) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {course.title}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                A comprehensive guide to building high-performance React
                applications.
              </p>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1 text-yellow-500">
                  <FaStar />
                  <span className="font-bold text-gray-800">
                    {course.rating}
                  </span>
                </div>
                <p className="text-gray-600">({course.reviewsCount} reviews)</p>
                <p className="text-gray-600">
                  Taught by{" "}
                  <span className="font-semibold text-indigo-600">
                    {course.instructor.name}
                  </span>
                </p>
              </div>
            </section>

            <Card>
              <CardHeader>
                <CardTitle>What You'll Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                  {course.whatYoullLearn.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <FaCheckCircle className="text-indigo-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <section>
              <h2 className="text-2xl font-bold mb-4">Course Overview</h2>
              <p className="text-gray-700 leading-relaxed">{course.overview}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Course Curriculum</h2>
              <div className="space-y-4">
                {course.curriculum.map((section, index) => (
                  <div key={index} className="border rounded-lg">
                    <h3 className="font-semibold p-4 bg-gray-100 rounded-t-lg">
                      {section.title}
                    </h3>
                    <ul className="divide-y">
                      {section.lessons.map((lesson, lessonIndex) => (
                        <li
                          key={lessonIndex}
                          className="flex items-center justify-between p-4 hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            {lesson.type === "video" ? (
                              <FaPlayCircle className="text-gray-500" />
                            ) : (
                              <FaFileAlt className="text-gray-500" />
                            )}
                            <span className="text-gray-800">
                              {lesson.title}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {lesson.duration}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Student Reviews</h2>
              <div className="space-y-6">
                {course.reviews.map((review) => (
                  <div key={review.id} className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={review.avatar} alt={review.name} />
                      <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{review.name}</h4>
                      <div className="flex items-center gap-1 text-yellow-500 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={
                              i < review.rating
                                ? "text-yellow-500"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                      <p className="text-gray-700">{review.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* COURSE DISCUSSION SECTION */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Course Discussion</h2>

              {/* Form đăng bình luận */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">
                      Post a Question or Comment
                    </h3>
                    <Textarea
                      placeholder="Type your question or comment here..."
                      rows={4}
                    />
                    <div className="flex justify-end">
                      <Button>Post Comment</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Danh sách bình luận */}
              <div className="space-y-6">
                {course.discussion.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="pt-6 flex gap-4">
                      <Avatar>
                        <AvatarImage
                          src={comment.author.avatar}
                          alt={comment.author.name}
                        />
                        <AvatarFallback>
                          {comment.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {comment.author.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 sm:mt-0">
                            {comment.date}
                          </p>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {comment.text}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
            {/*  END OF COURSE DISCUSSION SECTION  */}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-3xl">${course.price}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  size="lg"
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  Enroll Now
                </Button>
                <Button size="lg" variant="outline" className="w-full">
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
