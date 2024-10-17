import mongoose, { Schema } from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt' 


const userSchema = new Schema(
  {
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],

    username: {
      type: String,
      require: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // for searching
    },

    email: {
      type: String,
      require: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    fullName: {
      type: String,
      require: true,
      trim: true,
      index: true,
    },

    avatar: {
      type: String, // cloudinary url
      require: true,
    },

    coverImage: {
      type: String, // cloudinary url
    },

    password: {
      type: String,
      require: [true, " Password is required"]
    },

    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
)


///encrypt password before saving in database

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password, 10)
    console.log(this.password);
    next()
})

// chack password is correct or not and return true or false 
userSchema.methods.isPasswordCorrect = async function (password){
     return await bcrypt.compare(password, this.password)
     
}

//Token

userSchema.method.generateAccessToken = function () {
  jwt.sign(
    {
      _id : this._id,
      email : this.email,
      username : this.username,
      fullname : this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expireIn : process.env.ACCESS_TOKEN_EXPIRY
    }
    
  )
}
userSchema.method.generateRefreshToken = function () {
  jwt.sign(
    {
      _id: this.id 
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expireIn : process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

export const User = mongoose.model("User", userSchema);
