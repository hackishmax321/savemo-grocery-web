
import React, { useEffect, useState } from 'react';

const ProfilePage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = () => {
    const userStr = sessionStorage.getItem('currentUser');
    const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
    
    if (userStr && isAuthenticated) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
        clearAuth();
      }
    } else {
      clearAuth();
    }
    setIsLoading(false);
  };

  const clearAuth = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('isAuthenticated');
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-gray-700">No User Found</h2>
        <p className="text-gray-500 mt-2">Please log in to view your profile</p>
      </div>
    );
  }

  // Format address object to string
  const formatAddress = (address) => {
    if (!address || typeof address !== 'object') return "Not provided";
    
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
      address.country
    ].filter(part => part && part.trim() !== '');
    
    return parts.join(', ') || "Address not provided";
  };

  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    
    try {
      if (timestamp.toDate) {
        // Firestore timestamp
        const date = timestamp.toDate();
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } else if (timestamp.seconds) {
        // Timestamp object
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } else if (typeof timestamp === 'string') {
        // ISO string
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
    }
    
    return "Invalid date";
  };

  // Get user initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-full">
        <br></br>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden p-3">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Personal Details</h1>
            <p className="text-gray-600 mt-2">Your Profile details</p>
        </div>
        {/* Two-column Layout */}
        <div className="flex lg:flex-row">
          {/* Left Column - Profile Image & Summary */}
          <div className="lg:w-1/3 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-gray-200">
            <div className="sticky top-6">
              <div className="flex flex-col items-center">
                {/* Profile Avatar */}
                <div className="relative">
                  <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName || 'User'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-5xl font-bold">
                          {getInitials(currentUser.displayName)}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Status indicator */}
                  <div className={`absolute bottom-4 right-4 w-6 h-6 rounded-full border-2 border-white ${currentUser.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>

                {/* User Info Summary */}
                <div className="mt-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-800">{currentUser.displayName || 'No Name'}</h2>
                  <p className="text-gray-600 mt-1">{currentUser.email}</p>
                  <div className="mt-3">
                    <span className="inline-block px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                      {currentUser.role || 'customer'}
                    </span>
                  </div>
                </div>

                {/* Account Stats */}
                <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-800">Member Since</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatDate(currentUser.createdAt)}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-800">Last Login</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatDate(currentUser.lastLoginAt)}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-8 w-full">
                  <h3 className="font-semibold text-gray-700 mb-3">Contact</h3>
                  <div className="space-y-2">
                    {currentUser.phoneNumber && (
                      <div className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <span>{currentUser.phoneNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <span>{currentUser.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:w-2/3 p-6 md:p-8">
            <div className="space-y-8">
              {/* Personal Information Section */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoItem label="User ID" value={currentUser.uid} copyable />
                  <InfoItem label="Display Name" value={currentUser.displayName || 'Not set'} />
                  <InfoItem label="Email Address" value={currentUser.email} copyable />
                  <InfoItem 
                    label="Email Verified" 
                    value={currentUser.emailVerified ? 'Yes' : 'No'} 
                    badge={currentUser.emailVerified ? 'success' : 'warning'}
                  />
                  <InfoItem label="Phone Number" value={currentUser.phoneNumber || 'Not provided'} />
                  <InfoItem label="User Role" value={currentUser.role || 'customer'} badge="info" />
                </div>
              </div>

              {/* Address Section */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">
                  Address Information
                </h3>
                <div className="bg-gray-50 p-6 rounded-lg">
                  {currentUser.address && typeof currentUser.address === 'object' && Object.keys(currentUser.address).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentUser.address.street && (
                        <InfoItem label="Street" value={currentUser.address.street} />
                      )}
                      {currentUser.address.city && (
                        <InfoItem label="City" value={currentUser.address.city} />
                      )}
                      {currentUser.address.state && (
                        <InfoItem label="State/Province" value={currentUser.address.state} />
                      )}
                      {currentUser.address.zipCode && (
                        <InfoItem label="ZIP/Postal Code" value={currentUser.address.zipCode} />
                      )}
                      {currentUser.address.country && (
                        <InfoItem label="Country" value={currentUser.address.country} />
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No address information available</p>
                  )}
                </div>
              </div>

              {/* Account Details */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">
                  Account Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoItem label="Account Status" 
                    value={currentUser.isActive ? 'Active' : 'Inactive'} 
                    badge={currentUser.isActive ? 'success' : 'error'}
                  />
                  <InfoItem label="Created At" value={formatDate(currentUser.createdAt)} />
                  <InfoItem label="Last Updated" value={formatDate(currentUser.updatedAt)} />
                  <InfoItem label="Last Login" value={formatDate(currentUser.lastLoginAt)} />
                </div>
              </div>

              {/* Action Buttons */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">
                  Account Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ActionButton
                    label="Edit Profile"
                    onClick={() => console.log('Edit Profile')}
                    icon="edit"
                    variant="primary"
                  />
                  <ActionButton
                    label="Change Password"
                    onClick={() => console.log('Change Password')}
                    icon="lock"
                    variant="secondary"
                  />
                  
                </div>
              </div>

              {/* Additional Data Section */}
              {currentUser && Object.keys(currentUser).some(key => 
                !['uid', 'email', 'emailVerified', 'displayName', 'photoURL', 
                  'phoneNumber', 'address', 'role', 'isActive', 'createdAt', 
                  'updatedAt', 'lastLoginAt'].includes(key)
              ) && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">
                    Additional Information
                  </h3>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <pre className="text-sm text-gray-700 overflow-x-auto">
                      {JSON.stringify(
                        Object.fromEntries(
                          Object.entries(currentUser).filter(([key]) => 
                            !['uid', 'email', 'emailVerified', 'displayName', 'photoURL', 
                              'phoneNumber', 'address', 'role', 'isActive', 'createdAt', 
                              'updatedAt', 'lastLoginAt'].includes(key)
                          )
                        ),
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const InfoItem = ({ label, value, badge, copyable }) => {
  const getBadgeClass = (type) => {
    switch(type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    // You could add a toast notification here
    console.log('Copied to clipboard:', value);
  };

  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <p className="text-gray-800 font-medium">{value}</p>
          {badge && (
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${getBadgeClass(badge)}`}>
              {badge === 'success' ? '✓' : badge === 'error' ? '✗' : ''}
            </span>
          )}
        </div>
        {copyable && (
          <button
            onClick={handleCopy}
            className="ml-2 p-1 text-gray-400 hover:text-gray-600"
            title="Copy to clipboard"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

const ActionButton = ({ label, onClick, icon, variant, disabled }) => {
  const getIcon = () => {
    switch(icon) {
      case 'edit':
        return (
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'lock':
        return (
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      case 'mail':
        return (
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'shield-check':
        return (
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const baseClasses = "flex items-center justify-center px-4 py-3 rounded-lg transition-colors font-medium";
  const variantClasses = variant === 'primary' 
    ? "bg-blue-600 hover:bg-blue-700 text-white"
    : "bg-gray-100 hover:bg-gray-200 text-gray-800";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${disabledClasses}`}
    >
      {getIcon()}
      {label}
    </button>
  );
};

export default ProfilePage;