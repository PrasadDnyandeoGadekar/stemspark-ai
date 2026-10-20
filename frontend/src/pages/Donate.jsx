import { useState } from 'react';
import { Heart, GraduationCap, BookOpen, Laptop, IndianRupee } from 'lucide-react';

function Donate() {
  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');

  const handleDonate = (e) => {
    e.preventDefault();
    const finalAmount = customAmount || amount;
    // In a real app, this would connect to Razorpay or Stripe
    alert(`Thank you for your generous pledge of ₹${finalAmount}! Payment gateway integration pending.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10 text-center sm:mb-16">
          <Heart className="mx-auto mb-4 h-10 w-10 text-rose-500 sm:h-12 sm:w-12" />
          <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Empower an Orphan's Future
          </h1>
          <p className="mx-auto max-w-2xl text-base text-gray-600 sm:text-xl">
            100% of your donation provides STEM education, devices, and AI tutoring to children without parental care.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-8">
          
          {/* Left Column: Impact Details */}
          <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Impact</h2>
            
            <div className="space-y-6 sm:space-y-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-indigo-50 p-3 rounded-xl">
                  <Laptop className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-900">Digital Access</h3>
                  <p className="mt-1 text-gray-600">Fund laptops and stable internet connections for orphanages to access STEMSpark AI.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 bg-purple-50 p-3 rounded-xl">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-900">STEM Kits</h3>
                  <p className="mt-1 text-gray-600">Provide hands-on robotics, chemistry, and electronics kits for practical learning.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 bg-emerald-50 p-3 rounded-xl">
                  <GraduationCap className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-900">Scholarships</h3>
                  <p className="mt-1 text-gray-600">Sponsor advanced certification courses and college prep for high-school students.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Donation Form */}
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xl sm:p-8">
            <form onSubmit={handleDonate}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Make a Donation</h2>
              
              {/* Preset Amounts */}
              <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3">
                {[500, 1000, 5000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => { setAmount(preset); setCustomAmount(''); }}
                    className={`flex min-h-12 items-center justify-center rounded-xl border-2 px-2 py-3 text-sm font-bold transition-all sm:px-4 sm:text-base ${
                      amount === preset && !customAmount
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                        : 'border-gray-100 bg-white text-gray-600 hover:border-indigo-200'
                    }`}
                  >
                    <IndianRupee className="w-4 h-4 mr-1" />
                    {preset}
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Amount</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <IndianRupee className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }}
                    placeholder="Enter amount"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Donor Details */}
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input required type="text" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input required type="email" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="john@example.com" />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full flex justify-center items-center py-4 px-8 border border-transparent rounded-xl shadow-md text-lg font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all transform hover:-translate-y-0.5"
              >
                <Heart className="w-5 h-5 mr-2 fill-current" />
                Donate ₹{customAmount || amount}
              </button>
              <p className="text-center text-xs text-gray-500 mt-4">
                Secure SSL Encrypted Transaction
              </p>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Donate;