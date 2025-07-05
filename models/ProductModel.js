// The ProductModel class encapsulates all database operations for products
class ProductModel {
  constructor(db) {
    this.db = db; // Injected MySQL connection
  }

  /**
   * CREATE: Save a new product to the database.
   * Automatically sets the creation timestamp.
   */
  async saveOneProduct(productData) {
    try {
      const result = await this.db.query(
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
      return { id: result.insertId }; // Return new product ID
    } catch (err) {
      console.error("Error in saveOneProduct:", err);
      throw { code: 500, message: "Error saving product" };
    }
  }

  /**
   * READ: Get all products, sorted by ID ascending.
   */
  async getAllProducts() {
    try {
      const rows = await this.db.query('SELECT * FROM products ORDER BY id ASC');
      return rows;
    } catch (err) {
      console.error("Error in getAllProducts:", err);
      throw { code: 500, message: "Error retrieving products" };
    }
  }

  /**
   * READ: Get a single product by its ID.
   */
  async getOneProduct(id) {
    try {
      const rows = await this.db.query('SELECT * FROM products WHERE id = ?', [id]);

      if (!rows || rows.length === 0) {
        return null; // Not found
      }

      return rows[0];
    } catch (err) {
      console.error("Error in getOneProduct:", err);
      throw { code: 500, message: "Error retrieving product" };
    }
  }

  /**
   * UPDATE: Update basic product information by ID.
   * (Does not modify image or alt text.)
   */
  async updateProduct(id, productData) {
    try {
      const sql = `
        UPDATE products
        SET title = ?, description = ?, price = ?, stock = ?
        WHERE id = ?
      `;
      const values = [
        productData.title,
        productData.description,
        productData.price,
        productData.stock,
        id
      ];
      const result = await this.db.query(sql, values);
      return result;
    } catch (err) {
      console.error("Error in updateProduct:", err);
      throw { code: 500, message: "Error updating product" };
    }
  }

  /**
   * DELETE: Remove a product from the database by ID.
   */
  async deleteOneProduct(id) {
    try {
      const result = await this.db.query(
        `DELETE FROM products WHERE id = ?`,
        [id]
      );
      return result;
    } catch (err) {
      console.error("Error in deleteOneProduct:", err);
      throw { code: 500, message: "Error deleting product" };
    }
  }
}

// Export the model using dependency injection for the database connection
module.exports = (db) => new ProductModel(db);
