const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

// Effective user data model
const userSchema = new mongoose.Schema({
  // email is used as user identifier for login
  email: {
    type: String,
    required: [true, "Email required"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Email address not valid"],
  },

  // you may not want this
  fullName: {
    type: String,
    required: [true, "Insert user account full name"],
  },

  // define your users roles.
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },

  // choose your password format and define validators
  password: {
    type: String,
    required: [true, "Password required"],
    minlength: [8, "Password should be at least 8 characters long"],
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, "Password confirm required"],
    validate: {
      // works only on CREATE and SAVE!!
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same",
    },
    select: false,
  },
  passwordChangedAt: Date,
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  // deleted user will be marked as non-active
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// --- QUERY MIDDLEWARES --- //
// password encryption query middleware
userSchema.pre("save", async function (next) {
  // this middleware will be executed only if password is actually updated
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// keep password change timestamp
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// catch find query, filtering only active users
userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// --- INSTANCE METHODS --- //
// They will be available on all documents

// Check if a password is correct
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  // this.password won't be available, because of select:false... so we need to pass it to the function
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Check if a password has been changed after JWT was send: obsolet JWT, need to login again
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  console.log({ resetToken }, this.passwordResetToken);
  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
