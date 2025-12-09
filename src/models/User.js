/**
 * User model with name and email properties
 */
class User {
  /**
   * Creates a new User instance
   * @param {string} name - User's name
   * @param {string} email - User's email address
   */
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  /**
   * Returns a plain object representation of the user
   * @returns {Object} User data as plain object
   */
  toObject() {
    return {
      name: this.name,
      email: this.email
    };
  }

  /**
   * Creates a new User with updated properties (immutable update)
   * @param {Object} updates - Properties to update
   * @returns {User} New User instance with updates applied
   */
  update(updates) {
    return new User(
      updates.name ?? this.name,
      updates.email ?? this.email
    );
  }
}

module.exports = User;
