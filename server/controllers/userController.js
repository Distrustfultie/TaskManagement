const User = require('../models/User');

// GET /api/users/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.userId)
    .select('-password -__v -resetToken -resetExpires');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

// PUT /api/users/me
exports.updateMe = async (req, res) => {
  // allow updating name, email, theme, defaultFreq
  const updates = (({ firstName, lastName, email, theme, defaultFreq }) => 
    ({ firstName, lastName, email, theme, defaultFreq }))(req.body);

  if (updates.email) updates.email = String(updates.email).toLowerCase().trim();

  // Express 4 doesn't catch async errors: without this, a duplicate email
  // (or validation error) is an unhandled rejection that kills the process.
  try {
    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
      context: 'query'
    }).select('-password -__v -resetToken -resetExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'That email is already used by another account' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(err.errors)[0]?.message || 'Invalid data' });
    }
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
