// EventModel handles all database interactions for event-related data
class EventModel {
  constructor(db) {
    this.db = db; // Injected MySQL connection
  }

  // Get all events from the database
  async getAllEvents() {
    const rows = await this.db.query("SELECT * FROM events");
    console.log("All events from DB:", rows); // Debug log for verification
    return rows;
  }

  // Get a single event by ID
  async getOneEvent(id) {
    try {
      const rows = await this.db.query("SELECT * FROM events WHERE id = ?", [id]);
      return rows[0]; // Return a single event object
    } catch (err) {
      throw err; // Let the controller handle the error
    }
  }

  // Save a new event to the database
  async saveOneEvent(eventData) {
    try {
      const result = await this.db.query(
        "INSERT INTO events (title, description, event_date, places, picture, alt, price) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          eventData.title,
          eventData.description,
          eventData.event_date,
          eventData.places,
          eventData.picture || null, // Optional field
          eventData.alt || null,     // Optional field
          eventData.price
        ]
      );
      return result;
    } catch (err) {
      throw err;
    }
  }

  // Update an existing event by ID
  async updateEvent(id, eventData) {
    try {
      const result = await this.db.query(
        "UPDATE events SET title = ?, description = ?, event_date = ?, places = ?, picture = ?, alt = ?, price = ? WHERE id = ?",
        [
          eventData.title,
          eventData.description,
          eventData.event_date,
          eventData.places,
          eventData.picture || null,
          eventData.alt || null,
          eventData.price,
          id
        ]
      );
      return result;
    } catch (err) {
      throw err;
    }
  }

  // Delete an event by ID
  async deleteOneEvent(id) {
    try {
      const result = await this.db.query("DELETE FROM events WHERE id = ?", [id]);
      return result;
    } catch (err) {
      throw err;
    }
  }

  // Register a user to an event
  async registerUserToEvent(userId, eventId) {
    try {
      const result = await this.db.query(
        "INSERT INTO users_events (user_id, event_id) VALUES (?, ?)",
        [userId, eventId]
      );
      return result;
    } catch (err) {
      throw err;
    }
  }

  // Check if a user is already registered to an event
  async checkUserRegistration(userId, eventId) {
    try {
      const rows = await this.db.query(
        "SELECT 1 FROM users_events WHERE user_id = ? AND event_id = ? LIMIT 1",
        [userId, eventId]
      );
      return rows.length > 0; // true if already registered
    } catch (err) {
      throw err;
    }
  }

  // Unregister a user from an event
  async unregisterUserFromEvent(userId, eventId) {
    try {
      const result = await this.db.query(
        "DELETE FROM users_events WHERE user_id = ? AND event_id = ?",
        [userId, eventId]
      );
      return result;
    } catch (err) {
      throw err;
    }
  }
}

// Export the factory function to create an instance with a database connection
module.exports = (db) => new EventModel(db);
