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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ paddingTop: '100px' }}>
        <section style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center', flexWrap: 'wrap', padding: '0 20px' }}>
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
                {/* ... your booking form JSX ... */}
            </div>
          )}

          <section style={{ textAlign: 'center', margin: '2rem 0' }}>
            <h2 style={{ color: 'green', marginBottom: '1rem' }}>Our Services Video</h2>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
              <iframe
                src="https://www.youtube.com/embed/hz1nmTo24vE"
                title="Our Services Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '12px' }}
              ></iframe>
            </div>
          </section>

          {/* --- SEO OPTIMIZED CONTENT STARTS HERE --- */}
          <section style={{ marginBottom: '3rem', padding: '20px', backgroundColor: 'var(--color-white)', borderRadius: '12px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
            <h2 style={{ color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>
              Air Conditioner Repair in Chilakaluripeta
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--color-text)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Need fast and reliable AC repair in Chilakaluripeta? AL CHAAN MEERA provides expert AC service for all brands. Whether your unit needs gas refilling, is not cooling, or making noise, our certified technicians are ready to help 24/7. We are the trusted choice for air conditioner service in the Palnadu and Guntur areas.
            </p>
          </section>

          <section style={{ marginBottom: '3rem', padding: '20px', backgroundColor: 'var(--color-white)', borderRadius: '12px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
            <h2 style={{ color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>
              Refrigerator & Fridge Service
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--color-text)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              A broken refrigerator can spoil your food and peace of mind. Our team offers comprehensive fridge repair in Chilakaluripeta for all issues, including faulty thermostats, compressor problems, and gas leaks. We work quickly to get your refrigerator back to optimal cooling, serving areas across Guntur and Prakasam.
            </p>
          </section>

          <section style={{ marginBottom: '3rem', padding: '20px', backgroundColor: 'var(--color-white)', borderRadius: '12px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
            <h2 style={{ color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>
              Washing Machine Repair & Service
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--color-text)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Don't let a faulty washing machine disrupt your routine. We specialize in washing machine repair for all top and front-loading models in Chilakaluripeta. From drainage problems to drum failures, our service ensures your machine runs smoothly so you can get back to your day.
            </p>
          </section>
          {/* --- SEO OPTIMIZED CONTENT ENDS HERE --- */}

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
