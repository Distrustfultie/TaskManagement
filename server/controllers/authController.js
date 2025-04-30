const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto    = require('crypto');
const sendEmail = require('../utils/sendEmail');

const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

exports.register = async (req, res) => {
  try {
    console.log('➡️ Received registration request:', req.body);
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // Validation checks
    console.log('🔍 Validating fields...');
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      console.log('❌ Missing fields');
      return res.status(400).json({ error: 'All fields are required' });
    }

    console.log('🔍 Checking password match...');
    if (password !== confirmPassword) {
      console.log('❌ Password mismatch');
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`🔍 Checking existence for: ${normalizedEmail}`);
    
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.log(`❌ Email already exists: ${normalizedEmail}`);
      return res.status(400).json({ error: 'Email already exists' });
    }

    console.log('✅ Creating new user...');
    const user = new User({
      firstName,
      lastName,
      email: normalizedEmail,
      password
    });

    await user.save();
    console.log('✅ User saved successfully');

  } catch (error) {
    console.error('🔥 Registration error:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = createToken(user._id);
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -__v');
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    const fullName = `${user.firstName} ${user.lastName}`;
    
    res.json({
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'No user with that email' });

  // 1) generate & save a temporary reset token
  const token = crypto.randomBytes(20).toString('hex');
  user.resetToken   = crypto.createHash('sha256').update(token).digest('hex');
  user.resetExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  // 2) send email with unhashed token
  const resetURL = `${req.protocol}://${req.get('host')}/reset-password?token=${token}`;
  try {
    await sendEmail(
      user.email,
      'Your password reset link',
      `Click here to reset your password:\n\n${resetURL}\n\nThis link expires in one hour.`
    );
    res.json({ message: 'Reset link sent' });
  } catch (err) {
    // rollback on failure
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await user.save();
    res.status(500).json({ message: 'Error sending email' });
  }
};

// POST /api/auth/reset
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // 1) find user by token & check expiry
  const user = await User.findOne({
    resetToken: hashedToken,
    resetExpires: { $gt: Date.now() }
  });
  if (!user) return res.status(400).json({ message: 'Token is invalid or expired' });

  // 2) update password & clear reset fields
  user.password = password;
  user.resetToken = undefined;
  user.resetExpires = undefined;
  await user.save();

  res.json({ message: 'Password successfully reset' });
};
