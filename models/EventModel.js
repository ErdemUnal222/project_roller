// Define the EventModel class to handle all operations related to the "events" table
class EventModel {
    constructor(db) {
        // Store the database connection instance
        this.db = db;
    }

    // Retrieve all events from the database
// models/EventModel.js
async getAllEvents() {
  try {
    const rows = await this.db.query('SELECT * FROM events');
    console.log("Raw DB result:", rows);
    return rows;
  } catch (err) {
    console.error("Error in getAllEvents:", err);
    return { code: 500, message: 'Error retrieving events' };
  }
}


    // Retrieve a single event by its ID
// models/EventModel.js
async getOneEvent(id) {
  try {
    const rows = await this.db.query('SELECT * FROM events WHERE id = ?', [id]);
    if (Array.isArray(rows) && rows.length > 0) {
      return rows[0]; // Return first row
    } else {
      console.error("No event found with id:", id);
      return { code: 404, message: 'Event not found' };
    }
  } catch (err) {
    console.error("Error in getOneEvent:", err);
    return { code: 500, message: 'Error retrieving event' };
  }
}
async registerUserToEvent(userId, eventId) {
  try {
    const sql = "INSERT INTO users_events (user_id, event_id) VALUES (?, ?)";
    const result = await this.db.query(sql, [userId, eventId]);
    return result;
  } catch (err) {
    console.error("registerUserToEvent error:", err);
    return { code: 500, message: "Error registering for event" };
  }
}

async checkUserRegistration(userId, eventId) {
  try {
    const rows = await this.db.query(
      'SELECT 1 FROM users_events WHERE user_id = ? AND event_id = ? LIMIT 1',
      [userId, eventId]
    );
    return rows.length > 0;
  } catch (err) {
    console.error("Error in checkUserRegistration:", err);
    throw err;
  }
}

async unregisterUserFromEvent(userId, eventId) {
  try {
    const result = await this.db.query(
      'DELETE FROM users_events WHERE user_id = ? AND event_id = ?',
      [userId, eventId]
    );
    return result;
  } catch (err) {
    console.error("Error in unregisterUserFromEvent:", err);
    throw err;
  }
}


    // Save a new event to the database
    async saveOneEvent(eventData) {
        try {
            const result = await this.db.query(
                'INSERT INTO events (title, description, event_date, places, picture, alt, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [
                    eventData.title,
                    eventData.description,
                    eventData.event_date,
                    eventData.places,
                    eventData.picture,
                    eventData.alt,
                    eventData.price
                ]
            );
            return { id: result.insertId }; // Return the ID of the newly created event
        } catch (err) {
            console.error("Error in saveOneEvent:", err);
            return { code: 500, message: 'Error saving event' };
        }
    }

    // Update an existing event by its ID
    async updateOneEvent(eventData, id) {
        try {
            const [result] = await this.db.query(
                'UPDATE events SET title = ?, description = ?, event_date = ?, places = ?, picture = ?, alt = ?, price = ? WHERE id = ?',
                [
                    eventData.title,
                    eventData.description,
                    eventData.event_date,
                    eventData.places,
                    eventData.picture,
                    eventData.alt,
                    eventData.price,
                    id
                ]
            );
            return result;
        } catch (err) {
            console.error("Error in updateOneEvent:", err);
            return { code: 500, message: 'Error updating event' };
        }
    }

    // Delete an event by its ID
    async deleteOneEvent(id) {
        try {
            const [result] = await this.db.query('DELETE FROM events WHERE id = ?', [id]);
            return result;
        } catch (err) {
            console.error("Error in deleteOneEvent:", err);
            return { code: 500, message: 'Error deleting event' };
        }
    }
}

// Export the model using a factory function that injects the database connection
module.exports = (db) => new EventModel(db);
