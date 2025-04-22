module.exports = (_db) => {
    const db = _db;
    return AvailabilityModel;
};

class AvailabilityModel {
    static async addAvailability(userId, startDate, endDate, comment = '') {
        try {
            const result = await db.query(
                'INSERT INTO availability (user_id, start_date, end_date, comment) VALUES (?, ?, ?, ?)',
                [userId, startDate, endDate, comment]
            );
            return result;
        } catch (err) {
            console.error("Error adding availability:", err);
            return { code: 500, message: 'Error adding availability' };
        }
    }

    static async updateAvailability(id, userId, startDate, endDate, comment = '') {
        try {
            const result = await db.query(
                'UPDATE availability SET start_date = ?, end_date = ?, comment = ? WHERE id = ? AND user_id = ?',
                [startDate, endDate, comment, id, userId]
            );
            return result;
        } catch (err) {
            console.error("Error updating availability:", err);
            return { code: 500, message: 'Error updating availability' };
        }
    }

    static async deleteAvailability(id, userId) {
        try {
            const result = await db.query(
                'DELETE FROM availability WHERE id = ? AND user_id = ?',
                [id, userId]
            );
            return result;
        } catch (err) {
            console.error("Error deleting availability:", err);
            return { code: 500, message: 'Error deleting availability' };
        }
    }

    static async getAllAvailabilities() {
        try {
            const result = await db.query('SELECT * FROM availability');
            return result;
        } catch (err) {
            console.error("Error getting availabilities:", err);
            return { code: 500, message: 'Error getting availabilities' };
        }
    }

    static async getAvailabilitiesByUser(userId) {
        try {
            const result = await db.query('SELECT * FROM availability WHERE user_id = ?', [userId]);
            return result;
        } catch (err) {
            console.error("Error getting user availabilities:", err);
            return { code: 500, message: 'Error getting user availabilities' };
        }
    }
}
