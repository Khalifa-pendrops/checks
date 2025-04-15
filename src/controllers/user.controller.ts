import { Request, Response } from "express";
import userService from "../services/user.service.js";
import AppError from "../utils/appError.js";
import { asyncHandler } from "../utils/apiFeatures.js";
import { IUser } from "../interfaces/user.interface.js";
import { AuthenticatedRequest } from "../types/custom.js";

class UserController {
  signup = asyncHandler(async (req: Request, res: Response) => {
    console.log("✅ signup controller hit");

    const newUser: Partial<IUser> = await userService.registerUser(req.body);

    //do not include password,word in output
    newUser.password = undefined;

    res.status(201).json({
      status: "Success 🎉",
      message: "User signed up successfully ✅",
      data: {
        user: newUser,
      },
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { user, token } = await userService.loginUser(email, password);

    res.status(200).json({
      status: "Success",
      message: "User logged in successfully 🎉",
      token,
      data: {
        user,
      },
    });
  });

  getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await userService.getUserById(req.user._id);

    res.status(200).json({
      status: "Success",
      message: "This user has been fetched successfully 😉",
      data: {
        user,
      },
    });
  });

  updateMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // try to create an error should the user POST password data
    if (req.body.password || req.body.passwordConfirm) {
      throw new AppError(
        "This route is not for password update. Please use /updateMyPassword.",
        400
      );
    }

    //filter out unwanted fields names that are not allowed to be updated
    const filterBody = {
      name: req.body.name,
      email: req.body.email,
      languagePreference: req.body.languagePreference,
    };

    //now update the user document
    const updateUser = await userService.updateUser(req.user._id, filterBody);

    res.status(200).json({
      status: "Success",
      message: "User updated successfully ✅",
      data: {
        user: updateUser,
      },
    });
  });

  deleteMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await userService.deleteUser(req.user._id);

    res.status(204).json({
      status: "Success",
      message: "Ouch! User deleted 😞",
      data: null,
    });
  });
}

export default new UserController();
