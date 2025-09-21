import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

function TermsConditionsPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, maxWidth: '900px', margin: '0 auto', width: '100%', paddingTop: '100px', padding: '20px' }}>
        <h1 style={{ textAlign: 'center', color: 'var(--color-primary)', marginBottom: '2rem' }}>Terms & Conditions</h1>
        <div style={{ background: 'var(--color-white)', padding: '1.5rem', borderRadius: '10px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', lineHeight: '1.6', color: 'var(--color-text)' }}>
          <p><strong>Last updated: September 19, 2025</strong></p>
          <p>Please read these Terms and Conditions ("Terms", "Terms and Conditions") carefully before using the AL CHAAN MEERA website (the "Service") operated by AL CHAAN MEERA ("us", "we", or "our").</p>
          <p>Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users and others who access or use the Service.</p>
          <p>By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.</p>

          <h2>Accounts</h2>
          <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
          <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.</p>
          <p>You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>

          <h2>Services</h2>
          <p>AL CHAAN MEERA provides appliance repair and maintenance services. All services are subject to availability and our technicians' schedules. We reserve the right to refuse or cancel any service request at our sole discretion.</p>
          <p>While we strive to provide accurate estimates, the final cost of a service may vary based on the actual work performed and parts required. We will communicate any significant changes to the estimated cost before proceeding with the work.</p>

          <h2>Links To Other Web Sites</h2>
          <p>Our Service may contain links to third-party web sites or services that are not owned or controlled by AL CHAAN MEERA.</p>
          <p>AL CHAAN MEERA has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services. You further acknowledge and agree that AL CHAAN MEERA shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, goods or services available on or through any such web sites or services.</p>

          <h2>Changes</h2>
          <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
          <p>By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default TermsConditionsPage;