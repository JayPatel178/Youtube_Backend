import mongoose, { Aggregate, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videoFile: {
      type: String, // cloudinary url
      require: true,
    },

    thumbnail: {
      type: String, // cloudinary url
      require: true,
    },

    title: {
      type: String,
      require: true,
    },

    description: {
      type: String,
      require: true,
    },

    duratio: {
      type: Number, // cloudinary
      require: true,
    },

    views: {
      type: Number,
      default: 0,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  },
  { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate)  // Aggrigation pipeline

export const Video = mongoose.model("Video", videoSchema);
