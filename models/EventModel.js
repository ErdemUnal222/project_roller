module.exports = (_db) => {
    const db = _db;
    return EventModel;
};

class EventModel {
    // Get all events
    static async getAllEvents() {
        try {
            const result = await db.query('SELECT * FROM events');
            return result;
        } catch (err) {
            console.error("Error in getAllEvents:", err);
            return { code: 500, message: 'Error retrieving events' };
        }
    }

    // Get a single event by ID
    static async getOneEvent(id) {
        try {
            const result = await db.query('SELECT * FROM events WHERE id = ?', [id]);
            return result;
        } catch (err) {
            console.error("Error in getOneEvent:", err);
            return { code: 500, message: 'Error retrieving event' };
        }
    }

    // Save a new event (expects eventData object)
    static async saveOneEvent(eventData) {
        try {
            const result = await db.query(
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
            return { id: result.insertId };
        } catch (err) {
            console.error("Error in saveOneEvent:", err);
            return { code: 500, message: 'Error saving event' };
        }
    }

    // Update an existing event
    static async updateOneEvent(eventData, id) {
        try {
            const result = await db.query(
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

    // Delete an event
    static async deleteOneEvent(id) {
        try {
            const result = await db.query('DELETE FROM events WHERE id = ?', [id]);
            return result;
        } catch (err) {
            console.error("Error in deleteOneEvent:", err);
            return { code: 500, message: 'Error deleting event' };
        }
    }
}
