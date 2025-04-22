module.exports = (_db) => {
    const db = _db;

    class UserModel {
        // Save a user (expects hashed password in userData)
        static async saveOneUser(userData) {
            try {
                const result = await db.query(
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

        static async getUserByEmail(email) {
            try {
                const result = await db.query("SELECT * FROM users WHERE email = ?", [email]);
                return result;
            } catch (err) {
                console.error("getUserByEmail error:", err);
                return { code: 500, message: 'Error retrieving user by email' };
            }
        }

        static async getOneUser(id) {
            try {
                const result = await db.query("SELECT * FROM users WHERE id = ?", [id]);
                return result;
            } catch (err) {
                console.error("getOneUser error:", err);
                return { code: 500, message: 'Error retrieving user by ID' };
            }
        }

        static async updateUser(userData, userId) {
            try {
                const result = await db.query(
                    `UPDATE users SET
                        firstName = ?, lastName = ?, email = ?,
                        address = ?, zip = ?, city = ?, phone = ?, role = ?
                     WHERE id = ?`,
                    [
                        userData.firstName,
                        userData.lastName,
                        userData.email,
                        userData.address,
                        userData.zip,
                        userData.city,
                        userData.phone,
                        userData.role,
                        userId
                    ]
                );
                return result;
            } catch (err) {
                console.error("updateUser error:", err);
                return { code: 500, message: 'Error updating user' };
            }
        }

        static async updateConnexion(id) {
            try {
                const result = await db.query("UPDATE users SET last_connection = NOW() WHERE id = ?", [id]);
                return result;
            } catch (err) {
                console.error("updateConnexion error:", err);
                return { code: 500, message: 'Error updating last connection timestamp' };
            }
        }

        static async deleteOneUser(id) {
            try {
                const result = await db.query("DELETE FROM users WHERE id = ?", [id]);
                return result;
            } catch (err) {
                console.error("deleteOneUser error:", err);
                return { code: 500, message: 'Error deleting user' };
            }
        }
    }

    return UserModel;
};
