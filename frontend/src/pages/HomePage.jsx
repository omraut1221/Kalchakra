// Homepage.jsx
import { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import image from '../assets/watch1.png';

const Homepage = () => {
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
        <section className="container mx-auto px-4 py-20 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <img
              src={image}
              alt="Elegant Luxury Watch"
              width={520}
              height={400}
              className="rounded-lg shadow-2xl"
            />
          </div>
          <div className="md:w-1/2 md:pl-12 space-y-6">
            <h1 className="text-5xl font-bold text-black">Welcome to Kalchakra</h1>
            <p className="text-xl text-gray-600 text-justify leading-relaxed">
              At Kalchakra, we honor the eternal cycle of time by offering an exclusive collection of
              luxury timepieces and world-class watch services. Every piece we present is a blend of
              precision engineering, timeless craftsmanship, and refined elegance ensuring that your
              watch is not just an accessory, but a legacy that endures.
            </p>

          </div>
        </section>
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12 text-gold">Where Time Meets Art</h2>
            <p className="text-gray-600 text-justify max-w-2xl mx-auto">
              At Kalchakra, every timepiece is a celebration of precision and creativity.
              Our master watchmakers blend age-old horological traditions with modern
              innovation to craft watches that are not only instruments of time but also
              expressions of elegance, individuality, and timeless sophistication.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Homepage;
