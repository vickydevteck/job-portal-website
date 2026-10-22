
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const User = require("./models/User");
const Job = require("./models/Job");
const Application = require("./models/Application");

const {
  authenticateToken,
  requireAdmin,
} = require("./middleware/auth");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = "http://localhost:5173";

// ===============================
// TEST ROUTE
// ===============================
app.get("/", (req, res) => {
  res.send("Job Portal Backend is Running!");
});

// ===============================
// GET ALL JOBS
// ===============================
app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===============================
// ADD JOB (ADMIN ONLY)
// ===============================
app.post(
  "/api/jobs",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const job = new Job(req.body);
      await job.save();

      res.status(201).json({
        message: "Job added successfully",
        job,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// ===============================
// EDIT JOB (ADMIN ONLY)
// ===============================
app.put(
  "/api/jobs/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const allowedFields = [
        "title",
        "company",
        "location",
        "salary",
        "description",
      ];

      const updates = {};

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          message: "Please provide job details to update",
        });
      }

      const updatedJob = await Job.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!updatedJob) {
        return res.status(404).json({
          message: "Job not found",
        });
      }

      res.json({
        message: "Job updated successfully",
        job: updatedJob,
      });
    } catch (error) {
      if (error.name === "CastError") {
        return res.status(400).json({
          message: "Invalid job ID",
        });
      }

      res.status(500).json({ message: error.message });
    }
  }
);

// ===============================
// DELETE JOB (ADMIN ONLY)
// ===============================
app.delete(
  "/api/jobs/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const deletedJob = await Job.findByIdAndDelete(req.params.id);

      if (!deletedJob) {
        return res.status(404).json({
          message: "Job not found",
        });
      }

      // Remove applications associated with this job
      await Application.deleteMany({ jobId: deletedJob._id });

      res.json({
        message: "Job deleted successfully",
        job: deletedJob,
      });
    } catch (error) {
      if (error.name === "CastError") {
        return res.status(400).json({
          message: "Invalid job ID",
        });
      }

      res.status(500).json({ message: error.message });
    }
  }
);

// ===============================
// APPLY FOR A JOB
// ===============================
app.post("/api/jobs/:jobId/apply", async (req, res) => {
  try {
    const { name, email, resume } = req.body;

    if (!name || !email || !resume) {
      return res.status(400).json({
        message: "Name, email and resume are required",
      });
    }

    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const application = new Application({
      jobId: job._id,
      name,
      email,
      resume,
    });

    await application.save();

    res.status(201).json({
      message: "Application submitted successfully!",
      application,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===============================
// GET ALL APPLICATIONS (ADMIN)
// ===============================
app.get(
  "/api/applications",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const applications = await Application.find()
        .populate("jobId", "title company");

      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// ===============================
// SIGNUP
// ===============================
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Signup successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===============================
// LOGIN
// ===============================
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = (email || "").trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(
      password || "",
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT_SECRET is missing in server .env",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===============================
// FORGOT PASSWORD
// ===============================
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    const safeMessage =
      "If an account exists for this email, a reset link will be sent.";

    if (!user) {
      return res.json({ message: safeMessage });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.resetPasswordExpires = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await user.save();

    const resetLink =
      `${FRONTEND_URL}/reset-password?token=${rawToken}`;

    // Local testing only; configure email delivery before deployment.
    console.log("Password reset link:", resetLink);

    res.json({ message: safeMessage });
  } catch (error) {
    console.error("Forgot password error:", error.message);

    res.status(500).json({
      message: "Unable to process password reset request",
    });
  }
});

// ===============================
// RESET PASSWORD
// ===============================
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (
      !token ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        message:
          "Token and a password of at least 8 characters are required",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Reset link is invalid or expired. Request a new link.",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.json({
      message:
        "Password reset successful. Please log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error.message);

    res.status(500).json({
      message: "Unable to reset password",
    });
  }
});

// ===============================
// UPDATE APPLICATION STATUS (ADMIN)
// ===============================
app.put(
  "/api/applications/:id/status",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { status } = req.body;

      const allowedStatuses = [
        "Pending",
        "Selected",
        "Rejected",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid application status",
        });
      }

      const application = await Application.findById(
        req.params.id
      ).populate("jobId", "title company");

      if (!application) {
        return res.status(404).json({
          message: "Application not found",
        });
      }

      const oldStatus = application.status || "Pending";

      application.status = status;
      await application.save();

      if (
        oldStatus !== status &&
        ["Selected", "Rejected"].includes(status)
      ) {
        try {
          if (
            !process.env.EMAIL_USER ||
            !process.env.EMAIL_APP_PASSWORD
          ) {
            throw new Error("Email settings are missing in .env");
          }

          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_APP_PASSWORD,
            },
          });

          const jobTitle = application.jobId?.title || "the job";
          const company =
            application.jobId?.company || "the company";

          const subject =
            status === "Selected"
              ? "Congratulations! Application Selected"
              : "Application Status Update";

          const message =
            status === "Selected"
              ? `Congratulations ${application.name}! Your application for ${jobTitle} at ${company} has been selected.`
              : `Hello ${application.name}, thank you for applying for ${jobTitle} at ${company}. Unfortunately, your application has not been selected at this time.`;

          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: application.email,
            subject,
            text: message,
          });

          return res.json({
            message: `Status updated and email sent to ${application.email}`,
            application,
          });
        } catch (emailError) {
          console.error(
            "Email sending failed:",
            emailError.message
          );

          return res.json({
            message:
              "Status updated, but email could not be sent. Check server logs and email settings.",
            application,
          });
        }
      }

      res.json({
        message: "Application status updated successfully",
        application,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// ===============================
// START SERVER
// ===============================
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB Connected Successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error.message
    );
  });
