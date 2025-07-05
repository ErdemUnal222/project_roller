// Define the UserModel class to encapsulate all user-related database operations
class UserModel {
  constructor(db) {
    this.db = db; // MySQL connection passed via dependency injection
  }

  /**
   * CREATE: Save a new user to the database.
   */
  async saveOneUser(userData) {
    try {
      const result = await this.db.query(
        `INSERT INTO users (
            firstName, lastName, email, password, created_at,
            address, zip, city, phone, role
        ) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?)`,
        [
          userData.firstName,
          userData.lastName,
          userData.email,
          userData.password,
          userData.address,
          userData.zip,
          userData.city,
          userData.phone,
          userData.role
        ]
      );

      return {
        id: result.insertId,
        status: 201,
        message: 'User saved successfully'
      };
    } catch (err) {
      console.error("saveOneUser error:", err);
      return { code: 500, message: 'Error saving user' };
    }
  }

  /**
   * READ: Retrieve a user by email address (used during login).
   */
  async getUserByEmail(email) {
    try {
      const result = await this.db.query("SELECT * FROM users WHERE email = ?", [email]);
      return result;
    } catch (err) {
      console.error("getUserByEmail error:", err);
      return { code: 500, message: 'Error retrieving user by email' };
    }
  }

  /**
   * READ: Retrieve a single user by ID.
   */
  async getOneUser(id) {
    try {
      const result = await this.db.query("SELECT * FROM users WHERE id = ?", [id]);
      return result;
    } catch (err) {
      console.error("getOneUser error:", err);
      return { code: 500, message: 'Error retrieving user by ID' };
    }
  }

  /**
   * UPDATE: Modify user fields (only those in allowedFields list).
   */
  async updateUser(data, userId) {
    try {
      if (!data || typeof data !== 'object') {
        return { code: 400, message: "Invalid update data" };
      }

      const allowedFields = [
        'firstName', 'lastName', 'email', 'address',
        'zip', 'city', 'phone', 'picture'
      ];

      const fields = [];
      const values = [];

      for (const key of allowedFields) {
        if (data[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(data[key]);
        }
      }

      if (fields.length === 0) {
        return { code: 400, message: "No valid fields to update" };
      }

      const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
      values.push(userId);

      const result = await this.db.query(sql, values);
      return result;
    } catch (err) {
      console.error("updateUser error:", err);
      return { code: 500, message: 'Error updating user' };
    }
  }

  /**
   * UPDATE: Update last_connection timestamp (used on login).
   */
  async updateConnexion(id) {
    try {
      const result = await this.db.query(
        "UPDATE users SET last_connection = NOW() WHERE id = ?", [id]
      );
      return result;
    } catch (err) {
      console.error("updateConnexion error:", err);
      return { code: 500, message: 'Error updating last connection timestamp' };
    }
  }

  /**
   * DELETE: Permanently delete a user by ID.
   */
  async deleteOneUser(id) {
    try {
      const [result] = await this.db.query("DELETE FROM users WHERE id = ?", [id]);
      return result;
    } catch (err) {
      console.error("deleteOneUser SQL error:", err);
      return { code: 500, message: err.message };
    }
  }

  /**
   * SOFT DELETE: Mark a user as deleted (without removing the record).
   */
  async softDeleteUser(id) {
    try {
      const [result] = await this.db.query(
        "UPDATE users SET isDeleted = 1 WHERE id = ?",
        [id]
      );
      return result;
    } catch (err) {
      console.error("softDeleteUser error:", err);
      return { code: 500, message: err.message };
    }
  }

  /**
   * ADMIN: Get all active users (excluding deleted ones), without exposing passwords.
   */
  async getAllUsers() {
    try {
      const result = await this.db.query(
        "SELECT id, firstName, lastName, email, address, zip, city, phone, role FROM users WHERE isDeleted = 0"
      );
      return result;
    } catch (err) {
      console.error("getAllUsers error:", err);
      return { code: 500, message: 'Error retrieving all users' };
    }
  }
}

// Export as a factory function that returns a new UserModel instance
module.exports = (db) => new UserModel(db);
