import * as React from 'react';

interface ApprovalEmailProps {
  name: string;
  role: string;
}

export const ApprovalEmailTemplate: React.FC<Readonly<ApprovalEmailProps>> = ({
  name,
  role,
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
      Welcome.<br />To the Studio.
    </h1>
    
    <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>
      Hello {name},<br /><br />
      Great news—your application to join **Kal Studio** as a **{role}** has been approved by the owner. 
      Your dashboard workspace is now fully unlocked and ready for your strategy and build.
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
        Access Dashboard
      </a>
    </div>

    <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '40px 0' }} />
    
    <p style={{ fontSize: '10px', color: '#a0a0a0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
      Kal Studio — Premium Digital Architecture & Growth.
    </p>
  </div>
);
