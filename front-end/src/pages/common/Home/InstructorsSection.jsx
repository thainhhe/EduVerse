import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FaArrowRight } from "react-icons/fa";
import userService from "@/services/userService";
import { toast } from "react-toastify";

const InstructorsSection = ({ instructors: propsInstructors, limit = 4 }) => {
  const [instructors, setInstructors] = useState(propsInstructors ?? []);
  const [loading, setLoading] = useState(!propsInstructors);

  useEffect(() => {
    if (propsInstructors) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const res = await userService.getPopularInstructors(limit);
        const data = res?.data?.data ?? res?.data ?? res;
        if (!cancelled) setInstructors(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load instructors", err);
        toast.error("Không thể tải danh sách giảng viên.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [propsInstructors, limit]);

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Meet Our Expert Instructors
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card
                key={i}
                className="text-center p-6 animate-pulse bg-gray-50 hover:shadow-none cursor-default"
              >
                <CardContent className="pt-8 pb-6">
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gray-200" />
                  <div className="h-4 w-3/4 mx-auto bg-gray-200 mb-2 rounded" />
                  <div className="h-3 w-1/2 mx-auto bg-gray-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {instructors.map((instructor) => (
              <Card
                key={
                  instructor.id ??
                  instructor._id ??
                  instructor.email ??
                  Math.random()
                }
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="pt-8 pb-6">
                  <img
                    src={instructor.avatar || "/placeholder.svg"}
                    alt={instructor.name || instructor.username || "Instructor"}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-lg font-semibold mb-1">
                    {instructor.name || instructor.username || instructor.email}
                  </h3>
                  <p className="text-sm text-indigo-600">
                    {instructor.title || instructor.job_title || "Instructor"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button asChild variant="outline" size="lg">
            <Link to="/instructors">
              View All Instructors <FaArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default InstructorsSection;
