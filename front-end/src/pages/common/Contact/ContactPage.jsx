import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe } from "lucide-react";
import { toast } from "react-toastify";

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        toast.success("Message sent successfully! We will get back to you soon.");
        setFormData({ name: "", email: "", subject: "", message: "" });
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 overflow-hidden rounded-3xl shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30"></div>
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight animate-fade-in-up">
                        Get in Touch
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto font-light animate-fade-in-up delay-100">
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as
                        soon as possible.
                    </p>
                </div>
            </div>

            <div className="px-4 -mt-16 pb-20 relative z-20">
                <div className="">
                    {/* Contact Information Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 h-full transform hover:-translate-y-1 transition-transform duration-300">
                            <h3 className="text-2xl text-center font-bold text-gray-800 dark:text-white mb-8 border-b border-gray-100 dark:border-gray-700 pb-4">
                                Contact Information
                            </h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="flex items-start space-x-4 group">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">
                                            Email Us
                                        </p>
                                        <a
                                            href="mailto:support@eduverse.com"
                                            className="text-lg font-semibold text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        >
                                            support@eduverse.com
                                        </a>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            For general inquiries
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4 group">
                                    <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">
                                            Call Us
                                        </p>
                                        <a
                                            href="tel:+1234567890"
                                            className="text-lg font-semibold text-gray-800 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                        >
                                            +1 (555) 123-4567
                                        </a>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Mon-Fri, 9am-6pm EST
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4 group">
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">
                                            Visit Us
                                        </p>
                                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                            123 Education Lane
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            Tech City, TC 90210
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4 group">
                                    <div className="p-3 bg-teal-50 dark:bg-teal-900/30 rounded-lg text-teal-600 dark:text-teal-400 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                                        <Globe className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">
                                            Social Media
                                        </p>
                                        <div className="flex space-x-3 mt-1">
                                            <a
                                                href="#"
                                                className="text-gray-400 hover:text-blue-500 transition-colors"
                                            >
                                                <Globe className="w-5 h-5" />
                                            </a>
                                            <a
                                                href="#"
                                                className="text-gray-400 hover:text-blue-400 transition-colors"
                                            >
                                                <MessageSquare className="w-5 h-5" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
