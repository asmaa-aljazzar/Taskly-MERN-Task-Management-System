const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import your User model
const User = require('./src/models/User'); // Adjust path if needed

const seedHR = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log('Connected to MongoDB for seeding...');

        // Check if HR already exists
        const existingHR = await User.findOne({ role: "hr" });
        
        if (existingHR) {
            console.log('✅ HR user already exists!');
            console.log('Email:', existingHR.email);
            process.exit(0);
        }

        // Create HR user (matches your schema exactly)
        const hrUser = new User({
            fullName: "HR Administrator",
            email: "hr@taskly.com",
            password: "Admin@123", // Will be hashed by pre-save hook
            phoneNumber: "+1234567890",
            profileImageUrl: "/uploads/default-avatar.jpg",
            role: "hr",
            hireDate: new Date(), // Today's date
            isDeleted: false
        });

        await hrUser.save();
        
        console.log('🎉 HR User Created Successfully!');
        console.log('📧 Email: hr@taskly.com');
        console.log('🔑 Password: Admin@123');
        console.log('👔 Role: HR');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding HR:', error);
        process.exit(1);
    }
};

seedHR();