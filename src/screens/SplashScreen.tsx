'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import bgImage from '../../public/images/bg_image.png';
import logoImage from '../../public/images/logo_nexus_portal.png';

export default function SplashScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2500;
    const intervalTime = 50;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      setProgress(Math.min((currentStep / steps) * 100, 100));
      
      if (currentStep >= steps) {
        clearInterval(interval);
        router.push('/login');
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#071324',
        backgroundImage: `url(${bgImage.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
        <div style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img 
            src={logoImage.src} 
            alt="Nexus Logo" 
            style={{ width: '160px', height: 'auto', objectFit: 'contain', marginBottom: '16px' }}
          />
          <h1 style={{ 
            color: '#FFFFFF', 
            fontSize: '36px', 
            fontWeight: 700, 
            letterSpacing: '-0.02em',
            lineHeight: 1,
            marginBottom: '8px'
          }}>
            NEXUS
          </h1>
          <div style={{ 
            color: '#8FA3C4', 
            fontSize: '11px', 
            fontWeight: 600, 
            letterSpacing: '0.15em',
            textTransform: 'uppercase'
          }}>
            AML PORTAL
          </div>
        </div>

        <div 
          style={{
            width: '140px',
            height: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            overflow: 'hidden',
            marginTop: '20px'
          }}
        >
          <div 
            style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: '#C9A227',
              borderRadius: '4px',
              transition: 'width 0.1s linear'
            }}
          />
        </div>
      </div>
    </div>
  );
}
