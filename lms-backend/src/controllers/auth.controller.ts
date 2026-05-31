import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

const generateAccessAndRefreshTokens = async (userId: string) => {
  const user: any = await User.findById(userId);
  const accessToken = jwt.sign(
    { _id: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: (process.env.ACCESS_TOKEN_EXPIRY || "1d") as any }
  );
  const refreshToken = jwt.sign(
    { _id: user._id },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: (process.env.REFRESH_TOKEN_EXPIRY || "10d") as any }
  );
  return { accessToken, refreshToken };
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: "User with this email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: "Borrower", // Default role
    });

    const createdUser = await User.findById(user._id).select("-password");
    res.status(201).json({ message: "User registered successfully", user: createdUser });
  } catch (error) {
    res.status(500).json({ message: "Error in registering user", error });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user: any = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User does not exist" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid user credentials" });
      return;
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password");

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({ message: "User logged in successfully", user: loggedInUser, accessToken });
  } catch (error) {
    res.status(500).json({ message: "Error in logging in", error });
  }
};

export const logoutUser = async (req: any, res: Response): Promise<void> => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ message: "User logged out successfully" });
};
