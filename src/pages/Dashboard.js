import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingAPI, reviewAPI } from '../api/api';

function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('bookings');
  const [reviewData, setReviewData] = useState({
    bookingId: '',
    rating: 5,
    comment: ''
  });
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User authenticated, fetching bookings for:', user);
      fetchBookings();
    } else {
      console.log('User not authenticated or user data missing');
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching bookings...');
      const response = await bookingAPI.getUserBookings();
      console.log('Full API response:', response);
      console.log('Bookings data:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setBookings(response.data);
        console.log('Successfully set bookings:', response.data.length, 'items');
      } else {
        console.warn('Invalid bookings data format:', response.data);
        setBookings([]);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.response?.data?.message || 'Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingAPI.cancelBooking(bookingId);
        fetchBookings();
        alert('Booking cancelled successfully!');
      } catch (error) {
        console.error('Cancel booking error:', error);
        alert('Failed to cancel booking');
      }
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    const confirmMessage = newStatus === 'confirmed' 
      ? 'Confirm this booking?' 
      : 'Mark this booking as completed?';
      
    if (window.confirm(confirmMessage)) {
      try {
        await bookingAPI.updateStatus(bookingId, newStatus);
        fetchBookings();
        alert(`Booking ${newStatus} successfully!`);
      } catch (error) {
        console.error('Status update error:', error);
        alert(`Failed to update booking status`);
      }
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const booking = bookings.find(b => b._id === reviewData.bookingId);
      if (!booking) {
        alert('Booking not found');
        return;
      }
      
      if (booking.reviewId) {
        alert('You have already submitted a review for this booking');
        setShowReviewForm(false);
        return;
      }
      
      const reviewPayload = {
        booking: reviewData.bookingId,
        worker: booking.worker?._id,
        rating: reviewData.rating,
        comment: reviewData.comment
      };
      
      console.log('Submitting review:', reviewPayload);
      await reviewAPI.createReview(reviewPayload);
      setShowReviewForm(false);
      setReviewData({ bookingId: '', rating: 5, comment: '' });
      fetchBookings();
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Review submission error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit review';
      alert(errorMessage);
      
      if (errorMessage.includes('already exists')) {
        setShowReviewForm(false);
        fetchBookings(); // Refresh to get updated review status
      }
    }
  };

  const openReviewForm = (bookingId) => {
    setReviewData({ ...reviewData, bookingId });
    setShowReviewForm(true);
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        flexDirection: 'column'
      }}>
        <h2>Please log in to view your dashboard</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        flexDirection: 'column'
      }}>
        <div>Loading dashboard...</div>
        <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          User: {user?.name || 'Unknown'}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>
        Welcome, {user?.name || 'User'}!
      </h1>
      

      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          Error: {error}
          <button 
            onClick={fetchBookings}
            style={{
              marginLeft: '10px',
              padding: '4px 8px',
              backgroundColor: '#721c24',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}

      <div style={{
        display: 'flex',
        marginBottom: '30px',
        borderBottom: '1px solid #ddd'
      }}>
        <button
          onClick={() => setActiveTab('bookings')}
          style={{
            padding: '12px 24px',
            backgroundColor: activeTab === 'bookings' ? '#007bff' : 'transparent',
            color: activeTab === 'bookings' ? 'white' : '#333',
            border: 'none',
            borderBottom: activeTab === 'bookings' ? '2px solid #007bff' : 'none',
            cursor: 'pointer'
          }}
        >
          {user?.role === 'worker' ? 'Job Requests' : 'My Bookings'} ({bookings.length})
        </button>
        {user?.role !== 'worker' && (
          <button
            onClick={() => setActiveTab('book-worker')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'book-worker' ? '#007bff' : 'transparent',
              color: activeTab === 'book-worker' ? 'white' : '#333',
              border: 'none',
              borderBottom: activeTab === 'book-worker' ? '2px solid #007bff' : 'none',
              cursor: 'pointer'
            }}
          >
            Book Worker
          </button>
        )}
      </div>

      {activeTab === 'book-worker' && user?.role !== 'worker' && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Find & Book Workers</h2>
          <p style={{ marginBottom: '30px', color: '#666' }}>
            Browse through our skilled professionals and book the right worker for your needs.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '15px 30px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#0056b3';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#007bff';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Browse Workers
          </button>
        </div>
      )}
      
      {/* Worker-specific dashboard content */}
      {user?.role === 'worker' && activeTab === 'book-worker' && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔧</div>
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Worker Dashboard</h2>
          <p style={{ marginBottom: '30px', color: '#666', lineHeight: '1.6' }}>
            Welcome to your worker dashboard! Here you can manage your job requests and track your work progress.
            Workers cannot book other workers - only customers can book your services.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginTop: '30px'
          }}>
            <div style={{
              padding: '20px',
              backgroundColor: '#e8f5e8',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>📋</div>
              <h4 style={{ color: '#333', marginBottom: '5px' }}>Job Requests</h4>
              <p style={{ color: '#666', fontSize: '14px' }}>View and manage customer bookings</p>
            </div>
            <div style={{
              padding: '20px',
              backgroundColor: '#e3f2fd',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>⭐</div>
              <h4 style={{ color: '#333', marginBottom: '5px' }}>Reviews</h4>
              <p style={{ color: '#666', fontSize: '14px' }}>Check customer feedback</p>
            </div>
            <div style={{
              padding: '20px',
              backgroundColor: '#fff3e0',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>💰</div>
              <h4 style={{ color: '#333', marginBottom: '5px' }}>Earnings</h4>
              <p style={{ color: '#666', fontSize: '14px' }}>Track your income</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div>
          {bookings.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#666'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>
                {user?.role === 'worker' ? '🔧' : '📋'}
              </div>
              <div style={{ fontSize: '18px', marginBottom: '10px' }}>
                {user?.role === 'worker' ? 'No job requests yet' : 'No bookings found'}
              </div>
              <p style={{ color: '#999', marginBottom: '20px' }}>
                {user?.role === 'worker' 
                  ? 'Customers will see your profile and can book your services.' 
                  : 'Start booking workers to see your appointments here.'}
              </p>
              <button 
                onClick={fetchBookings}
                style={{
                  marginTop: '10px',
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Refresh {user?.role === 'worker' ? 'Job Requests' : 'Bookings'}
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '20px'
            }}>
              {bookings.map(booking => (
                <div key={booking._id || Math.random()} style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '1px solid #eee'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '20px',
                    alignItems: 'start'
                  }}>
                    <div>
                      <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                        {booking.worker?.name || 'Worker Name Not Available'}
                      </h3>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Job Role:</strong> {booking.worker?.profession || 'N/A'}
                      </p>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Service:</strong> {booking.service || 'N/A'}
                      </p>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}
                      </p>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Time:</strong> {booking.time}
                      </p>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Address:</strong> {booking.address || 'N/A'}
                      </p>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Amount:</strong> ₹{booking.totalAmount || 'N/A'}
                      </p>
                      <p style={{ margin: '5px 0' }}>
                        <strong>Status:</strong>{' '}
                        <span style={{
                          color: booking.status === 'confirmed' ? '#28a745' : 
                                booking.status === 'cancelled' ? '#dc3545' : '#ffc107'
                        }}>
                          {booking.status}
                        </span>
                      </p>
                    </div>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(booking._id, 'completed')}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Mark Complete
                        </button>
                      )}
                      
                      {booking.status === 'completed' && !booking.reviewId && (
                        <button
                          onClick={() => openReviewForm(booking._id)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#ffc107',
                            color: '#000',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          Add Review
                        </button>
                      )}
                      
                      {booking.status === 'completed' && booking.reviewId && (
                        <div style={{
                          padding: '8px 16px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          borderRadius: '6px',
                          fontSize: '12px',
                          textAlign: 'center',
                          fontWeight: 'bold'
                        }}>
                          ✓ Reviewed
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showReviewForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h3 style={{ marginBottom: '20px' }}>Add Review</h3>
            
            <form onSubmit={handleReviewSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Rating:
                </label>
                <select
                  value={reviewData.rating}
                  onChange={(e) => setReviewData({
                    ...reviewData, 
                    rating: parseInt(e.target.value)
                  })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px'
                  }}
                >
                  {[1,2,3,4,5].map(num => (
                    <option key={num} value={num}>{num} Star{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Comment:
                </label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({
                    ...reviewData, 
                    comment: e.target.value
                  })}
                  placeholder="Share your experience..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;