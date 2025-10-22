import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";

const CategoriesSection = ({ categories }) => {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Explore Our Top Categories
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4 text-indigo-600 text-4xl">
                  {category.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button asChild variant="outline" size="lg">
            <Link to="/courses">
              View All Courses <FaArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
