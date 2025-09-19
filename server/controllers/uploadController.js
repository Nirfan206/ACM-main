const cloudinary = require('../config/cloudinary');

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'alchaanmeera_services', // Optional: specify a folder in Cloudinary
    });

    // Delete the temporary file stored by Multer
    // fs.unlinkSync(req.file.path); // Uncomment if you want to delete local file immediately

    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    res.status(500).json({ message: 'Image upload failed', error: error.message });
  }
};

module.exports = { uploadImage };