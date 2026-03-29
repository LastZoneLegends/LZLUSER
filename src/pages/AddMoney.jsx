import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { compressImage } from '../utils/imageUtils';
import { Info, ShieldCheck, Smartphone, CheckCircle2, AlertTriangle, Headphones, ArrowLeft, CheckCircle } from 'lucide-react';
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
  const [redirecting, setRedirecting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [minDeposit, setMinDeposit] = useState(10);
  const [errorMessage, setErrorMessage] = useState("");
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
        setMinDeposit(data.minDeposit); // ⭐ important
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

  if (errorMessage) {

    const timer = setTimeout(() => {

      setErrorMessage("");

    }, 3000);

    return () => clearTimeout(timer);

  }

}, [errorMessage]);

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

    // amount empty check
    if (!formData.amount) {
  setErrorMessage("Enter amount first");
  return;
}

   // minimum deposit validation 

const minimumAmount = settings?.minDeposit || minDeposit;

if (Number(formData.amount) < minimumAmount) {
  setErrorMessage(`Minimum amount should be ₹${minimumAmount}`);
  return;
}

    setRedirecting(true);   // ⭐ popup loader show here

    // create order request
    const data = await createPaymentOrder(
      formData.amount,
      currentUser.uid,
      "9876543210"
    );

    // redirect to payment page
    if (data.result?.payment_url) {

      setRedirecting(false);   // ⭐ popup hide before redirect

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
          placeholder={`Minimum ₹${settings?.minDeposit || minDeposit}`}
          className="w-full bg-dark-300 border border-dark-200 rounded-xl px-4 py-3 text-lg text-white"
        />

      </div>


      {/* Quick Amount Buttons */}

      <div className="grid grid-cols-4 gap-3 mt-4 mb-5">

        {[20, 50, 100, 200].map((amt) => (

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
        rounded-xl font-semibold text-lg shadow-lg mb-5"
      >

        Pay Now

      </button>


      {/* Instructions Card */}

      <div className="bg-[#0f1b2b] border border-blue-500/20 rounded-2xl p-5 shadow-lg">

  {/* Title with circle icon */}
  <div className="flex items-center gap-3 mb-4">

    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-500/20">
      <Info className="text-blue-400" size={20} />
    </div>

    <h2 className="text-xl font-semibold text-white">
      Instructions
    </h2>

  </div>


  {/* Trust badge */}
  <p className="text-green-400 text-xs mb-4">
    ✔ 100% Instant Wallet Credit after successful payment
  </p>


  <ul className="space-y-4 text-gray-300 text-sm">

    <li className="flex items-start gap-3">

     <div className="icon-circle">
        <ShieldCheck className="text-green-400" size={18} />
     </div>

      <span>
        Enter the amount you want to add to your wallet.
      </span>

    </li>


    <li className="flex items-start gap-3">

      <div className="icon-circle">
        <Smartphone className="text-green-400" size={18} />
      </div>

      <span>
        Click <b className="text-white">Pay Now</b> to open secure payment page.
      </span>

    </li>


    <li className="flex items-start gap-3">

      <div className="icon-circle">
        <CheckCircle className="text-green-400" size={18} />
      </div>

      <span>
        Complete payment using any UPI app (PhonePe, GPay, Paytm, etc).
      </span>

    </li>


    <li className="flex items-start gap-3">

      <div className="icon-circle">
        <CheckCircle2 className="text-green-400" size={18} />
      </div>

      <span>
        Your wallet will be credited automatically after successful payment.
      </span>

    </li>


    <li className="flex items-start gap-3">

      <div className="icon-circle">
        <AlertTriangle className="text-yellow-400" size={18} />
      </div>

      <span>
        Do not refresh or close the page during payment.
      </span>

    </li>


    <li className="flex items-start gap-3">

      <div className="icon-circle">
        <Headphones className="text-blue-400" size={18} />
      </div>

      <span>
        If payment is successful but balance not updated within 1 minute,
        contact support with Screenshot.
      </span>

    </li>

  </ul>

</div>

    </div>

    {
  errorMessage && (
    <div className="fixed bottom-24 inset-x-0 flex justify-center z-50">

      <div className="bg-gray-800 text-white px-5 py-2 rounded-full shadow-lg
      text-sm flex items-center gap-2 animate-fade-in">

        ⚠️ {errorMessage}

      </div>

    </div>
  )
    }

    {redirecting && (
  <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">

    {/* Popup Card */}
    <div className="pointer-events-auto bg-dark-400/95 backdrop-blur-md border border-gray-700 px-6 py-5 rounded-2xl shadow-2xl flex flex-col items-center gap-3 animate-fade-in">

      {/* Spinner */}
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>

      {/* Heading */}
      <p className="text-white font-semibold text-sm">
        Redirecting to secure payment...
      </p>

      {/* Subtext */}
      <p className="text-gray-400 text-xs">
        Please wait while gateway loads
      </p>

    </div>

  </div>
)}

  </Layout>
);

        
}
