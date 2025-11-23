import mongoose, {model, Schema} from "mongoose";

const mongoUri = "mongodb://localhost:27017/brainly"

mongoose.connect(mongoUri)
  .then(() => {
    console.log("Successfully connected to MongoDB at", mongoUri);
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // Exit process if DB connection fails
  });

const UserSchema = new Schema({
    username: {type: String, unique: true},
    password: String
})

export const UserModel = model("User", UserSchema);

const ContentSchema = new Schema({
    title: String,
    link: String,
    tags: [{type: mongoose.Types.ObjectId, ref: 'Tag'}],
    type: String,
    userId: {type: mongoose.Types.ObjectId, ref: 'User', required: true },
})

const LinkSchema = new Schema({
    hash: String,
    userId: {type: mongoose.Types.ObjectId, ref: 'User', required: true, unique: true },
})

export const LinkModel = model("Links", LinkSchema);
export const ContentModel = model("Content", ContentSchema);

/*
 * Ensure that MongoDB server is running locally on port 27017 before starting the backend.
 * You can start MongoDB with a command like:
 *   brew services start mongodb-community
 * or use your OS-specific method to start the MongoDB service.
 */
