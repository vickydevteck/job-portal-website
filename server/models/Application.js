
const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  resume: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Selected", "Rejected"],
    default: "Pending",
  },
});

module.exports = mongoose.model("Application", applicationSchema);
