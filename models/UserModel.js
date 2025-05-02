// Define the UserModel class to handle user-related database operations
class UserModel {
  constructor(db) {
    this.db = db; // Store the database connection instance
  }

  // Save a new user to the database
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

  // Retrieve a user by email
  async getUserByEmail(email) {
    try {
      const result = await this.db.query("SELECT * FROM users WHERE email = ?", [email]);
      return result;
    } catch (err) {
      console.error("getUserByEmail error:", err);
      return { code: 500, message: 'Error retrieving user by email' };
    }
  }

  // Retrieve a user by ID
  async getOneUser(id) {
    try {
      const result = await this.db.query("SELECT * FROM users WHERE id = ?", [id]);
      return result;
    } catch (err) {
      console.error("getOneUser error:", err);
      return { code: 500, message: 'Error retrieving user by ID' };
    }
  }

  // Update user information (only allowed fields)
  async updateUser(data, userId) {
    try {
      if (!data || typeof data !== 'object') {
        return { code: 400, message: "Invalid update data" };
      }

      const allowedFields = [
        'firstName',
        'lastName',
        'email',
        'address',
        'zip',
        'city',
        'phone',
        'picture' // <- allow profile picture update
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

  // Update last connection timestamp
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

  // Delete user by ID
  async deleteOneUser(id) {
    try {
      const result = await this.db.query(
        "DELETE FROM users WHERE id = ?", [id]
      );
      return result;
    } catch (err) {
      console.error("deleteOneUser error:", err);
      return { code: 500, message: 'Error deleting user' };
    }
  }

  // Retrieve all users (for admin)
  async getAllUsers() {
    try {
      const result = await this.db.query(
        "SELECT id, firstName, lastName, email, address, zip, city, phone, role FROM users"
      );
      return result;
    } catch (err) {
      console.error("getAllUsers error:", err);
      return { code: 500, message: 'Error retrieving all users' };
    }
  }
}

// Export the model
module.exports = (db) => new UserModel(db);
