import Role from '../types/Role';

/**
 * Model representing a user in the platform
 */
interface User {
  /**
   * Unique identifier of the user
   */
  _id: string;

  /**
   * Email
   */
  email: string;

  /**
   * Phone number
   */
  phoneNumber: string;

  /**
   * The display name, usually the firstname and lastname brought together
   */
  displayName: string;

  /**
   * Name particles
   */
  name: {
    first: string;
    last: string;
  };

  /**
   * Address
   */
  address?: string;

  /**
   * Link to user's photo
   */
  photoURL?: string;

  /**
   * List of favorite restaurants
   */
  favoriteRestaurants: string[];

  /**
   * List of favorite foods
   */
  favoriteFoods: string[];

  /**
   * List of roles
   */
  roles: Role[];

  /**
   * Registering date
   */
  createdAt: string;

  /**
   * Update date
   */
  updatedAt: string;

  /**
   * Related resto
   */
  resto?: string;
}

export default User;
