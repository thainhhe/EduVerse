import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FaArrowRight } from "react-icons/fa";

const InstructorsSection = ({ instructors }) => {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Meet Our Expert Instructors
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {instructors.map((instructor) => (
            <Card
              key={instructor.id}
              className="text-center hover:shadow-lg transition-shadow"
            >
              <CardContent className="pt-8 pb-6">
                <img
                  src={instructor.avatar || "/placeholder.svg"}
                  alt={instructor.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-lg font-semibold mb-1">
                  {instructor.name}
                </h3>
                <p className="text-sm text-indigo-600">{instructor.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>
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
