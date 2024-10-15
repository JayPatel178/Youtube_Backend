import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from '../utils/ApiErrors.js'
import { User} from '../models/user.models.js'
import {uploadOnCloudinary} from '../utils/cloudninary.js'
import {ApiResponse} from '../utils/ApiResponse.js' 

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

    const {fullName, username, email, password} = req.body
    console.log("Email", email)

    // Validation, Check field are filled or not

    if([fullName, email, password, username].some((field) =>
        field?.trim() ==="")
    ){
        throw new ApiError(400, "All fields are required!")
    }

    const userExist = User.findOne({
        $or: [{username}, {email}]
    })

    if(userExist){
        throw new ApiError(409, "User already exist eith this username or email")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is require!") 
    }

    // upload on cloudinary

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar is require!")
    }

    // Create user object in database

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username:username.toLowerCase(),
        password,
        email

    })
// remove password and refreshTOken from message
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    // check user creation
    if(!createdUser){
        throw new ApiError(500, " Something went wromg while registering the user!")
    }

    // Response 

    
    return res.status(201).json(
        new ApiResponse(200, createdUser, "USer registered successfully!")
    )
});

export default registerUser 
