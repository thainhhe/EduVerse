import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FaArrowRight,
  FaLaptopCode,
  FaLanguage,
  FaBriefcase,
  FaPalette,
  FaChartLine,
  FaStar,
  FaComments,
  FaUserGraduate,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import categoryService from "@/services/categoryService";
import { toast } from "react-toastify";

const CategoriesSection = ({ categories }) => {
  const [items, setItems] = useState(categories ?? []);
  const [loading, setLoading] = useState(!categories);

  useEffect(() => {
    if (categories) return; // dùng dữ liệu từ props nếu có
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const res = await categoryService.getAll();
        if (!cancelled) setItems(res.slice(0, 3));
      } catch (err) {
        console.error("Failed to load categories", err);
        toast.error("Không thể tải danh mục. Vui lòng thử lại.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [categories]);

  // helper chọn icon dựa trên title/name trả về React element
  const getIcon = (category) => {
    const key = (category?.title || category?.name || "").toLowerCase();
    if (
      key.includes("dev") ||
      key.includes("code") ||
      key.includes("it") ||
      key.includes("software") ||
      key.includes("programming")
    )
      return <FaLaptopCode className="text-indigo-600 w-12 h-12" aria-hidden />;
    if (key.includes("language") || key.includes("lang"))
      return <FaLanguage className="text-indigo-600 w-12 h-12" aria-hidden />;
    if (key.includes("business") || key.includes("finance") || key.includes("marketing"))
      return <FaBriefcase className="text-indigo-600 w-12 h-12" aria-hidden />;
    if (key.includes("design") || key.includes("ux") || key.includes("ui"))
      return <FaPalette className="text-indigo-600 w-12 h-12" aria-hidden />;
    if (key.includes("data") || key.includes("analytics") || key.includes("ai"))
      return <FaChartLine className="text-indigo-600 w-12 h-12" aria-hidden />;
    if (key.includes("community") || key.includes("forum") || key.includes("discussion"))
      return <FaComments className="text-indigo-600 w-12 h-12" aria-hidden />;
    if (key.includes("student") || key.includes("instructor") || key.includes("teacher"))
      return <FaUserGraduate className="text-indigo-600 w-12 h-12" aria-hidden />;
    return <FaStar className="text-indigo-600 w-12 h-12" aria-hidden />;
  };

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Explore Our Top Categories</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-6 animate-pulse bg-gray-50 hover:shadow-none cursor-default">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded bg-gray-200 mx-auto mb-4" />
                  <div className="h-5 w-3/4 mx-auto bg-gray-200 mb-2 rounded" />
                  <div className="h-4 w-5/6 mx-auto bg-gray-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((category, index) => {
              const iconEl = category.icon ?? getIcon(category);
              return (
                <Card key={category.id ?? index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4 text-indigo-600 text-4xl">{iconEl}</div>
                    <h3 className="text-xl font-semibold mb-2">{category.title ?? category.name}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

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
