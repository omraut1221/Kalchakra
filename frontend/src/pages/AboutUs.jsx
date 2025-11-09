import { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';

const AboutUs = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollPosition(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Header />
      <main className="flex-grow pt-20">
        <section className="container mx-auto px-4 py-20 flex flex-col items-center md:items-start">
          <div className="md:w-2/3 space-y-6">
            <h1 className="text-5xl font-bold text-black text-center md:text-left">About Us</h1>
            <p className="text-xl text-gray-600 text-justify">
              At Kalchakra, we specialize in premium luxury timepieces and exceptional watch services.
              Inspired by the eternal cycle of time, every watch we present reflects precision, craftsmanship, 
              and timeless elegance. Our mission is to deliver not just exquisite products but also an 
              unforgettable experience for our valued customers.
            </p>
            <p className="text-xl text-gray-600 text-justify">
              Whether you are purchasing your first luxury watch or seeking expert care for your 
              treasured collection, Kalchakra is here to meet your needs with accuracy, trust, and dedication.
            </p>
          </div>
        </section>
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12 text-gold">Our Expertise</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-justify">
              Kalchakra is more than a name in luxury watches it is a promise of excellence. 
              From repairs and maintenance to bespoke customizations, our team of skilled 
              watchmakers combines traditional artistry with modern techniques to ensure 
              your timepiece remains flawless for years to come.
            </p>
          </div>
        </section>
      </main>
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Kalchakra. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;
