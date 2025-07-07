// Define the UserModel class to encapsulate all user-related database operations
class UserModel {
  constructor(db) {
    // Injected MySQL database connection is stored for use across all methods
    this.db = db;
  }

  /**
   * CREATE: Save a new user in the database.
   * - All relevant fields (first name, last name, email, password, etc.) are inserted.
   * - A creation timestamp is automatically added using NOW().
   * - Returns the ID of the newly created user.
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
        id: result.insertId, // Newly generated user ID
        status: 201,
        message: 'User saved successfully'
      };
    } catch (err) {
      console.error("saveOneUser error:", err);
      return { code: 500, message: 'Error saving user' };
    }
  }

  /**
   * READ: Retrieve a user by email.
   * - Mainly used during login to find the user and verify password.
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
   * READ: Retrieve a single user by their ID.
   * - Used in profile or admin detail views.
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
   * UPDATE: Update selected fields of a user profile.
   * - Only fields from the allowed list can be updated to prevent unauthorized changes.
   * - Builds the SQL query dynamically based on which fields are provided.
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
      values.push(userId); // Add user ID at the end of the query values

      const result = await this.db.query(sql, values);
      return result;
    } catch (err) {
      console.error("updateUser error:", err);
      return { code: 500, message: 'Error updating user' };
    }
  }

  /**
   * UPDATE: Update the last_connection timestamp (e.g., on successful login).
   * - Helps track user activity and access history.
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
   * DELETE: Hard-delete a user by ID.
   * - Completely removes the user from the database.
   * - Use with caution (alternative: soft delete).
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
   * SOFT DELETE: Mark a user as deleted without physically removing them.
   * - Useful for keeping records but hiding user in frontend.
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
   * READ (ADMIN): Retrieve all active users (excluding those marked as deleted).
   * - Does not return sensitive data like passwords.
   * - Used in the admin dashboard.
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

// Export a factory function that takes a DB connection and returns a UserModel instance
module.exports = (db) => new UserModel(db);
