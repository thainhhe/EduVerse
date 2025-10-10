import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const Instructors = () => {
  const [instructors] = useState([
    {
      id: 1,
      name: "Instructor 1",
      specialty: "Data Science",
      image: "/female-instructor.png",
    },
    {
      id: 2,
      name: "Instructor 2",
      specialty: "Web Development",
      image: "/male-instructor-with-glasses.jpg",
    },
    {
      id: 3,
      name: "Instructor 3",
      specialty: "Artificial Intelligence",
      image: "/female-instructor-professional.jpg",
    },
    {
      id: 4,
      name: "Instructor 4",
      specialty: "Graphic Design",
      image: "/male-instructor-creative.jpg",
    },
    {
      id: 5,
      name: "Instructor 5",
      specialty: "Cybersecurity",
      image: "/male-instructor-security-expert.jpg",
    },
    {
      id: 6,
      name: "Instructor 6",
      specialty: "Digital Marketing",
      image: "/male-instructor-business.jpg",
    },
    {
      id: 7,
      name: "Instructor 7",
      specialty: "UX/UI Design",
      image: "/female-instructor-designer.jpg",
    },
    {
      id: 8,
      name: "Instructor 8",
      specialty: "Cloud Computing",
      image: "/male-instructor-tech-expert.jpg",
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Featured Instructors
          </h1>
          <p className="text-lg text-gray-600">
            Meet our talented instructors and learn from the best in the field.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {instructors.map((instructor) => (
            <Card
              key={instructor.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="flex flex-col items-center p-6 space-y-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage
                    src={instructor.image || "/placeholder.svg"}
                    alt={instructor.name}
                  />
                  <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold text-gray-900">
                  {instructor.name}
                </h3>
                <Badge className="bg-indigo-600 hover:bg-indigo-700">
                  {instructor.specialty}
                </Badge>
                <Button
                  asChild
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  <Link to={`/instructors/${instructor.id}`}>View Profile</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Instructors;
