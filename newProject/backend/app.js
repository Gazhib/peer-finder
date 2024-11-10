/* eslint-disable no-undef */
const express = require("express");
const { default: mongoose } = require("mongoose");
const cors = require("cors");
const app = express();
const bcrypt = require("bcryptjs");
const { userSchema } = require("./schemas.js");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
require("dotenv").config({ path: "../.env" });

const db = process.env.DB_CONNECTION;
const User = mongoose.model("users", userSchema, "users");

async function connectDatabase() {
  await mongoose.connect(db);
  console.log("Connected to database");
}
connectDatabase();


async function hashPassword(password) {
  const salt = 10;
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json("Email is not registered yet");
  }
  const isCorrect = await bcrypt.compare(password, user.password);
  if (!isCorrect) {
    return res.status(401).json("Incorrect password");
  }

  res.status(200).json({ username: user.username, email });
});

app.post("/api/registration", async (req, res) => {
  const { email, username, password, confirmPassword } = req.body;
  if (confirmPassword !== password) {
    return res.status(400).json("Passwords do not match");
  }
  const lowerCaseEmail = email.toLowerCase();
  if (!lowerCaseEmail.endsWith("@nu.edu.kz")) {
    return res.status(409).json("The email is not from NU");
  }
  const user = await User.findOne({ email });
  const usernameChecker = await User.findOne({ username });
  if (user) {
    return res.status(409).json("The email is already registered");
  }

  if (usernameChecker) {
    return res.status(409).json("The username is already registered");
  }

  if (!username || username.trim() === "") {
    return res.status(400).json("Username can not be empty");
  }
  if (!password || password.trim() === "" || password.trim() !== password) {
    return res.status(400).json("Password is irrelevant");
  }

  const hashedPassword = await hashPassword(password);
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });

  await newUser.save();
  res.status(200).json({ username, email });
});

app.post("/api/logout", async (req, res) => {
  res.status(200).json("You logged out successfully");
});

app.put("/update-profile", async (req, res) => {
  const { email, interests, career, yearOfStudy, telegram } = req.body;

  if (!email) {
    return res.status(400).json("Email is required to update profile");
  }

  try {
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { interests, career, yearOfStudy, telegram },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json("User not found");
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json("An error occurred while updating profile");
  }
});

app.get("/profile-info", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json("Email is required to fetch profile info");
  }

  try {
    const user = await User.findOne(
      { email },
      { interests: 1, career: 1, yearOfStudy: 1, telegram: 1, _id: 0 }
    );

    if (!user) {
      return res.status(404).json("User not found");
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error retrieving profile info:", error);
    res.status(500).json("An error occurred while fetching profile info");
  }
});

app.post("/find-matches", async (req, res) => {
  const { interests, career, yearOfStudy, email } = req.body;

  if (!interests || !career || !yearOfStudy) {
    return res
      .status(400)
      .json("All fields (interests, career, yearOfStudy) are required.");
  }

  try {
    const currentUser = await User.findOne({ email });
    if (!currentUser) {
      return res.status(404).json("Current user not found.");
    }
    const likedUsers = currentUser.liked || [];

    const users = await User.find({
      interests: { $in: interests },
      career: { $in: career },
      email: { $ne: email, $nin: likedUsers }, 
    });

    const matches = {
      oneMatch: [],
      twoMatches: [],
      threeOrMoreMatches: [],
    };

    users.forEach((user) => {
      const commonInterests = user.interests.filter((interest) =>
        interests.includes(interest)
      );

      const matchData = {
        username: user.username,
        telegram: user.telegram,
        interests: user.interests,
        career: user.career,
        yearOfStudy: user.yearOfStudy,
        email: user.email,
      };

      if (commonInterests.length === 1) {
        matches.oneMatch.push(matchData);
      } else if (commonInterests.length === 2) {
        matches.twoMatches.push(matchData);
      } else if (commonInterests.length >= 3) {
        matches.threeOrMoreMatches.push(matchData);
      }
    });

    res.status(200).json(matches);
  } catch (error) {
    console.error("Error finding matches:", error);
    res.status(500).json("An error occurred while finding matches.");
  }
});

app.post("/like", async (req, res) => {
  const { likerEmail, likedEmail } = req.body;

  if (!likerEmail || !likedEmail) {
    return res.status(400).json("Both likerEmail and likedEmail are required.");
  }

  try {
    await User.findOneAndUpdate(
      { email: likerEmail },
      { $addToSet: { liked: likedEmail } }
    );

    await User.findOneAndUpdate(
      { email: likedEmail },
      { $addToSet: { wasLiked: likerEmail } }
    );

    res.status(200).json("Successfully liked the user.");
  } catch (error) {
    console.error("Error processing like action:", error);
    res.status(500).json("An error occurred while processing the like action.");
  }
});

app.get("/mutual-likes", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json("Email is required to fetch mutual likes.");
  }

  try {
    const currentUser = await User.findOne({ email });

    if (!currentUser) {
      return res.status(404).json("User not found.");
    }

    const mutualLikes = await User.find({
      email: { $in: currentUser.liked },
      liked: email,
    }).select("username yearOfStudy career interests telegram -_id");

    res.status(200).json(mutualLikes);
  } catch (error) {
    console.error("Error finding mutual likes:", error);
    res.status(500).json("An error occurred while finding mutual likes.");
  }
});

app.listen(3000, () => {
  console.log("Starting server on 3000");
});
