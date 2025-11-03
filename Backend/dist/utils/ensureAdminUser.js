"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAdminUser = ensureAdminUser;
const User_1 = require("../models/User");
async function ensureAdminUser() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) {
        console.warn("⚠️ ADMIN_EMAIL or ADMIN_PASSWORD not set in .env");
        return;
    }
    let admin = await User_1.User.findOne({ email: adminEmail });
    if (!admin) {
        admin = await User_1.User.create({
            name: "Super Admin",
            email: adminEmail,
            password: adminPassword,
            role: "admin",
        });
        console.log("✅ Default admin created:", admin.email);
    }
    else {
        console.log("✅ Admin exists:", admin.email);
    }
}
