import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

function ServicesPage() {
  // Theme colors
  const themeRed = '#e74c3c';
  const themeYellow = '#f39c12';
  const themeGreen = '#27ae60';
  const themeWhite = '#ecf0f1';
  const themeText = '#2c3e50';
  
  // Apply theme colors as CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty('--theme-red', themeRed);
    document.documentElement.style.setProperty('--theme-yellow', themeYellow);
    document.documentElement.style.setProperty('--theme-green', themeGreen);
    document.documentElement.style.setProperty('--theme-white', themeWhite);
    document.documentElement.style.setProperty('--theme-text', themeText);
  }, []);
  
  // Service data with images and descriptions
  const services = [
    {
      id: 1,
      name: 'Air Conditioner Services',
      description: 'Professional AC installation, repair, and maintenance services for all brands and models. We provide expert solutions for residential and commercial air conditioning systems.',
      images: [
        { src: '/ac 1.jpeg', alt: 'AC Installation' },
        { src: '/ac 2.jpeg', alt: 'AC Repair' },
        { src: '/ac 3.jpeg', alt: 'AC Maintenance' },
        { src: '/ac 4.jpeg', alt: 'AC Cleaning' },
      ]
    },
    {
      id: 2,
      name: 'Refrigerator Services',
      description: 'Complete refrigerator repair and maintenance services. Our technicians are trained to handle all types of refrigerator issues including cooling problems, water leakage, and noise issues.',
      images: [
        { src: '/fridge 1.jpeg', alt: 'Fridge Repair' },
        { src: '/fridge 2.jpeg', alt: 'Fridge Maintenance' },
        { src: '/fridge 3.jpeg', alt: 'Fridge Service' },
      ]
    },
    {
      id: 3,
      name: 'Washing Machine Services',
      description: 'Expert washing machine repair and maintenance services for all brands. We fix issues like water leakage, spinning problems, unusual noises, and more with professional care.',
      images: [
        { src: '/wm 1.jpeg', alt: 'Washing Machine Repair' },
        { src: '/wm 2.jpeg', alt: 'Washing Machine Maintenance' },
        { src: '/wm 3.jpeg', alt: 'Washing Machine Service' },
        { src: '/wm 4.jpeg', alt: 'Washing Machine Installation' },
        { src: '/wm 5.jpeg', alt: 'Washing Machine Cleaning' },
      ]
    },
    {
      id: 4,
      name: 'Electrical Services',
      description: 'Comprehensive electrical repair, installation, and maintenance for homes and businesses. Our certified electricians handle wiring, fixture installation, fault finding, and more.',
      images: [
        { src: '/a i o.jpeg', alt: 'Electrical Repair' }, // Using a generic image for now
        { src: '/a i o.jpeg', alt: 'Wiring & Fixtures' },
        { src: '/a i o.jpeg', alt: 'Fault Finding' },
      ]
    },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000, background: 'var(--color-white)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
        <nav style={{display:'flex',justifyContent:'center',gap:'32px',fontWeight:'bold',fontSize:'1.1rem', padding: '1rem 0'}}>
          <Link to="/" style={{textDecoration:'none',color:themeRed}}>Home</Link>
          <Link to="/services" style={{textDecoration:'none',color:themeYellow}}>Services</Link>
          
          <Link to="/login" style={{textDecoration:'none',color:themeRed}}>Login</Link>
          <Link to="/register" style={{textDecoration:'none',color:themeGreen}}>Register</Link>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, maxWidth: '900px', margin: '0 auto', width: '100%', paddingTop: '80px' }}>
        <h1 style={{ textAlign: 'center', color: themeText, marginBottom: '2rem' }}>Our Services</h1>
        
        {services.map(service => (
          <div key={service.id} style={{ marginBottom: '3rem', background: themeWhite, padding: '1.5rem', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: `1px solid ${themeText}` }}>
            <h2 style={{ color: themeRed, marginBottom: '1rem' }}>{service.name}</h2>
            <p style={{ fontSize: '1.1rem', color: themeText, marginBottom: '1.5rem' }}>{service.description}</p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
              {service.images.map((image, index) => (
                <div key={index} style={{ textAlign: 'center' }}>
                  <img 
                    src={image.src} 
                    alt={image.alt} 
                    style={{ 
                      width: '200px', 
                      height: '200px', 
                      objectFit: 'cover', 
                      borderRadius: '8px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <p style={{ marginTop: '0.5rem', color: themeText }}>{image.alt}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <Link to="/">
            <button style={{ padding: '0.75rem 2rem', background: themeGreen, color: themeWhite, border: 'none', borderRadius: '4px', fontSize: '1.1rem', cursor: 'pointer' }}>
              Back to Home
            </button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: themeText, color: themeWhite, padding: '1.5rem 0', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', fontSize: '1rem' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 'bold' }}>Address:</span> అత్తర్ అల్లాహ్ బక్ష్ నగర్ (Attar Allah Baksh Nagar), 2వ లైను (2nd Line గవవర్నమెంట్ హాస్పిటల్ ప్రక్కన, Chirala Rd, beside Government Hospital, Chilakaluripet
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 'bold' }}>Services Provided In:</span> Chilakaluripet, Guntur, Palnadu, Prakasam.
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 'bold' }}>Owner:</span> Shaik Mohammad Rafi
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 'bold' }}>Customer Care Number:</span> 9966972228
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <a href="/privacy" style={{ color: '#fff', textDecoration: 'underline', marginRight: '1rem' }}>Privacy Policy</a>
            <a href="/terms" style={{ color: '#fff', textDecoration: 'underline' }}>Terms & Conditions</a>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.95rem', color: '#aaa' }}>
            Developed by NANASANA IRFAN
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ServicesPage;