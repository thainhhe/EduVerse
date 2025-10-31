import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FaArrowRight } from "react-icons/fa";

const HeroSection = () => {
  return (
    <section className="flex justify-center items-center py-12 md:min-h-[80vh]">
      <div className="bg-[#f4f4ff] rounded-3xl w-full max-w-7xl flex flex-col lg:flex-row items-center justify-between p-8 md:p-12 shadow-lg">
        <div className="flex-1 text-center lg:text-left lg:pr-12">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-6">
            Eduverse–Learn Anytime,
            <br />
            Anywhere
          </h1>
          <p className="text-lg text-gray-700 mb-8 max-w-xl mx-auto lg:mx-0">
            Unlock your potential with our extensive range of expert-led
            courses. Designed for flexibility, designed for you.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-[#6c63ff] hover:bg-[#554ee6] text-white font-bold text-lg px-8 py-3 rounded-full shadow-none"
          >
            <Link to="/courses">
              Start Learning Now <FaArrowRight className="ml-2 text-xl" />
            </Link>
          </Button>
        </div>
        <div className="flex-1 flex justify-center mt-10 lg:mt-0">
          <img
            src="/students-learning-online-illustration.jpg"
            alt="Students learning"
            className="w-full max-w-sm md:max-w-md h-auto rounded-2xl bg-white"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
