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
    // ... existing checks ...

    const user = (await User.findOne({ email }).select(
      "+password"
    )) as IUser & {
      _id: Types.ObjectId;
    };

    if (!user || !(await user.comparePassword(password))) {
      throw new AppError("🚫 Incorrect login credentials", 401);
    }

    // ADD DEBUG LOGS HERE (right before token creation)
    console.log("Creating token with:", {
      userId: user._id,
      secretLength: process.env.JWT_SECRET?.length || "missing",
      expiresIn: process.env.JWT_EXPIRES_IN || "default",
    });

    const token = createToken(user._id);

    // Log the generated token (for debugging only - remove in production)
    console.log("Generated token:", token);

    return { user, token };
  }

  //   async getUsers(id: string): Promise<IUser | null> {
  //     return User.find(id);
  //   }

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
