module.exports = (ProductModel) => {
  const path = require("path");
  const fs = require("fs");

  // CREATE and save a new product (with optional image upload)
  const saveProduct = async (req, res, next) => {
    try {
      // If an image was uploaded, handle it
      if (req.files && req.files.picture) {
        const image = req.files.picture;
        const uploadDir = path.join(__dirname, "..", "uploads", "products");

        // Create upload folder if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Generate unique image name and move it to the upload directory
        const imageName = Date.now() + path.extname(image.name);
        await image.mv(path.join(uploadDir, imageName));
        req.body.picture = imageName; // Store filename in DB
      }

      // Save the product using the ProductModel
      const product = await ProductModel.saveOneProduct(req.body);
      if (product.code) {
        return next({ status: product.code, message: product.message });
      }

      res.status(201).json({
        status: 201,
        msg: "Product saved successfully!",
        id: product.id,
      });
    } catch (err) {
      next(err);
    }
  };

  // GET all products
  const getAllProducts = async (req, res, next) => {
    try {
      const products = await ProductModel.getAllProducts();
      res.status(200).json({ status: 200, result: products });
    } catch (err) {
      next(err);
    }
  };

  // GET a single product by ID
  const getOneProduct = async (req, res, next) => {
    try {
      const id = req.params.id;
      const product = await ProductModel.getOneProduct(id);

      if (!product) {
        return res.status(404).json({ status: 404, message: "Product not found" });
      }

      res.status(200).json({ status: 200, result: product });
    } catch (err) {
      next(err);
    }
  };

  // UPDATE a product, with image replacement if needed
  const updateProduct = async (req, res, next) => {
    try {
      // Load the current product to access old image info
      const currentProduct = await ProductModel.getOneProduct(req.params.id);
      if (!currentProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Handle new image upload and delete the old image if needed
      if (req.files && req.files.picture) {
        const image = req.files.picture;
        const uploadDir = path.join(__dirname, "..", "uploads", "products");

        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Remove old image from disk
        if (currentProduct.picture) {
          const oldImagePath = path.join(uploadDir, currentProduct.picture);
          if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
        }

        // Save new image
        const imageName = Date.now() + path.extname(image.name);
        await image.mv(path.join(uploadDir, imageName));
        req.body.picture = imageName;
      }

      const result = await ProductModel.updateProduct(req.params.id, req.body);
      res.status(200).json({ status: 200, msg: "Product updated successfully", result });
    } catch (err) {
      next(err);
    }
  };

  // DELETE a product by its ID
  const deleteProduct = async (req, res, next) => {
    try {
      await ProductModel.deleteOneProduct(req.params.id);
      res.status(200).json({ status: 200, msg: "Product deleted successfully!" });
    } catch (err) {
      next(err);
    }
  };

  // Expose controller functions
  return {
    saveProduct,
    getAllProducts,
    getOneProduct,
    updateProduct,
    deleteProduct
  };
};
