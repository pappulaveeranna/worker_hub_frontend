import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { workerAPI, bookingAPI, reviewAPI } from '../api/api';
import RatingStars from '../components/RatingStars';
import ChatSystem from '../components/ChatSystem';

function WorkerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    service: '',
    address: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [showChat, setShowChat] = useState(false);

  const fetchWorkerDetails = useCallback(async () => {
    try {
      const response = await workerAPI.getById(id);
      setWorker(response.data);
    } catch (error) {
      console.error('Failed to load worker details:', error);
      setError('Failed to load worker details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await reviewAPI.getWorkerReviews(id);
      setReviews(response.data);
    } catch (error) {
      console.error('Failed to load reviews');
    }
  }, [id]);

  useEffect(() => {
    fetchWorkerDetails();
    fetchReviews();
  }, [fetchWorkerDetails, fetchReviews]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      const bookingPayload = {
        worker: id,
        service: bookingData.service,
        date: bookingData.date,
        time: bookingData.time,
        address: bookingData.address,
        totalAmount: worker.charges || 500
      };
      await bookingAPI.create(bookingPayload);
      alert('Booking created successfully!');
      setBookingData({ date: '', time: '', service: '', address: '' });
      navigate('/dashboard');
    } catch (error) {
      console.error('Booking error:', error);
      setError(error.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: '#fff' }}>
        <div>Loading worker details...</div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
        Worker not found
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' }}>
      <div>
        <div className="bms-card" style={{ padding: '40px', marginBottom: '25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px', paddingBottom: '20px', borderBottom: '2px solid #333' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #f84464 0%, #d62e4e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '36px', fontWeight: 'bold', marginRight: '25px', boxShadow: '0 4px 15px rgba(248,68,100,0.3)', border: '4px solid #2a2a2a', position: 'relative', overflow: 'hidden' }}>
              {worker.photo ? (
                <img src={worker.photo} alt={worker.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '2px' }}>👤</div>
                  <div style={{ fontSize: '20px' }}>{worker.name.charAt(0).toUpperCase()}</div>
                </div>
              )}
            </div>
            <div>
              <h1 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '28px' }}>{worker.name}</h1>
              <p style={{ fontSize: '18px', color: '#f84464', margin: '0 0 10px 0', fontWeight: '600' }}>🛠️ {worker.profession}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <RatingStars rating={reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0} showText={true} />
                <span style={{ color: '#999', fontSize: '14px' }}>({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '20px', backgroundColor: '#2a2a2a', borderRadius: '10px', textAlign: 'center', border: '1px solid #333' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📍</div>
              <strong style={{ color: '#fff' }}>Location</strong>
              <p style={{ margin: '8px 0 0 0', color: '#999', fontSize: '16px' }}>{worker.location}</p>
            </div>
            <div style={{ padding: '20px', backgroundColor: '#2a2a2a', borderRadius: '10px', textAlign: 'center', border: '1px solid #333' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>💰</div>
              <strong style={{ color: '#fff' }}>Daily Rate</strong>
              <p style={{ margin: '8px 0 0 0', color: '#f84464', fontSize: '20px', fontWeight: 'bold' }}>₹{worker.charges}/day</p>
            </div>
            <div style={{ padding: '20px', backgroundColor: '#2a2a2a', borderRadius: '10px', textAlign: 'center', border: '1px solid #333' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📞</div>
              <strong style={{ color: '#fff' }}>Contact</strong>
              <p style={{ margin: '8px 0 0 0', color: '#999', fontSize: '16px' }}>{worker.contact}</p>
            </div>
            <div style={{ padding: '20px', backgroundColor: '#2a2a2a', borderRadius: '10px', textAlign: 'center', border: '1px solid #333' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎆</div>
              <strong style={{ color: '#fff' }}>Experience</strong>
              <p style={{ margin: '8px 0 0 0', color: '#999', fontSize: '16px' }}>{worker.experience || 'Not specified'}</p>
            </div>
          </div>
        </div>

        <div className="bms-card" style={{ padding: '30px' }}>
          <h3 style={{ marginBottom: '25px', color: '#fff', fontSize: '24px' }}>📝 Customer Reviews ({reviews.length})</h3>
          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#2a2a2a', borderRadius: '12px', border: '2px dashed #444' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>💬</div>
              <h4 style={{ color: '#999', marginBottom: '10px' }}>No reviews yet</h4>
              <p style={{ color: '#999', margin: 0 }}>Be the first to review this worker!</p>
            </div>
          ) : (
            <>
              <div style={{ backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '12px', marginBottom: '25px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f84464', marginBottom: '5px' }}>
                  {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                </div>
                <RatingStars rating={reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length} showText={false} />
                <div style={{ color: '#999', marginTop: '5px' }}>Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {reviews.map(review => (
                  <div key={review._id} style={{ padding: '20px', border: '1px solid #333', borderRadius: '12px', backgroundColor: '#2a2a2a', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #f84464 0%, #d62e4e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                          {(review.user?.name || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong style={{ color: '#fff' }}>{review.user?.name || 'Anonymous'}</strong>
                          <div style={{ fontSize: '12px', color: '#999' }}>{new Date(review.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <RatingStars rating={review.rating} showText={true} />
                    </div>
                    <p style={{ color: '#ccc', margin: 0, lineHeight: '1.6', fontSize: '15px' }}>"{review.comment}"</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        {user?.role === 'worker' && user?.name === worker.name ? (
          <div className="bms-card" style={{ padding: '30px', position: 'sticky', top: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔧</div>
            <h3 style={{ color: '#fff', marginBottom: '15px' }}>Your Worker Profile</h3>
            <p style={{ color: '#999', marginBottom: '25px', lineHeight: '1.5' }}>This is how customers see your profile. You can edit your information to attract more bookings.</p>
            <button onClick={() => navigate('/profile')} className="bms-btn-primary" style={{ width: '100%', padding: '15px', marginBottom: '15px' }}>✏️ Edit Profile</button>
            <div style={{ padding: '15px', backgroundColor: '#2a2a2a', borderRadius: '8px', fontSize: '14px', color: '#f84464', border: '1px solid #333' }}>
              📊 <strong>Profile Stats:</strong><br/>Daily Rate: ₹{worker.charges}/day<br/>Reviews: {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </div>
          </div>
        ) : user?.role !== 'worker' ? (
          <div className="bms-card" style={{ padding: '30px', position: 'sticky', top: '20px' }}>
            <h3 style={{ marginBottom: '20px', color: '#fff' }}>Book This Worker</h3>
            <button onClick={() => setShowChat(true)} className="bms-btn-primary" style={{ width: '100%', padding: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>💬 Chat Before Booking</button>
            {error && <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #f5c6cb' }}>{error}</div>}
            <form onSubmit={handleBooking}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#fff' }}>Date:</label>
                <input type="date" value={bookingData.date} onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })} min={new Date().toISOString().split('T')[0]} className="bms-input" style={{ width: '100%', padding: '10px' }} required />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#fff' }}>Time:</label>
                <input type="time" value={bookingData.time} onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })} className="bms-input" style={{ width: '100%', padding: '10px' }} required />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#fff' }}>Service:</label>
                <input type="text" value={bookingData.service} onChange={(e) => setBookingData({ ...bookingData, service: e.target.value })} placeholder="e.g., Plumbing repair, AC installation" className="bms-input" style={{ width: '100%', padding: '10px' }} required />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#fff' }}>Address:</label>
                <textarea value={bookingData.address} onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })} placeholder="Enter your complete address..." className="bms-input" style={{ width: '100%', padding: '10px', minHeight: '80px', resize: 'vertical' }} required />
              </div>
              <button type="submit" disabled={bookingLoading} className="bms-btn-primary" style={{ width: '100%', padding: '12px', opacity: bookingLoading ? 0.5 : 1, cursor: bookingLoading ? 'not-allowed' : 'pointer' }}>
                {bookingLoading ? 'Booking...' : 'Book Now'}
              </button>
            </form>
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#2a2a2a', borderRadius: '8px', textAlign: 'center', border: '1px solid #333' }}>
              <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#fff' }}>Estimated Cost</p>
              <p style={{ margin: 0, fontSize: '18px', color: '#f84464', fontWeight: 'bold' }}>₹{worker.charges}/day</p>
            </div>
          </div>
        ) : (
          <div className="bms-card" style={{ padding: '30px', position: 'sticky', top: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>👷♂️</div>
            <h3 style={{ color: '#999', marginBottom: '10px' }}>Worker Account</h3>
            <p style={{ color: '#999', margin: 0, lineHeight: '1.5' }}>Workers cannot book other workers. Only regular users can book services.</p>
          </div>
        )}
      </div>

      {showChat && <ChatSystem workerId={worker._id} workerName={worker.name} onClose={() => setShowChat(false)} />}
    </div>
  );
}

export default WorkerDetails;
