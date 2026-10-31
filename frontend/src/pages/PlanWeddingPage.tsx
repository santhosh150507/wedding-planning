import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import confetti from 'canvas-confetti';
import { Crown, Calendar, MapPin, Users, IndianRupee, Sparkles, CheckCircle2, ArrowRight, Printer, RefreshCw } from 'lucide-react';
import { enquiryApi } from '../api/endpoints';

const planWeddingSchema = z.object({
  bride_name: z.string().min(2, "Bride's name must be at least 2 characters"),
  groom_name: z.string().min(2, "Groom's name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(8, "Phone number must be at least 8 digits"),
  preferred_date: z.string().min(1, "Preferred wedding date is required"),
  alternative_date: z.string().optional(),
  destination: z.string().min(1, "Please select a destination"),
  venue_preference: z.string().optional(),
  guest_count: z.number().min(10, "Minimum 10 guests").max(5000, "Maximum 5,000 guests"),
  function_count: z.number().min(1, "At least 1 function").max(15, "Maximum 15 functions"),
  functions_requested: z.array(z.string()).min(1, "Please select at least one function"),
  theme_preference: z.string().optional(),
  budget_max: z.number().min(500000, "Minimum estimated budget is ₹5,00,000 (5 Lakhs)"),
  package_type: z.enum(['full_service', 'partial_day_of']),
  catering_preferences: z.string().optional(),
  decor_preferences: z.string().optional(),
  additional_notes: z.string().optional(),
});

type PlanWeddingFormData = z.infer<typeof planWeddingSchema>;

export const PlanWeddingPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    enquiry_number: string;
    message: string;
    submitted_at: string;
    data: PlanWeddingFormData;
  } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const availableFunctions = [
    'Mehendi & Henna Soirée',
    'Haldi & Phoolon Ki Holi',
    'Sangeet & Soundscape Gala',
    'Vedic Pheras (Wedding Ceremony)',
    'The Royal Reception',
    'Cocktail & Sufi Night',
    'Welcome Brunch & High Tea',
  ];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<PlanWeddingFormData>({
    resolver: zodResolver(planWeddingSchema),
    defaultValues: {
      preferred_date: new Date(Date.now() + 120 * 86400000).toISOString().split('T')[0],
      destination: 'Jaipur',
      guest_count: 400,
      function_count: 4,
      functions_requested: [
        'Mehendi & Henna Soirée',
        'Haldi & Phoolon Ki Holi',
        'Sangeet & Soundscape Gala',
        'Vedic Pheras (Wedding Ceremony)',
        'The Royal Reception',
      ],
      budget_max: 25000000, // 2.5 Crore default
      package_type: 'full_service',
    },
  });

  const selectedFunctions = watch('functions_requested') || [];
  const currentBudget = watch('budget_max') || 25000000;
  const currentGuestCount = watch('guest_count') || 400;

  const toggleFunction = (fn: string) => {
    if (selectedFunctions.includes(fn)) {
      setValue(
        'functions_requested',
        selectedFunctions.filter((f) => f !== fn)
      );
    } else {
      setValue('functions_requested', [...selectedFunctions, fn]);
    }
  };

  const formatINR = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Crore`;
    }
    return `₹${(val / 100000).toFixed(2)} Lakh`;
  };

  const onSubmit = async (data: PlanWeddingFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      // Format payload for backend ISO datetime
      const payload = {
        ...data,
        preferred_date: new Date(data.preferred_date).toISOString(),
        alternative_date: data.alternative_date ? new Date(data.alternative_date).toISOString() : null,
      };

      const result = await enquiryApi.submitPublic(payload);

      // Trigger royal celebration confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C5A880', '#D4AF37', '#1A1F2C', '#FFFFFF'],
      });

      setSubmissionSuccess({
        enquiry_number: result.enquiry_number,
        message: result.message,
        submitted_at: result.submitted_at,
        data,
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setServerError(
        err.response?.data?.detail?.[0]?.msg ||
          err.response?.data?.detail ||
          'Failed to submit your enquiry. Please check the form fields and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {submissionSuccess ? (
          /* Confirmation Screen */
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#C5A880]/50 shadow-xl space-y-8 animate-fade-in">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#1A1F2C] border-2 border-[#C5A880] text-[#C5A880] flex items-center justify-center mx-auto shadow-md">
                <Crown className="w-8 h-8 text-[#C5A880]" />
              </div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-bold block">
                Nuptial Registration Confirmed
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl text-[#1A1F2C]">
                Your Royal Journey Begins
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] max-w-lg mx-auto font-light">
                {submissionSuccess.message}
              </p>
            </div>

            {/* Generated Unique Enquiry ID Card */}
            <div className="bg-gradient-to-r from-[#FAF8F5] via-[#F4EFEA] to-[#FAF8F5] p-6 rounded-2xl border border-[#C5A880] text-center space-y-2 shadow-xs">
              <span className="text-[11px] uppercase tracking-widest text-[#64748B] font-semibold">
                Official Reference ID
              </span>
              <div className="font-serif text-3xl sm:text-4xl text-[#1A1F2C] tracking-wider font-bold">
                {submissionSuccess.enquiry_number}
              </div>
              <p className="text-[11px] text-[#94A3B8]">
                Please preserve this identifier for all communications with our concierge team.
              </p>
            </div>

            {/* Submitted Summary Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EAE3D9] space-y-1">
                <span className="text-[#94A3B8] font-semibold uppercase tracking-wider text-[10px]">Couple:</span>
                <div className="font-semibold text-sm text-[#1A1F2C]">
                  {submissionSuccess.data.bride_name} &amp; {submissionSuccess.data.groom_name}
                </div>
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EAE3D9] space-y-1">
                <span className="text-[#94A3B8] font-semibold uppercase tracking-wider text-[10px]">Destination:</span>
                <div className="font-semibold text-sm text-[#1A1F2C]">
                  {submissionSuccess.data.destination}{' '}
                  {submissionSuccess.data.venue_preference ? `(${submissionSuccess.data.venue_preference})` : ''}
                </div>
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EAE3D9] space-y-1">
                <span className="text-[#94A3B8] font-semibold uppercase tracking-wider text-[10px]">Target Date:</span>
                <div className="font-semibold text-sm text-[#1A1F2C]">
                  {new Date(submissionSuccess.data.preferred_date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EAE3D9] space-y-1">
                <span className="text-[#94A3B8] font-semibold uppercase tracking-wider text-[10px]">Guest Scale:</span>
                <div className="font-semibold text-sm text-[#1A1F2C]">
                  {submissionSuccess.data.guest_count} Guests &bull; {submissionSuccess.data.function_count} Functions
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="p-6 bg-[#1A1F2C] text-[#FAF8F5] rounded-2xl space-y-3 border border-[#C5A880]/30">
              <div className="text-xs uppercase tracking-wider text-[#C5A880] font-semibold">What Happens Next:</div>
              <ul className="text-xs text-[#CBD5E1] space-y-2 list-disc list-inside font-light">
                <li>Our senior wedding director reviews palace availability and preliminary logistics.</li>
                <li>You will receive an introductory WhatsApp &amp; Email within 24 hours.</li>
                <li>We schedule a private video consultation to present customized palace layout options and preliminary budget frameworks.</li>
              </ul>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-[#EAE3D9] text-[#1A1F2C] text-xs uppercase tracking-wider font-semibold hover:bg-[#F4EFEA] transition-colors"
              >
                <Printer className="w-4 h-4 text-[#C5A880]" />
                <span>Print / Save Confirmation</span>
              </button>
              <button
                onClick={() => {
                  setSubmissionSuccess(null);
                  reset();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#1A1F2C] text-[#FAF8F5] text-xs uppercase tracking-wider font-semibold hover:bg-[#2C3444] transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-[#C5A880]" />
                <span>Submit Another Enquiry</span>
              </button>
            </div>
          </div>
        ) : (
          /* The Enquiry Form */
          <div className="bg-white rounded-3xl p-6 sm:p-12 border border-[#EAE3D9] shadow-md space-y-10">
            {/* Form Title & Introduction */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF8F5] border border-[#C5A880]/50 text-[#C5A880] text-[11px] uppercase tracking-widest font-bold">
                <Crown className="w-3.5 h-3.5" />
                Confidential Client Intake
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl text-[#1A1F2C]">
                Plan Your Royal Wedding
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] max-w-xl mx-auto font-light leading-relaxed">
                Please share your preliminary vision. Our executive planners will assemble a curated portfolio of venues, sample menus, and financial frameworks tailored to your expectations.
              </p>
            </div>

            {serverError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
              {/* Section 1: Couple Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#EAE3D9] pb-2">
                  <span className="text-xs font-serif text-base text-[#1A1F2C] font-semibold">
                    1. Couple Information
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#1A1F2C]">Bride's Full Name *</label>
                    <input
                      type="text"
                      {...register('bride_name')}
                      placeholder="e.g. Ananya Singhania"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE3D9] text-xs focus:outline-none focus:border-[#C5A880] bg-[#FAF8F5]"
                    />
                    {errors.bride_name && (
                      <span className="text-[11px] text-red-600">{errors.bride_name.message}</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#1A1F2C]">Groom's Full Name *</label>
                    <input
                      type="text"
                      {...register('groom_name')}
                      placeholder="e.g. Rohan Mehra"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE3D9] text-xs focus:outline-none focus:border-[#C5A880] bg-[#FAF8F5]"
                    />
                    {errors.groom_name && (
                      <span className="text-[11px] text-red-600">{errors.groom_name.message}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#1A1F2C]">Email Address *</label>
                    <input
                      type="email"
                      {...register('email')}
                      placeholder="name@family.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE3D9] text-xs focus:outline-none focus:border-[#C5A880] bg-[#FAF8F5]"
                    />
                    {errors.email && (
                      <span className="text-[11px] text-red-600">{errors.email.message}</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#1A1F2C]">Phone / WhatsApp Number *</label>
                    <input
                      type="tel"
                      {...register('phone')}
                      placeholder="+91 98111 22334"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE3D9] text-xs focus:outline-none focus:border-[#C5A880] bg-[#FAF8F5]"
                    />
                    {errors.phone && (
                      <span className="text-[11px] text-red-600">{errors.phone.message}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Destination & Dates */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#EAE3D9] pb-2">
                  <span className="text-xs font-serif text-base text-[#1A1F2C] font-semibold">
                    2. Destination &amp; Dates
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#1A1F2C]">Target Wedding Date *</label>
                    <input
                      type="date"
                      {...register('preferred_date')}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE3D9] text-xs focus:outline-none focus:border-[#C5A880] bg-[#FAF8F5]"
                    />
                    {errors.preferred_date && (
                      <span className="text-[11px] text-red-600">{errors.preferred_date.message}</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#1A1F2C]">Alternative Date (Optional)</label>
                    <input
                      type="date"
                      {...register('alternative_date')}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE3D9] text-xs focus:outline-none focus:border-[#C5A880] bg-[#FAF8F5]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#1A1F2C]">Preferred Destination *</label>
                    <select
                      {...register('destination')}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE3D9] text-xs focus:outline-none focus:border-[#C5A880] bg-[#FAF8F5]"
                    >
                      <option value="Jaipur">Jaipur (Pink City Palaces &amp; Forts)</option>
                      <option value="Udaipur">Udaipur (City of Lakes &amp; Island Palaces)</option>
                      <option value="Jodhpur">Jodhpur (Imperial Blue City &amp; Forts)</option>
                      <option value="Undecided">Undecided / Open to Recommendation</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#1A1F2C]">Venue Preference (If already shortlisted)</label>
                  <input
                    type="text"
                    {...register('venue_preference')}
                    placeholder="e.g. Taj Lake Palace, Rambagh Palace, Samode, Fairmont, etc."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EAE3D9] text-xs focus:outline-none focus:border-[#C5A880] bg-[#FAF8F5]"
                  />
                </div>
              </div>

              {/* Section 3: Guest Scale & Functions */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#EAE3D9] pb-2">
                  <span className="text-xs font-serif text-base text-[#1A1F2C] font-semibold">
                    3. Scale &amp; Wedding Functions
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Guest Count Slider */}
                  <div className="space-y-2 p-4 bg-[#FAF8F5] rounded-xl border border-[#EAE3D9]">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-[#1A1F2C]">Expected Guest Count:</span>
                      <span className="font-bold text-[#C5A880] text-sm">{currentGuestCount} Guests</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="1500"
                      step="25"
                      {...register('guest_count', { valueAsNumber: true })}
                      className="w-full accent-[#C5A880] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[#94A3B8]">
                      <span>50 (Intimate)</span>
                      <span>400 (Luxury Standard)</span>
                      <span>1500+ (Grand Gala)</span>
                    </div>
                  </div>

                  {/* Function Count */}
                  <div className="space-y-2 p-4 bg-[#FAF8F5] rounded-xl border border-[#EAE3D9]">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-[#1A1F2C]">Number of Functions / Events:</span>
                      <span className="font-bold text-[#C5A880] text-sm">{watch('function_count')} Events</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="8"
                      step="1"
                      {...register('function_count', { valueAsNumber: true })}
                      className="w-full accent-[#C5A880] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[#94A3B8]">
                      <span>2 (Weekend)</span>
                      <span>4-5 (Standard Royal)</span>
                      <span>8 (Extravaganza)</span>
                    </div>
                  </div>
                </div>

                {/* Functions checkboxes */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#1A1F2C]">Functions Required (Select all that apply) *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableFunctions.map((fn) => {
                      const isChecked = selectedFunctions.includes(fn);
                      return (
                        <button
                          type="button"
                          key={fn}
                          onClick={() => toggleFunction(fn)}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs text-left transition-all ${
                            isChecked
                              ? 'bg-[#FAF8F5] border-[#C5A880] text-[#1A1F2C] font-medium shadow-xs'
                              : 'bg-white border-[#EAE3D9] text-[#64748B] hover:bg-[#FAF8F5]'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                              isChecked
                                ? 'bg-[#1A1F2C] border-[#1A1F2C] text-[#C5A880]'
                                : 'border-[#CBD5E1]'
                            }`}
                          >
                            {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <span>{fn}</span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.functions_requested && (
                    <span className="text-[11px] text-red-600 block">{errors.functions_requested.message}</span>
                  )}
                </div>
              </div>

              {/* Section 4: Budget & Package */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#EAE3D9] pb-2">
                  <span className="text-xs font-serif text-base text-[#1A1F2C] font-semibold">
                    4. Budget &amp; Management Package
                  </span>
                </div>

                {/* Package Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label
                    className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                      watch('package_type') === 'full_service'
                        ? 'bg-[#FAF8F5] border-[#C5A880] shadow-xs'
                        : 'bg-white border-[#EAE3D9] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-lg text-[#1A1F2C] font-semibold">Full-Service Architecture</span>
                        <input
                          type="radio"
                          value="full_service"
                          {...register('package_type')}
                          className="accent-[#C5A880]"
                        />
                      </div>
                      <p className="text-[11px] text-[#64748B] font-light leading-relaxed">
                        Comprehensive turnkey engagement from inception to completion (12-18 months planning, venue contracting, vendor RFQs, guest hospitality, and full financial reconciliation).
                      </p>
                    </div>
                  </label>

                  <label
                    className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                      watch('package_type') === 'partial_day_of'
                        ? 'bg-[#FAF8F5] border-[#C5A880] shadow-xs'
                        : 'bg-white border-[#EAE3D9] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-lg text-[#1A1F2C] font-semibold">Partial / Day-of Management</span>
                        <input
                          type="radio"
                          value="partial_day_of"
                          {...register('package_type')}
                          className="accent-[#C5A880]"
                        />
                      </div>
                      <p className="text-[11px] text-[#64748B] font-light leading-relaxed">
                        Tailored for couples with booked venues seeking professional coordination in the final 60-90 days, minute-by-minute day-of schedules, and live vendor arrival tracking.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Estimated Budget Slider */}
                <div className="space-y-2 p-5 bg-[#FAF8F5] rounded-xl border border-[#EAE3D9]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-[#1A1F2C]">Estimated Maximum Budget (INR):</span>
                    <span className="font-bold text-[#C5A880] text-base">{formatINR(currentBudget)}</span>
                  </div>
                  <input
                    type="range"
                    min="1000000"
                    max="100000000"
                    step="1000000"
                    {...register('budget_max', { valueAsNumber: true })}
                    className="w-full accent-[#C5A880] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#94A3B8]">
                    <span>₹10 Lakhs</span>
                    <span>₹2.5 Crores (Recommended)</span>
                    <span>₹10 Crores+</span>
                  </div>
                  {errors.budget_max && (
                    <span className="text-[11px] text-red-600 block">{errors.budget_max.message}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#1A1F2C]">Preferred Wedding Theme / Scenography Vision</label>
                  <input
                    type="text"
                    {...register('theme_preference')}
                    placeholder="e.g. Mughal Royal Opulence, Candlelit Lake Starlight, Sufi Mystique, Art Deco Rajputana"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EAE3D9] text-xs focus:outline-none focus:border-[#C5A880] bg-[#FAF8F5]"
                  />
                </div>
              </div>

              {/* Section 5: Food & Decor Preferences */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#EAE3D9] pb-2">
                  <span className="text-xs font-serif text-base text-[#1A1F2C] font-semibold">
                    5. Culinary, Decor &amp; Additional Requests
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#1A1F2C]">Food &amp; Catering Preferences</label>
                    <textarea
                      rows={3}
                      {...register('catering_preferences')}
                      placeholder="e.g. Pure Vegetarian Marwari Feast, Jain live counters, Pan-Asian stations, Michelin curated dessert bar..."
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE3D9] text-xs focus:outline-none focus:border-[#C5A880] bg-[#FAF8F5]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#1A1F2C]">Decoration &amp; Floral Preferences</label>
                    <textarea
                      rows={3}
                      {...register('decor_preferences')}
                      placeholder="e.g. Thousands of fresh marigolds, antique brass lanterns, mirror work Mandap on water, crystal chandeliers..."
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE3D9] text-xs focus:outline-none focus:border-[#C5A880] bg-[#FAF8F5]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#1A1F2C]">Additional Requirements or Specific Family Notes</label>
                  <textarea
                    rows={3}
                    {...register('additional_notes')}
                    placeholder="e.g. Helicopter Baraat entry, vintage car transfers, private security protocols for VIP guests..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EAE3D9] text-xs focus:outline-none focus:border-[#C5A880] bg-[#FAF8F5]"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-[#EAE3D9] space-y-3">
                <button
                  id="submit-royal-wedding-enquiry-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-full bg-[#1A1F2C] text-[#FAF8F5] text-xs uppercase tracking-[0.2em] font-bold border border-[#C5A880] hover:bg-[#2C3444] transition-all shadow-md flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting To Private Concierge...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Royal Wedding Enquiry</span>
                      <ArrowRight className="w-4 h-4 text-[#C5A880]" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-[#94A3B8]">
                  Strict Discretion Guaranteed &bull; Unique Reference ID Generated Immediately &bull; Soft-Delete Protected
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
