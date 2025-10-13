const BenefitsSection = ({ benefits }) => {
  return (
    <section className="py-16 md:py-20 bg-[#f8f8ff]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Benefits of Learning with Us
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white text-center p-8 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="flex justify-center items-center mb-4 text-pink-500 text-4xl h-12 w-12 mx-auto">
                {benefit.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-500 text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
