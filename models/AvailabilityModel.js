// Define the AvailabilityModel class to handle all availability-related database operations
class AvailabilityModel {
  constructor(db) {
    // Save the database connection instance
    this.db = db;
  }

  // Add a new availability entry for a specific user
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

  // Update an existing availability entry by its ID and the user's ID
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

  // Delete an availability entry by its ID and the user's ID
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

  // Get all availability entries (typically for admin or dashboard views)
  async getAllAvailabilities() {
    try {
      const result = await this.db.query('SELECT * FROM availability');
      return result;
    } catch (err) {
      console.error("Error getting availabilities:", err);
      return { code: 500, message: 'Error getting availabilities' };
    }
  }

  // Get availability entries for a specific user
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

// Export a function that creates an instance of the model using the provided database connection
module.exports = (db) => new AvailabilityModel(db);
