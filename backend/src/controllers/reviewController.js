const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');

// USER: Create review (only for purchased+delivered products)
exports.createReview = async (req, res) => {
  const { productId, rating, title, comment, images } = req.body;

  // Check if user has purchased and received this product
  const order = await Order.findOne({
    user: req.user._id,
    'items.product': productId,
    status: 'delivered',
  });
  if (!order) return res.status(403).json({ success: false, message: 'You can only review products you have purchased and received' });

  const existing = await Review.findOne({ user: req.user._id, product: productId });
  if (existing) return res.status(400).json({ success: false, message: 'You have already reviewed this product' });

  const review = await Review.create({
    user: req.user._id,
    product: productId,
    rating,
    title,
    comment,
    images: images || [],
    isVerifiedPurchase: true,
  });

  await Review.calcAverageRating(productId);
  res.status(201).json({ success: true, review });
};

// PUBLIC: Get reviews for a product
exports.getProductReviews = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [reviews, total] = await Promise.all([
    Review.find({ product: req.params.productId })
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name avatar'),
    Review.countDocuments({ product: req.params.productId }),
  ]);
  res.json({ success: true, reviews, total });
};

// USER: Get my reviews
exports.getMyReviews = async (req, res) => {
  const reviews = await Review.find({ user: req.user._id })
    .sort('-createdAt')
    .populate('product', 'name images');
  res.json({ success: true, reviews });
};

// SELLER: Get reviews for seller's products
exports.getSellerProductReviews = async (req, res) => {
  const products = await Product.find({ sellerId: req.seller._id }, '_id');
  const productIds = products.map(p => p._id);
  const reviews = await Review.find({ product: { $in: productIds } })
    .sort('-createdAt')
    .populate('user', 'name avatar')
    .populate('product', 'name images');
  res.json({ success: true, reviews });
};

// SELLER: Reply to review (add reply as update)
exports.replyToReview = async (req, res) => {
  const review = await Review.findById(req.params.id).populate('product');
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  if (review.product.sellerId?.toString() !== req.seller._id.toString())
    return res.status(403).json({ success: false, message: 'Not authorized' });
  review.sellerReply = req.body.reply;
  await review.save();
  res.json({ success: true, review });
};

// ADMIN: Get all reviews
exports.getAllReviews = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [reviews, total] = await Promise.all([
    Review.find().sort('-createdAt').skip(skip).limit(parseInt(limit))
      .populate('user', 'name email')
      .populate('product', 'name'),
    Review.countDocuments(),
  ]);
  res.json({ success: true, reviews, total });
};

// ADMIN: Delete review
exports.deleteReview = async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  await Review.calcAverageRating(review.product);
  res.json({ success: true, message: 'Review deleted' });
};

// ADMIN: Hide/unhide review
exports.toggleReviewVisibility = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  review.isHidden = !review.isHidden;
  await review.save();
  res.json({ success: true, review });
};
