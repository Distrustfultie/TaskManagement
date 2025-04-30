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

  const user = await User.findByIdAndUpdate(req.userId, updates, {
    new: true,
    runValidators: true,
    context: 'query'
  }).select('-password -__v -resetToken -resetExpires');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};
