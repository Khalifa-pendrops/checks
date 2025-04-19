import User from "../model/user.model.js";
import AppError from "../utils/appError.js";
import { createToken } from "../utils/auth.js";
class UserServices {
    async registerUser(userData) {
        const newUser = await User.create({
            name: userData.name,
            email: userData.email,
            password: userData.password,
            passwordConfimr: userData.passwordConfirm,
            role: userData.role,
            languagePreference: userData.languagePreference || "en",
        });
        return newUser;
    }
    async loginUser(email, password) {
        // 1) Check if email and password exist
        if (!email || !password) {
            throw new AppError("📛 Please provide email and password", 400);
        }
        // 2) Include role in the select statement
        const user = (await User.findOne({ email }).select("+password +role"));
        if (!user || !(await user.comparePassword(password))) {
            throw new AppError("🚫 Incorrect login credentials", 401);
        }
        // 3) Pass both id and role to createToken
        const token = createToken(user._id, user.role);
        // Debug log to verify token generation
        console.log("Generated token payload:", {
            id: user._id,
            role: user.role,
        });
        return { user, token };
    }
    async getUserById(id) {
        return User.findById(id);
    }
    async updateUser(id, updateData) {
        return User.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
    }
    async deleteUser(id) {
        await User.findByIdAndUpdate({ id, active: false });
    }
}
export default new UserServices();
