const Joi = require("joi");

const listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required().messages({
      "string.empty": "Title is required",
    }),

    description: Joi.string().allow("").messages({
      "string.base": "Description must be a string",
    }),

    price: Joi.number().min(0).required().messages({
      "number.base": "Price must be a number",
      "number.min": "Price cannot be negative",
      "any.required": "Price is required",
    }),

    location: Joi.string().required().messages({
      "string.empty": "Location is required",
    }),

    country: Joi.string().allow("").messages({
      "string.base": "Country must be a string",
    }),

    category: Joi.string().allow("").messages({
      "string.base": "Category must be a string",
    }),
  }).required(),
});

//  Review validation
const reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().min(1).max(5).required().messages({
      "number.base": "Rating must be a number",
      "number.min": "Rating must be at least 1",
      "number.max": "Rating cannot be more than 5",
      "any.required": "Rating is required",
    }),
    comment: Joi.string().required().messages({
      "string.empty": "Comment cannot be empty",
    }),
  }).required(),
});

module.exports = { listingSchema, reviewSchema };
