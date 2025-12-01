const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcryptjs");

// Load env vars
dotenv.config({ path: path.join(__dirname, "../.env") });

// Import Models
const User = require("./models/User");
const Category = require("./models/Category");
const Course = require("./models/Course");
const Module = require("./models/Module");
const Lesson = require("./models/Lesson");
const Enrollment = require("./models/Enrollment");
const Review = require("./models/Review");
const Payment = require("./models/Payment");

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected for Seeding");
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();

    try {
        console.log("Clearing existing data...");
        await User.deleteMany({});
        await Category.deleteMany({});
        await Course.deleteMany({});
        await Module.deleteMany({});
        await Lesson.deleteMany({});
        await Enrollment.deleteMany({});
        await Review.deleteMany({});
        await Payment.deleteMany({});

        const hashedPassword = await bcrypt.hash("123456", 10);

        console.log("Creating Users...");
        const users = [];

        // Create Admin
        const admin = await User.create({
            username: "admin",
            email: "admin@eduverse.com",
            password: hashedPassword,
            role: "admin",
            status: "active",
            isSuperAdmin: true,
            avatar: faker.image.avatar(),
        });
        users.push(admin);

        // Create Instructors
        const instructors = [];
        for (let i = 0; i < 5; i++) {
            const instructor = await User.create({
                username: faker.internet.userName(),
                email: faker.internet.email(),
                password: hashedPassword,
                role: "instructor",
                status: "active",
                job_title: "instructor",
                introduction: faker.lorem.paragraph(),
                avatar: faker.image.avatar(),
                phoneNumber: "+849" + faker.string.numeric(8),
            });
            instructors.push(instructor);
        }

        // Create Learners
        const learners = [];
        for (let i = 0; i < 20; i++) {
            const learner = await User.create({
                username: faker.internet.userName(),
                email: faker.internet.email(),
                password: hashedPassword,
                role: "learner",
                status: "active",
                avatar: faker.image.avatar(),
                phoneNumber: "+849" + faker.string.numeric(8),
            });
            learners.push(learner);
        }

        console.log("Creating Categories...");
        const categories = [];
        const categoryNames = ["Programming", "Design", "Business", "Marketing", "Music", "Photography"];
        for (const name of categoryNames) {
            const category = await Category.create({
                name: name,
                description: faker.lorem.sentence(),
            });
            categories.push(category);
        }

        console.log("Creating Courses...");
        const courses = [];
        for (const instructor of instructors) {
            // Each instructor creates 2-4 courses
            const numCourses = faker.number.int({ min: 2, max: 4 });
            for (let i = 0; i < numCourses; i++) {
                const course = await Course.create({
                    title: faker.company.catchPhrase(),
                    description: faker.lorem.paragraphs(2),
                    main_instructor: instructor._id,
                    category: faker.helpers.arrayElement(categories)._id,
                    thumbnail: faker.image.urlLoremFlickr({ category: "education" }),
                    price: faker.number.int({ min: 10, max: 200 }),
                    rating: faker.number.float({ min: 3, max: 5, precision: 0.1 }),
                    status: "approve",
                    isPublished: true,
                    totalEnrollments: 0, // Will update later
                });
                courses.push(course);

                // Create Modules for Course
                const numModules = faker.number.int({ min: 3, max: 6 });
                for (let m = 0; m < numModules; m++) {
                    const module = await Module.create({
                        title: `Module ${m + 1}: ${faker.lorem.words(3)}`,
                        description: faker.lorem.sentence(),
                        courseId: course._id,
                        order: m + 1,
                    });

                    // Create Lessons for Module
                    const numLessons = faker.number.int({ min: 2, max: 5 });
                    for (let l = 0; l < numLessons; l++) {
                        await Lesson.create({
                            moduleId: module._id,
                            title: `Lesson ${l + 1}: ${faker.lorem.words(4)}`,
                            content: faker.lorem.paragraphs(3),
                            order: l + 1,
                            status: "published",
                        });
                    }
                }
            }
        }

        console.log("Creating Enrollments...");
        for (const learner of learners) {
            // Each learner enrolls in 1-3 courses
            const numEnrollments = faker.number.int({ min: 1, max: 3 });
            const enrolledCourses = faker.helpers.arrayElements(courses, numEnrollments);

            for (const course of enrolledCourses) {
                await Enrollment.create({
                    userId: learner._id,
                    courseId: course._id,
                    progress: faker.number.int({ min: 0, max: 100 }),
                    status: "enrolled",
                    enrollmentDate: faker.date.past(),
                });

                // Update course enrollment count
                await Course.findByIdAndUpdate(course._id, { $inc: { totalEnrollments: 1 } });

                // Create a Payment record
                await Payment.create({
                    userId: learner._id,
                    courseId: course._id,
                    amount: course.price,
                    status: "paid",
                    paymentMethod: "credit_card",
                    orderId: faker.string.uuid(),
                    orderCode: faker.string.alphanumeric(10).toUpperCase(),
                    paymentDate: faker.date.past(),
                });

                // Randomly create a review
                if (faker.datatype.boolean()) {
                    await Review.create({
                        userId: learner._id,
                        courseId: course._id,
                        rating: faker.number.int({ min: 3, max: 5 }),
                        comment: faker.lorem.sentence(),
                        createdAt: faker.date.recent(),
                    });
                }
            }
        }

        console.log("Seeding Completed Successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Seeding Error:", err);
        process.exit(1);
    }
};

seedData();
