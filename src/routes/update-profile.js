const express = require('express');
const multer = require('multer');
const router = express.Router();

// Set up multer to handle file uploads
const upload = multer({ dest: 'uploads/' });

// Route to update profile (with photo and CV)
router.post('/candidate/update-profile', upload.fields([{ name: 'photo' }, { name: 'cv' }]), (req, res) => {
  console.log(req.body); // Text fields (e.g., name, jobTitle, summary)
  console.log(req.files); // Uploaded files (photo, cv)

  // Process the profile update (save data to database)
  // You will need to save the file paths and other profile data to the database
  
  // Example (assuming you're using MongoDB and Mongoose):
  const profileData = {
    name: req.body.name,
    jobTitle: req.body.jobTitle,
    specialization: req.body.specialization,
    summary: req.body.summary,
    photoUrl: req.files.photo[0].path, // Save photo URL/path
    cvUrl: req.files.cv[0].path, // Save CV URL/path
  };

  // Update the user's profile in the database (you'll need a `User` model)
  User.updateOne({ _id: req.user.id }, profileData)
    .then(() => res.json({ message: 'Profile updated successfully' }))
    .catch((err) => res.status(500).json({ error: 'Error updating profile', details: err }));
});

module.exports = router;
