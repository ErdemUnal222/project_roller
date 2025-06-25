// Define the AvailabilityModel class to handle all availability-related database operations
class AvailabilityModel {
  constructor(db) {
    // Store the database connection instance for use in all queries
    this.db = db;
  }

  // CREATE: Add a new availability entry for a specific user
  async addAvailability(userId, startDate, endDate, comment = '') {
    try {
      const result = await this.db.query(
        'INSERT INTO availability (user_id, start_date, end_date, comment) VALUES (?, ?, ?, ?)',
        [userId, startDate, endDate, comment]
      );
      return result;
    } catch (err) {
      console.error("Error adding availability:", err);
      return { code: 500, message: 'Error adding availability' };
    }
  }

  // UPDATE: Update an availability entry by ID and user ID
  async updateAvailability(id, userId, startDate, endDate, comment = '') {
    try {
      const result = await this.db.query(
        'UPDATE availability SET start_date = ?, end_date = ?, comment = ? WHERE id = ? AND user_id = ?',
        [startDate, endDate, comment, id, userId]
      );
      return result;
    } catch (err) {
      console.error("Error updating availability:", err);
      return { code: 500, message: 'Error updating availability' };
    }
  }

  // DELETE: Remove an availability entry by ID and user ID
  async deleteAvailability(id, userId) {
    try {
      const result = await this.db.query(
        'DELETE FROM availability WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      return result;
    } catch (err) {
      console.error("Error deleting availability:", err);
      return { code: 500, message: 'Error deleting availability' };
    }
  }

  // READ: Get all availability entries (e.g., for admin view)
  async getAllAvailabilities() {
    try {
      const result = await this.db.query('SELECT * FROM availability');
      return result;
    } catch (err) {
      console.error("Error getting availabilities:", err);
      return { code: 500, message: 'Error getting availabilities' };
    }
  }

  // READ: Get availability entries for a specific user
  async getAvailabilitiesByUser(userId) {
    try {
      const result = await this.db.query(
        'SELECT * FROM availability WHERE user_id = ?',
        [userId]
      );
      return result;
    } catch (err) {
      console.error("Error getting user availabilities:", err);
      return { code: 500, message: 'Error getting user availabilities' };
    }
  }
}

// Export an instance generator that takes a database connection as argument
module.exports = (db) => new AvailabilityModel(db);
