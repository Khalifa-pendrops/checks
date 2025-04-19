import mongoose, { Types } from "mongoose"; //this should fix the error on user._Id below on the login block
import User from "../model/user.model.js";
import { IUser, IUserInput } from "../interfaces/user.interface.js";
import AppError from "../utils/appError.js";
import { createToken } from "../utils/auth.js";

class UserServices {
  async registerUser(userData: IUserInput): Promise<IUser> {
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

  async loginUser(
    email: string,
    password: string
  ): Promise<{ user: IUser; token: string }> {
    // 1) Check if email and password exist
    if (!email || !password) {
      throw new AppError("📛 Please provide email and password", 400);
    }

    // 2) Include role in the select statement
    const user = (await User.findOne({ email }).select(
      "+password +role"
    )) as IUser & {
      _id: Types.ObjectId;
    };

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

  async getUserById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  async updateUser(
    id: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async deleteUser(id: string): Promise<void> {
    await User.findByIdAndUpdate({ id, active: false });
  }
}

export default new UserServices();
