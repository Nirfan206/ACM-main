import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

function PrivacyPolicyPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, maxWidth: '900px', margin: '0 auto', width: '100%', paddingTop: '100px', padding: '20px' }}>
        <h1 style={{ textAlign: 'center', color: 'var(--color-primary)', marginBottom: '2rem' }}>Privacy Policy</h1>
        <div style={{ background: 'var(--color-white)', padding: '1.5rem', borderRadius: '10px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', lineHeight: '1.6', color: 'var(--color-text)' }}>
          <p><strong>Last updated: September 19, 2025</strong></p>
          <p>AL CHAAN MEERA ("us", "we", or "our") operates the AL CHAAN MEERA website (the "Service").</p>
          <p>This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>
          <p>We use your data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this policy.</p>

          <h2>Information Collection And Use</h2>
          <p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>

          <h3>Types of Data Collected</h3>
          <h4>Personal Data</h4>
          <p>While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to:</p>
          <ul>
            <li>Phone number</li>
            <li>Name</li>
            <li>Email address</li>
            <li>Address</li>
            <li>Cookies and Usage Data</li>
          </ul>

          <h4>Usage Data</h4>
          <p>We may also collect information how the Service is accessed and used ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>

          <h2>Use of Data</h2>
          <p>AL CHAAN MEERA uses the collected data for various purposes:</p>
          <ul>
            <li>To provide and maintain the Service</li>
            <li>To notify you about changes to our Service</li>
            <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
            <li>To provide customer care and support</li>
            <li>To provide analysis or valuable information so that we can improve the Service</li>
            <li>To monitor the usage of the Service</li>
            <li>To detect, prevent and address technical issues</li>
          </ul>

          <h2>Security Of Data</h2>
          <p>The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>

          <h2>Changes To This Privacy Policy</h2>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
          <p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default PrivacyPolicyPage;