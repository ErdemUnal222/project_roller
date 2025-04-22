module.exports = (ProductModel) => {
    // Create a new product (admin only)
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

    // Get all products
    const getAllProducts = async (req, res) => {
        try {
            const products = await ProductModel.getAllProducts();
            res.status(200).json({ status: 200, result: products });
        } catch (err) {
            console.error("Error in getAllProducts:", err);
            res.status(500).json({ status: 500, msg: "Failed to fetch products" });
        }
    };

    // Get one product
    const getOneProduct = async (req, res) => {
        try {
            const product = await ProductModel.getOneProduct(req.params.id);
            res.status(200).json({ status: 200, result: product });
        } catch (err) {
            console.error("Error in getOneProduct:", err);
            res.status(500).json({ status: 500, msg: "Failed to fetch product" });
        }
    };

    // Update product
    const updateProduct = async (req, res) => {
        try {
            const updated = await ProductModel.updateOneProduct(req.body, req.params.id);
            res.status(200).json({ status: 200, msg: "Product updated successfully!" });
        } catch (err) {
            console.error("Error in updateProduct:", err);
            res.status(500).json({ status: 500, msg: "Failed to update product" });
        }
    };

    // Delete product
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
