module.exports = (ProductModel) => {

  const saveProduct = async (req, res) => {
    try {
      const product = await ProductModel.saveOneProduct(req.body);
      if (product.code) {
        return res.status(product.code).json({ status: product.code, msg: product.message });
      }
      res.status(201).json({ status: 201, msg: "Product saved successfully!" });
    } catch (err) {
      console.error("Error in saveProduct:", err);
      res.status(500).json({ status: 500, msg: "Unexpected server error" });
    }
  };

  const getAllProducts = async (req, res) => {
    try {
      const products = await ProductModel.getAllProducts();
      console.log("✅ productController - products:", products); // Add this line
      res.status(200).json({ status: 200, result: products }); // ⚡️ SEND FULL ARRAY
    } catch (err) {
      console.error("Error in getAllProducts:", err);
      res.status(500).json({ status: 500, msg: "Failed to fetch products" });
    }
  };

  const getOneProduct = async (req, res) => {
    try {
      const product = await ProductModel.getOneProduct(req.params.id);
      res.status(200).json({ status: 200, result: product });
    } catch (err) {
      console.error("Error in getOneProduct:", err);
      res.status(500).json({ status: 500, msg: "Failed to fetch product" });
    }
  };

  const updateProduct = async (req, res) => {
  const id = req.params.id;
  const { title, description, price, stock } = req.body;

  try {
    const result = await ProductModel.updateProduct(id, { title, description, price, stock });
    res.status(200).json({ status: 200, msg: 'Product updated successfully', result });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ status: 500, msg: 'Server error while updating product' });
  }
};


  const deleteProduct = async (req, res) => {
    try {
      const deleted = await ProductModel.deleteOneProduct(req.params.id);
      res.status(200).json({ status: 200, msg: "Product deleted successfully!" });
    } catch (err) {
      console.error("Error in deleteProduct:", err);
      res.status(500).json({ status: 500, msg: "Failed to delete product" });
    }
  };

  return {
    saveProduct,
    getAllProducts,
    getOneProduct,
    updateProduct,
    deleteProduct
  };
};
