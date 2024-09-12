import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    //   hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);

    // save to db
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    // console.log(newUser);
    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  // db operations

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // check if the password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    // cookie expiration
    const age = 1000 * 60 * 60 * 24 * 7;

    // res.setHeader("Set-Cookie", "test=" + "my-value").json("success");

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: age }
    );

    res
      .cookie("test2", token, {
        httpOnly: true,
        // secure: true, // if site on production mode then secure the cookie
        maxAge: age,
      })
      .status(200)
      .json({ message: "Login successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error logging in" });
  }
};
export const logout = (req, res) => {
  // db operations
  res.clearCookie("test2").json({ message: "Logged out successfully" });
};
