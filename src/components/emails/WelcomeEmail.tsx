import * as React from 'react';

interface WelcomeEmailProps {
  name: string;
}

export const WelcomeEmailTemplate: React.FC<Readonly<WelcomeEmailProps>> = ({
  name,
}) => (
  <div style={{
    fontFamily: 'Helvetica, Arial, sans-serif',
    backgroundColor: '#ffffff',
    color: '#1a1a1a',
    padding: '40px',
    maxWidth: '600px',
    margin: '0 auto',
    border: '1px solid #f0f0f0'
  }}>
    <h1 style={{
      fontSize: '48px',
      fontWeight: 'bold',
      letterSpacing: '-0.05em',
      marginBottom: '24px',
      color: '#1a1a1a'
    }}>
      Welcome.<br />To Kal Studio.
    </h1>
    
    <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>
      Hello {name},<br /><br />
      Welcome to **Kal Studio**. You are now part of our elite digital architecture team.
      Your workspace has been initialized and is ready for use.
    </p>

    <div style={{ marginBottom: '40px' }}>
      <a href={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login`} style={{
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        padding: '16px 32px',
        textDecoration: 'none',
        borderRadius: '100px',
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.2em'
      }}>
        Access Portal
      </a>
    </div>

    <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '40px 0' }} />
    
    <p style={{ fontSize: '10px', color: '#a0a0a0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
      Kal Studio — High-End Web Architecture & Growth.
    </p>
  </div>
);
