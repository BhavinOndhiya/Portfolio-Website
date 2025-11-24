const mongoose = require("mongoose");

const ContentSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      default: "default",
    },
    data: {
      type: Object,
      required: true,
      default: {},
    },
  },
  { minimize: false }
);

module.exports =
  mongoose.models.Content || mongoose.model("Content", ContentSchema);
