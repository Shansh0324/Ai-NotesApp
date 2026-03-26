import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOTPAuth, verifyOTPProfile } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { MailCheck } from 'lucide-react';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const { user, loadUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);

  useEffect(() => {
    if (user?.isVerified) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    if (element.nextSibling && element.value !== '') {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && otp[index] === '' && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Allow pasting 6 digit code
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    if (/^\d{6}$/.test(pastedData)) {
      setOtp(pastedData.split(''));
      inputRefs.current[5].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      return toast.error('Please enter a 6-digit OTP');
    }

    setLoading(true);
    try {
      const isFromProfile = location.state?.fromProfile;
      if (isFromProfile) {
        await verifyOTPProfile({ otp: otpValue });
      } else {
        await verifyOTPAuth({ otp: otpValue });
      }

      toast.success('Email verified successfully!');
      await loadUser();
      navigate(isFromProfile ? '/profile' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto mt-12 transition-all animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-600">
            <MailCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h2>
          <p className="text-gray-500 text-sm mb-8">
            We've sent a 6-digit code to <span className="font-medium text-gray-700">{user?.email}</span>. Code expires in 10 minutes.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-center gap-2">
              {otp.map((data, index) => {
                return (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    className="w-12 h-14 text-center text-xl font-bold text-primary-700 bg-gray-50 border border-gray-200 rounded-xl focus:bg-primary-50 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                    type="text"
                    maxLength="1"
                    value={data}
                    onChange={e => handleChange(e.target, index)}
                    onFocus={e => e.target.select()}
                    onKeyDown={e => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                  />
                );
              })}
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || otp.join('').length < 6}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
              
              {!location.state?.fromProfile && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="w-full text-gray-500 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Skip for now
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
