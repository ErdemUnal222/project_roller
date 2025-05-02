// Define the ProductModel class to handle operations related to the "products" table
class ProductModel {
  constructor(db) {
    this.db = db; // Store the database connection instance
  }

  // Save a new product to the database
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
      return { id: result.insertId }; // Return the ID of the newly created product
    } catch (err) {
      console.error("Error in saveOneProduct:", err);
      return { code: 500, message: "Error saving product" };
    }
  }

  // Retrieve all products
  async getAllProducts() {
    try {
      const rows = await this.db.query('SELECT * FROM products ORDER BY id ASC');
      console.log("✅ ProductModel - rows:", rows);
      return rows; // Return rows directly
    } catch (err) {
      console.error("Error in getAllProducts:", err);
      throw err;
    }
  }

  // Retrieve one product by ID
  async getOneProduct(id) {
    try {
      const rows = await this.db.query('SELECT * FROM products WHERE id = ?', [id]);
      return rows[0]; // Return only the first product
    } catch (err) {
      console.error("Error in getOneProduct:", err);
      throw err;
    }
  }

  // Update an existing product
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
    throw err;
  }
}


  // Delete a product
  async deleteOneProduct(id) {
    try {
      const result = await this.db.query(`DELETE FROM products WHERE id = ?`, [id]);
      return result;
    } catch (err) {
      console.error("Error in deleteOneProduct:", err);
      return { code: 500, message: "Error deleting product" };
    }
  }
}

// Export the model using a factory function
module.exports = (db) => new ProductModel(db);
