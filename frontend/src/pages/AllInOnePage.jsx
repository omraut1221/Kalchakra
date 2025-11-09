import { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import { useNavigate } from 'react-router-dom';

const AllInOnePage = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [user, setUser] = useState(null); // ✅ Correct: hook inside component
  const navigate = useNavigate();

  // ✅ Load logged-in user from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      console.error("Error reading user from localStorage", e);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollPosition(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  // ✅ Optional: block direct URL access to admin pages
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (user?.role !== "admin" && currentPath.includes("/add-watch")) {
      navigate("/track-watch");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Header />
      <main className="flex-grow pt-20">
        <section className="container mx-auto px-4 py-20">
          <h1 className="text-5xl font-bold text-black text-center">Terms, Privacy & FAQ</h1>

          {/* ✅ Admin-only section */}
          {user?.role === "admin" ? (
            <section className="mt-12 border border-yellow-300 bg-yellow-50 rounded-lg p-6 shadow-sm">
              <h2 className="text-3xl font-bold text-black mb-3">Admin Dashboard Access</h2>
              <p className="text-gray-700">
                You are logged in as <strong>Admin</strong>.  
                You can access watch management features like adding new watches, updating service statuses,  
                and viewing all customer watch details from your admin dashboard.
              </p>
              <div className="mt-4">
                <button
                  onClick={() => navigate("/add-watch")}
                  className="inline-block bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition duration-300"
                >
                  Add New Watch
                </button>
              </div>
            </section>
          ) : (
            // ✅ Customer-only message
            <section className="mt-12 border border-gray-200 bg-gray-50 rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Welcome to Kalchakra</h2>
              <p className="text-gray-700">
                You are logged in as a <strong>Customer</strong>.  
                You can view and track your watches but cannot add or modify watch details.  
                Please contact the store admin for updates about your service.
              </p>
            </section>
          )}

          {/* Terms and Conditions Section */}
          <section className="mt-12">
            <h2 className="text-4xl font-bold text-black mb-4">Terms and Conditions</h2>
            <p className="text-gray-600">
              Welcome to Kalchakra. By accessing or using our services, you agree to comply with our terms and conditions. 
              We provide premium watch sales and services, and any transactions or interactions are governed by the terms outlined here.
              Please read carefully to ensure a smooth experience with our brand.
            </p>
          </section>

          {/* Privacy Policy Section */}
          <section className="mt-12">
            <h2 className="text-4xl font-bold text-black mb-4">Privacy Policy</h2>
            <p className="text-gray-600">
              Kalchakra respects your privacy and is committed to protecting your personal information. 
              We collect and use your data solely to improve your experience and provide our services.
              Any information you provide is stored securely and will not be shared with third parties without your consent.
            </p>
          </section>

          {/* FAQ Section */}
          <section className="mt-12">
            <h2 className="text-4xl font-bold text-black mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {/* FAQ 1 */}
              <div className="border-b border-gray-300 py-4">
                <button
                  onClick={() => toggleFAQ(1)}
                  className="text-left w-full text-xl font-semibold text-gray-700 focus:outline-none"
                >
                  What services does Kalchakra offer?
                </button>
                {activeFAQ === 1 && (
                  <p className="text-gray-600 mt-2">
                    Kalchakra specializes in luxury watch sales and offers a variety of services including repairs, 
                    maintenance, and customizations to ensure your timepiece stays in top condition.
                  </p>
                )}
              </div>

              {/* FAQ 2 */}
              <div className="border-b border-gray-300 py-4">
                <button
                  onClick={() => toggleFAQ(2)}
                  className="text-left w-full text-xl font-semibold text-gray-700 focus:outline-none"
                >
                  How does Kalchakra protect my personal information?
                </button>
                {activeFAQ === 2 && (
                  <p className="text-gray-600 mt-2">
                    We take your privacy seriously and implement advanced security measures to safeguard your data.
                    Your information is used only for enhancing your experience and fulfilling your requests.
                  </p>
                )}
              </div>

              {/* FAQ 3 */}
              <div className="border-b border-gray-300 py-4">
                <button
                  onClick={() => toggleFAQ(3)}
                  className="text-left w-full text-xl font-semibold text-gray-700 focus:outline-none"
                >
                  How can I contact customer support?
                </button>
                {activeFAQ === 3 && (
                  <p className="text-gray-600 mt-2">
                    You can reach us via email at <strong>omraut2103@gmail.com</strong> or by phone at <strong>+91 9371516675</strong>.
                    Our support team is here to assist you with any inquiries or issues.
                  </p>
                )}
              </div>
            </div>
          </section>
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

export default AllInOnePage;
