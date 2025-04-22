module.exports = (_db) => {
    const db = _db;
    return ProductModel;
};

class ProductModel {
    // Save a new product
    static async saveOneProduct(productData) {
        try {
            const result = await db.query(
                `INSERT INTO products (title, price, description, stock, picture, alt, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                [
                    productData.title,
                    productData.price,
                    productData.description,
                    productData.stock,
                    productData.picture,
                    productData.alt
                ]
            );
            return result;
        } catch (err) {
            console.error("Error in saveOneProduct:", err);
            return { code: 500, message: "Error saving product" };
        }
    }

    // Get all products
    static async getAllProducts() {
        try {
            const result = await db.query(`SELECT * FROM products ORDER BY created_at DESC`);
            return result;
        } catch (err) {
            console.error("Error in getAllProducts:", err);
            return { code: 500, message: "Error retrieving products" };
        }
    }

    // Get one product by ID
    static async getOneProduct(id) {
        try {
            const result = await db.query(`SELECT * FROM products WHERE id = ?`, [id]);
            return result;
        } catch (err) {
            console.error("Error in getOneProduct:", err);
            return { code: 500, message: "Error retrieving product" };
        }
    }

    // Update a product
    static async updateOneProduct(productData, id) {
        try {
            const result = await db.query(
                `UPDATE products 
                 SET title = ?, price = ?, description = ?, stock = ?, picture = ?, alt = ? 
                 WHERE id = ?`,
                [
                    productData.title,
                    productData.price,
                    productData.description,
                    productData.stock,
                    productData.picture,
                    productData.alt,
                    id
                ]
            );
            return result;
        } catch (err) {
            console.error("Error in updateOneProduct:", err);
            return { code: 500, message: "Error updating product" };
        }
    }

    // Delete a product
    static async deleteOneProduct(id) {
        try {
            const result = await db.query(`DELETE FROM products WHERE id = ?`, [id]);
            return result;
        } catch (err) {
            console.error("Error in deleteOneProduct:", err);
            return { code: 500, message: "Error deleting product" };
        }
    }
}
