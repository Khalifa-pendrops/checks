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
    //check if email & password already exist
    if (!email || !password) {
      throw new AppError("⚠️ Please login credentials", 400);
    }

    //here checks if user exists & passord matches user
    const user = (await User.findOne({ email }).select(
      "+password"
    )) as IUser & {
      _id: Types.ObjectId;
    };

    if (!user || !password) {
      throw new AppError("🚫 Incorrect login credentials", 401);
    }

    //if all credentials pass 👍 grant user access via token
    const token = createToken(user._id);
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
