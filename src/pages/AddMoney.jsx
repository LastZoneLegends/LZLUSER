import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { compressImage } from '../utils/imageUtils';
import { ArrowLeft, QrCode, Upload, Info, CheckCircle } from 'lucide-react';
import Layout from '../components/common/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loader from '../components/common/Loader';
import { createPaymentOrder } from "../services/paymentService";
import { formatCurrency } from '../utils/formatters';

export default function AddMoney() {
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const fileInputRef = useRef(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    utr: '',
    screenshot: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'app_settings', 'main'));
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 800, 0.7);
      setFormData({ ...formData, screenshot: compressed });
    } catch (error) {
      console.error('Error compressing image:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || !formData.utr || !formData.screenshot) {
      alert('Please fill all fields and upload screenshot');
      return;
    }

    if (parseFloat(formData.amount) < (settings?.minDeposit || 100)) {
      alert(`Minimum deposit amount is ${formatCurrency(settings?.minDeposit || 100)}`);
      return;
    }

    setSubmitting(true);
    try {
      // Create deposit request
      const depositRef = await addDoc(collection(db, 'deposit_requests'), {
        userId: currentUser.uid,
        userName: userData.displayName,
        userEmail: userData.email,
        amount: parseFloat(formData.amount),
        utr: formData.utr,
        screenshot: formData.screenshot,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Create pending transaction for history
      await addDoc(collection(db, 'transactions'), {
        userId: currentUser.uid,
        userName: userData.displayName,
        userEmail: userData.email,
        type: 'deposit',
        amount: parseFloat(formData.amount),
        description: `Deposit Request - UTR: ${formData.utr}`,
        status: 'pending',
        referenceId: depositRef.id,
        createdAt: serverTimestamp()
      });

      setSuccess(true);
    } catch (error) {
      console.error('Error submitting deposit:', error);
      alert('Failed to submit deposit request');
    } finally {
      setSubmitting(false);
    }
  };

const handleTranzupiPayment = async () => {
  try {

    if (!formData.amount) {
      alert("Enter amount first");
      return;
    }

    const data = await createPaymentOrder(
  formData.amount,
  currentUser.uid,
  "9876543210"
);

    if (data.result?.payment_url) {
      
  window.location.href = data.result.payment_url;
      
    } else {

      alert("Payment start failed");

    }

  } catch (error) {

    console.log(error);
    alert("Something went wrong");

  }
};

  if (loading) {
    return (
      <Layout hideNav>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader />
        </div>
      </Layout>
    );
  }

  if (success) {
    return (
      <Layout hideNav>
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Request Submitted!</h2>
          <p className="text-gray-400 text-center mb-6">
            Your deposit request has been submitted. It will be verified and credited within 24 hours.
          </p>
          <Button onClick={() => navigate('/wallet')}>
            Back to Wallet
          </Button>
        </div>
      </Layout>
    );
  }

    return (
  <Layout hideNav>

    {/* Header */}

    <div className="sticky top-0 z-40 bg-dark-500 border-b border-dark-300">
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-dark-300 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <h1 className="font-semibold text-white text-lg">
          Add Money
        </h1>
      </div>
    </div>


    {/* Page Content */}

    <div className="px-4 py-5">

      {/* Enter Amount Card */}

      <div className="bg-dark-400 rounded-2xl p-5 shadow-md">

        <p className="text-gray-400 text-sm mb-2">
          Enter Amount
        </p>

        <input
          type="number"
          value={formData.amount}
          onChange={(e) =>
            setFormData({
              ...formData,
              amount: e.target.value
            })
          }
          placeholder={`Minimum ₹${settings?.minDeposit || 20}`}
          className="w-full bg-dark-300 border border-dark-200 rounded-xl px-4 py-3 text-lg text-white"
        />

      </div>


      {/* Quick Amount Buttons */}

      <div className="grid grid-cols-4 gap-3 mt-4 mb-5">

        {[50, 100, 200, 500].map((amt) => (

          <button
            key={amt}
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                amount: amt
              })
            }
            className="bg-dark-400 border border-dark-200 py-2 rounded-lg hover:bg-primary-500/20 transition"
          >
            ₹{amt}
          </button>

        ))}

      </div>


      {/* Pay Now Button */}

      <button
        type="button"
        onClick={handleTranzupiPayment}
        className="w-full bg-gradient-to-r 
        from-indigo-500 to-purple-600 py-3 
        rounded-xl font-semibold text-lg shadow-lg"
      >

        Pay Now

      </button>


      {/* Instructions Card */}

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 mt-6">

        <div className="flex gap-3">

          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />

          <div className="text-sm text-blue-300">

            <p className="font-medium mb-1">
              Instructions
            </p>

            <ol className="list-decimal list-inside space-y-1 text-blue-300/80">

              <li>
                Enter amount and tap Pay Now
              </li>

              <li>
                Payment opens in GPay / PhonePe / Paytm
              </li>

              <li>
                Use your username in remark (optional)
              </li>

              <li>
                Wallet auto-update feature coming next 🚀
              </li>

            </ol>

          </div>

        </div>

      </div>

    </div>

  </Layout>
);

        
}
