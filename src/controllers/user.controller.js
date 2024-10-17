import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudninary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateRefreshAndAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      " Something went wrong while generating refresh and access token!"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // Get user detail from frontend
  // Validation - field not empty
  // Check user is already register or not through email and username
  // Check for image and avtar
  // upload them to cloudinary - avtar
  // create user object - create entry in db
  // Remove password and refresh token field from message
  // Check for user creation
  // return res

  const { fullName, username, email, password } = req.body;
  console.log("Email", email);

  // Validation, Check field are filled or not

  if (
    [fullName, email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required!");
  }

  const userExist = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (userExist) {
    throw new ApiError(409, "User already exist eith this username or email");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is require!");
  }

  // upload on cloudinary

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  // console.log(avatar)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is require!");
  }

  // Create user object in database

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    username: username.toLowerCase(),
    password,
    email,
  });
  // remove password and refreshTOken from message
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // check user creation
  if (!createdUser) {
    throw new ApiError(
      500,
      " Something went wromg while registering the user!"
    );
  }

  // Response

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "USer registered successfully!"));
});

const loginUser = asyncHandler(async (req, res) => {
  // req body ->Take data from frontend
  // find username, or email
  // find user
  // password check
  // access token and refresh token
  // send cookies

  const { email, username, password } = req.body;

  if (!username || !email) {
    throw new ApiError(400, "Username or email is require");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPassword = await user.isPasswordCorrect(password);

  if (!isPassword) {
    throw new ApiError(401, "Password incorrect");
  }

  const { refreshToken, accessToken } = await generateRefreshAndAccessToken(
    user._id
  );

  const logedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshTOken", refreshToken, option)
    .json(200,{
        user : logedInUser
    }, "User logged in successfully!")
});

export { registerUser, loginUser };
