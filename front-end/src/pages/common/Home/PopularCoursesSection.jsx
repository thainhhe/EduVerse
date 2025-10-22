import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FaArrowRight, FaRegStar } from "react-icons/fa";

const PopularCoursesSection = ({ courses }) => {
  return (
    <section className="py-16 md:py-20 bg-[#f8f8ff]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Popular Courses
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden group transition-shadow hover:shadow-xl"
            >
              <div className="overflow-hidden">
                <img
                  src={course.image || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-t-2xl transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex-1 flex flex-col p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  By {course.instructor}
                </p>
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, index) => {
                    const ratingValue = index + 1;
                    return ratingValue <= course.rating ? (
                      <FaRegStar
                        key={index}
                        className="text-yellow-400 text-base"
                      />
                    ) : (
                      <FaRegStar
                        key={index}
                        className="text-gray-400 text-base"
                      />
                    );
                  })}
                  <span className="ml-2 text-gray-500 text-sm">
                    ({course.students} reviews)
                  </span>
                </div>
                <div className="text-indigo-600 font-bold text-lg mt-auto mb-4 pt-2">
                  {course.price}
                </div>
                <Button
                  asChild
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg shadow-none"
                >
                  <Link to={`/courses/${course.id}`}>
                    Register Now <FaArrowRight className="ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularCoursesSection;
