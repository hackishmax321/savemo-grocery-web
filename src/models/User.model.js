// User model for type safety
class User {
  constructor(data = {}) {
    this.uid = data.uid || '';
    this.email = data.email || '';
    this.emailVerified = data.emailVerified || false;
    this.displayName = data.displayName || '';
    this.photoURL = data.photoURL || '';
    this.phoneNumber = data.phoneNumber || '';
    this.address = data.address || {
      street: '',
      city: '',
      province: '',
      postalCode: '',
      country: 'Sri Lanka'
    };
    this.role = data.role || 'customer';
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
    this.lastLoginAt = data.lastLoginAt || null;
    this.deactivatedAt = data.deactivatedAt || null;
    this.reactivatedAt = data.reactivatedAt || null;
  }
  
  // Getters
  get fullName() {
    return this.displayName || this.email.split('@')[0];
  }
  
  get isAdmin() {
    return this.role === 'admin';
  }
  
  get isVerified() {
    return this.emailVerified;
  }
  
  get registrationDate() {
    return this.createdAt ? new Date(this.createdAt.toDate()).toLocaleDateString() : 'N/A';
  }
  
  // Methods
  toJSON() {
    return {
      uid: this.uid,
      email: this.email,
      emailVerified: this.emailVerified,
      displayName: this.displayName,
      photoURL: this.photoURL,
      phoneNumber: this.phoneNumber,
      address: this.address,
      role: this.role,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastLoginAt: this.lastLoginAt,
      deactivatedAt: this.deactivatedAt,
      reactivatedAt: this.reactivatedAt
    };
  }
  
  static fromFirestore(doc) {
    const data = doc.data();
    return new User({
      uid: doc.id,
      ...data
    });
  }
}

export default User;