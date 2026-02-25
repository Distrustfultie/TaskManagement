const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

/* -------------------- Helpers -------------------- */
const createToken = (userId, rememberMe = false) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: rememberMe ? '30d' : '7d' }
  );
};

/* -------------------- Register (AUTO VERIFIED) -------------------- */
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const user = new User({
      firstName,
      lastName,
      email: normalizedEmail,
      password,
      isVerified: true, // ✅ AUTO VERIFY (MVP)
    });

    await user.save();

    res.status(201).json({
      message: 'Account created successfully. You can now log in.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' });
  }
};

/* -------------------- Login (NO VERIFICATION BLOCK) -------------------- */
exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // ❌ REMOVED email verification block

    const token = createToken(user._id, rememberMe);

    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        createdAt: user.createdAt,
      },
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

/* -------------------- Get Me -------------------- */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -__v');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      createdAt: user.createdAt,
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

/* -------------------- Forgot Password -------------------- */
exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).json({ message: 'No user with that email' });

  const token = crypto.randomBytes(20).toString('hex');
  user.resetToken = crypto.createHash('sha256').update(token).digest('hex');
  user.resetExpires = Date.now() + 3600000;
  await user.save();

  const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  try {
    await sendEmail(
      user.email,
      'Reset your password',
      `Reset your password here:\n${resetURL}\n\nExpires in 1 hour.`
    );
    res.json({ message: 'Reset link sent' });
  } catch {
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await user.save();
    res.status(500).json({ message: 'Email failed to send' });
  }
};

/* -------------------- Reset Password -------------------- */
exports.resetPassword = async (req, res) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.body.token)
    .digest('hex');

  const user = await User.findOne({
    resetToken: hashedToken,
    resetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Token invalid or expired' });
  }

  user.password = req.body.password;
  user.resetToken = undefined;
  user.resetExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successful' });
};