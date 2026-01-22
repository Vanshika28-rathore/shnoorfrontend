import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../../auth/firebase';
import ForgotPasswordView from './view.jsx';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(
        'If an account exists with this email, a reset link has been sent.'
      );
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ForgotPasswordView
      email={email}
      setEmail={setEmail}
      message={message}
      error={error}
      loading={loading}
      handleReset={handleReset}
    />
  );
};

export default ForgotPassword;
