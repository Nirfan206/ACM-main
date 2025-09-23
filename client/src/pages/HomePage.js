import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const districts = ["Guntur", "Palnadu", "Prakasam"];

function HomePage() {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [availableServices, setAvailableServices] = useState([]);
  const [bookingData, setBookingData] = useState({
    service: '',
    serviceName: '',
    date: '',
    time: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const isLoggedIn = !!sessionStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      if (isLoggedIn) {
        try {
          const token = sessionStorage.getItem('token');
          const response = await api.get('/api/customer/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCustomerProfile(response.data);
        } catch (err) {
          console.error('Error fetching customer profile:', err);
          sessionStorage.removeItem('token');
          navigate('/login');
        }
      }
    };
    fetchProfile();
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get('/api/services');
        setAvailableServices(response.data);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please try again.');
      }
    };
    fetchServices();
  }, []);

  const handleBookNow = (serviceId = '', serviceName = '') => {
    if (!isLoggedIn) {
      navigate('/register');
    } else {
      setShowBookingForm(true);
      setError('');
      setSuccess('');
      setBookingData(prev => ({ 
        ...prev, 
        service: serviceId, 
        serviceName: serviceName,
        address: customerProfile?.profile?.address || ''
      }));
    }
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    if (name === 'service') {
      const selectedService = availableServices.find(s => s._id === value);
      setBookingData(prev => ({ 
        ...prev, 
        service: value, 
        serviceName: selectedService ? selectedService.type : '' 
      }));
    } else {
      setBookingData({ ...bookingData, [name]: value });
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingData.service || !bookingData.date || !bookingData.time || !bookingData.address) {
      setError('Please fill all required fields.');
      setSuccess('');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = sessionStorage.getItem('token');
      await api.post('/api/customer/bookings', {
        service: bookingData.service,
        date: bookingData.date,
        time: bookingData.time,
        address: bookingData.address,
        problemDescription: 'General booking from homepage'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Booking submitted successfully! Our team will contact you shortly.');

      setBookingData({
        service: '',
        serviceName: '',
        date: '',
        time: '',
        address: '',
      });
    } catch (err) {
      console.error('Booking submission failed:', err);
      setError(err.response?.data?.message || 'Failed to submit booking. Please try again.');
    } finally {
      setIsLoading(false);
      setTimeout(() => setShowBookingForm(false), 3000);
    }
  };

  const getServiceDetails = (serviceType) => {
    const service = availableServices.find(s => s.type.toLowerCase().includes(serviceType.toLowerCase()));
    return service || { _id: '', type: serviceType, description: `No description available for ${serviceType}.` };
  };

  const acService = getServiceDetails('ac');
  const fridgeService = getServiceDetails('fridge');
  const wmService = getServiceDetails('washing machine');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ paddingTop: '100px' }}>
        <br></br><br></br><br></br><br></br>
        <section style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center', maxWidth: '900px', margin: '0 auto', width: '100%', paddingLeft: '20px', paddingRight: '20px' }}>
            <a href="https://wa.me/9966972228" style={{ textDecoration: 'none' }}>
              <button style={{ padding: '0.8rem 2rem', background: 'var(--color-success)', color: 'var(--color-white)', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', transition: 'background-color 0.3s ease' }}>
                Customer Care Whatsapp Us
              </button>
            </a>
            <a href="tel:9966972228" style={{ textDecoration: 'none' }}>
              <button style={{ padding: '0.8rem 2rem', background: 'var(--color-error)', color: 'var(--color-white)', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', transition: 'background-color 0.3s ease' }}>
                Customer Care Call Now
              </button>
            </a>
          </section>

        <main style={{ flex: 1, maxWidth: '900px', margin: '0 auto', width: '100%', padding: '20px' }}>
          
          {showBookingForm && (
            <div style={{ maxWidth: '600px', margin: '0 auto 2rem', padding: '25px', backgroundColor: 'var(--color-light)', borderRadius: '12px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--color-primary)' }}>Book Your Service</h2>
              {error && <div style={{ padding: '10px', backgroundColor: 'rgba(var(--color-error-rgb), 0.15)', color: 'var(--color-error)', borderRadius: '5px', marginBottom: '15px' }}>{error}</div>}
              {success && <div style={{ padding: '10px', backgroundColor: 'rgba(var(--color-success-rgb), 0.15)', color: 'var(--color-success)', borderRadius: '5px', marginBottom: '15px' }}>{success}</div>}

              <form onSubmit={handleBookingSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--color-text)' }}>Service:</label>
                  <select 
                    name="service"
                    value={bookingData.service} 
                    onChange={handleBookingChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border)' }}
                    required
                  >
                    <option value="">Select Service</option>
                    {availableServices.map((service) => (
                      <option key={service._id} value={service._id}>{service.type}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--color-text)' }}>Date:</label>
                  <input 
                    type="date" 
                    name="date"
                    value={bookingData.date} 
                    onChange={handleBookingChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border)' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--color-text)' }}>Time:</label>
                  <input 
                    type="time" 
                    name="time"
                    value={bookingData.time} 
                    onChange={handleBookingChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border)' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--color-text)' }}>Address:</label>
                  <textarea 
                    name="address"
                    value={bookingData.address} 
                    onChange={handleBookingChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border)', minHeight: '100px' }}
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  style={{ width: '100%', padding: '12px', backgroundColor: isLoading ? 'var(--color-textLight)' : 'var(--color-secondary)', color: 'var(--color-white)', border: 'none', borderRadius: '5px', cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: 'bold' }}
                >
                  {isLoading ? 'Processing...' : 'Submit Booking'}
                </button>
              </form>
            </div>
          )}
          <section style={{ textAlign: 'center', margin: '2rem 0' }}>
            <h2 style={{ color: 'green', marginBottom: '1rem' }}>Our Services Video</h2>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
              <iframe
                src="https://youtu.be/IPQiSM1l2gE?si=xJZu-scZRqN8zcfo"
                title="Our Services Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '12px' }}
              ></iframe>
            </div>
          </section>

          <section style={{ marginBottom: '3rem', padding: '20px', backgroundColor: 'var(--color-white)', borderRadius: '12px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
            <h2 style={{ color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>Air Conditioner Repair & Service</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--color-text)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Your AC is more than a luxury; it's a necessity for staying cool and comfortable. Whether your unit is blowing warm air, making strange noises, or has stopped working entirely, our certified technicians are equipped to diagnose and repair all types of air conditioning systems. We handle everything from gas top-ups to compressor replacements and routine maintenance to keep your AC running efficiently all season long.
            </p>
          </section>

          <section style={{ marginBottom: '3rem', padding: '20px', backgroundColor: 'var(--color-white)', borderRadius: '12px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
            <h2 style={{ color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>Refrigerator Repair & Service</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--color-text)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              A broken refrigerator can lead to spoiled food and wasted money. Our team provides comprehensive repair services for all refrigerator issues, including faulty thermostats, compressor problems, refrigerant leaks, and ice maker malfunctions. We work quickly to get your fridge back to its optimal cooling state, preserving your food and your peace of mind.
            </p>
          </section>

          <section style={{ marginBottom: '3rem', padding: '20px', backgroundColor: 'var(--color-white)', borderRadius: '12px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
            <h2 style={{ color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>Washing Machine Repair & Service</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--color-text)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              From leaks and strange noises to cycles that won't complete, a faulty washing machine can put a halt to your laundry routine. We specialize in repairing both top-loading and front-loading models, addressing common issues like drainage problems, drum failures, and electrical faults. Our service ensures your machine is running smoothly, so you can get back to your routine with clean clothes.
            </p>
          </section>

          <section style={{ textAlign: 'center', marginTop: '4rem', padding: '20px', backgroundColor: 'var(--color-white)', borderRadius: '12px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '1.5rem', color: 'var(--color-accent)', fontWeight: 'bold', marginBottom: '0.5rem' }}>5.0 / 5.0 Google reviews</div>
            <div style={{ marginBottom: '0.5rem', fontSize: '1.1rem', color: 'var(--color-text)' }}>
              <span style={{ fontWeight: 'bold' }}>Hours:</span> Open 24 hours
            </div>
            <div style={{ marginBottom: '0.5rem', fontSize: '1.1rem', color: 'var(--color-text)' }}>
              <span style={{ fontWeight: 'bold' }}>Customer Care Number:</span> 9966972228
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default HomePage;
