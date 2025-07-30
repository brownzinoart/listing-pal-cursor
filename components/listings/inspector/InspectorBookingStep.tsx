import React, { useState } from "react";
import { Listing, Inspector, ServiceAppointment } from "../../../types";
import Button from "../../shared/Button";
import {
  ArrowLeftIcon,
  CheckIcon,
  CalendarIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftIcon,
  CurrencyDollarIcon,
  StarIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

interface InspectorBookingStepProps {
  listing: Listing;
  inspector: Inspector;
  appointment: ServiceAppointment | null;
  onBook: (appointmentData: Partial<ServiceAppointment>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const InspectorBookingStep: React.FC<InspectorBookingStepProps> = ({
  listing,
  inspector,
  appointment,
  onBook,
  onNext,
  onPrevious,
}) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [contactMethod, setContactMethod] = useState<
    "phone" | "email" | "text"
  >("email");
  const [clientNotes, setClientNotes] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([
    "general",
  ]);

  // Generate available dates (next 14 days, excluding weekends for this demo)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Skip weekends for this demo
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split("T")[0]);
      }
    }
    return dates;
  };

  const availableTimes = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
  ];

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((s) => s !== serviceId)
        : [...prev, serviceId],
    );
  };

  const calculateTotalCost = () => {
    let total = inspector.standardInspectionFee;

    selectedServices.forEach((serviceId) => {
      if (serviceId !== "general") {
        const additionalService = inspector.additionalServiceFees.find((s) =>
          s.serviceName.toLowerCase().includes(serviceId),
        );
        if (additionalService) {
          total += additionalService.fee;
        }
      }
    });

    return total;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select a date and time for your inspection.");
      return;
    }

    onBook({
      scheduledDate: selectedDate,
      scheduledTime: selectedTime,
      contactMethod,
      clientNotes,
      estimatedCost: calculateTotalCost(),
    });
  };

  if (appointment) {
    return (
      <div className="space-y-8">
        {/* Success Message */}
        <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckIcon className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Inspection Booked Successfully!
            </h3>
            <p className="text-emerald-400 font-semibold mb-6">
              Confirmation #: {appointment.id.split("-")[1].toUpperCase()}
            </p>
          </div>

          {/* Appointment Details */}
          <div className="bg-white/5 rounded-xl p-6 mb-6">
            <h4 className="text-white font-semibold mb-4">
              Appointment Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-slate-400 text-sm">Date</p>
                  <p className="text-white font-semibold">
                    {new Date(appointment.scheduledDate).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <ClockIcon className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-slate-400 text-sm">Time</p>
                  <p className="text-white font-semibold">
                    {appointment.scheduledTime} (
                    {appointment.estimatedDuration || 180} minutes)
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <CurrencyDollarIcon className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-slate-400 text-sm">Total Cost</p>
                  <p className="text-white font-semibold">
                    {formatPrice(
                      appointment.estimatedCost ||
                        inspector.standardInspectionFee,
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-slate-400 text-sm">Contact Method</p>
                  <p className="text-white font-semibold capitalize">
                    {appointment.contactMethod}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Inspector Info */}
          <div className="bg-white/5 rounded-xl p-6">
            <h4 className="text-white font-semibold mb-4">Your Inspector</h4>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-400 text-lg font-bold">
                  {inspector.businessName[0]}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">
                  {inspector.businessName}
                </p>
                <p className="text-slate-400">{inspector.contactName}</p>
                <div className="flex items-center space-x-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`h-3 w-3 ${star <= inspector.overallRating ? "text-yellow-400 fill-current" : "text-slate-400"}`}
                    />
                  ))}
                  <span className="text-slate-400 text-sm ml-2">
                    ({inspector.totalReviews} reviews)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-sm">Contact</p>
                <p className="text-white font-semibold">{inspector.phone}</p>
                <p className="text-slate-400 text-sm">{inspector.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
          <h4 className="text-blue-400 font-semibold mb-3">
            What Happens Next?
          </h4>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-xs font-bold">1</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">
                  Confirmation Call/Email
                </p>
                <p className="text-slate-400 text-xs">
                  You'll receive confirmation within 2 hours via your preferred
                  contact method
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-xs font-bold">2</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">
                  Pre-Inspection Checklist
                </p>
                <p className="text-slate-400 text-xs">
                  Receive a checklist to prepare your property for inspection
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-xs font-bold">3</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">Inspection Day</p>
                <p className="text-slate-400 text-xs">
                  Inspector arrives on time and conducts thorough inspection
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-xs font-bold">4</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">
                  Detailed Report
                </p>
                <p className="text-slate-400 text-xs">
                  Receive comprehensive report within{" "}
                  {inspector.reportTurnaroundHours} hours
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button
            variant="glass"
            onClick={onPrevious}
            leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
          >
            Previous
          </Button>
          <Button
            variant="gradient"
            onClick={() => (window.location.href = `/listings/${listing.id}`)}
            rightIcon={<CheckIcon className="h-5 w-5" />}
          >
            Complete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Inspector Summary */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">
          Book Your Inspection
        </h3>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <span className="text-blue-400 text-lg font-bold">
              {inspector.businessName[0]}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold">{inspector.businessName}</p>
            <p className="text-slate-400">{inspector.contactName}</p>
            <div className="flex items-center space-x-4 mt-1">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className={`h-3 w-3 ${star <= inspector.overallRating ? "text-yellow-400 fill-current" : "text-slate-400"}`}
                  />
                ))}
                <span className="text-slate-400 text-sm ml-2">
                  {inspector.overallRating}
                </span>
              </div>
              {inspector.verified && (
                <div className="flex items-center space-x-1 text-emerald-400">
                  <ShieldCheckIcon className="h-3 w-3" />
                  <span className="text-xs font-semibold">VERIFIED</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm">Property</p>
            <p className="text-white font-semibold">
              {listing.address.split(",")[0]}
            </p>
            <p className="text-slate-400 text-sm">
              {listing.city}, {listing.state}
            </p>
          </div>
        </div>
      </div>

      {/* Service Selection */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h4 className="text-white font-semibold mb-4">Select Services</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <div>
              <p className="text-white font-semibold">
                General Home Inspection
              </p>
              <p className="text-slate-400 text-sm">
                Comprehensive inspection of all major systems
              </p>
            </div>
            <div className="text-right">
              <p className="text-emerald-400 font-bold">
                {formatPrice(inspector.standardInspectionFee)}
              </p>
              <p className="text-slate-400 text-xs">Included</p>
            </div>
          </div>

          {inspector.additionalServiceFees.map((service, index) => {
            const serviceId = service.serviceName
              .toLowerCase()
              .replace(/\s+/g, "-");
            const isSelected = selectedServices.includes(serviceId);

            return (
              <div
                key={index}
                onClick={() => handleServiceToggle(serviceId)}
                className={`
                  flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all duration-200
                  ${
                    isSelected
                      ? "bg-blue-500/10 border-blue-500/20"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }
                `}
              >
                <div>
                  <p className="text-white font-semibold">
                    {service.serviceName}
                  </p>
                  <p className="text-slate-400 text-sm">
                    Additional specialized inspection
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-bold">
                    +{formatPrice(service.fee)}
                  </p>
                  <p className="text-slate-400 text-xs">
                    {isSelected ? "Selected" : "Optional"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Date & Time Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h4 className="text-white font-semibold mb-4">Select Date</h4>
          <div className="grid grid-cols-2 gap-2">
            {getAvailableDates()
              .slice(0, 8)
              .map((date) => {
                const dateObj = new Date(date);
                const isSelected = selectedDate === date;

                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`
                    p-3 rounded-lg border text-center transition-all duration-200
                    ${
                      isSelected
                        ? "bg-blue-500/20 border-blue-500/50 ring-2 ring-blue-400/30"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }
                  `}
                  >
                    <p className="text-white font-semibold text-sm">
                      {dateObj.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {dateObj.toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </p>
                  </button>
                );
              })}
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h4 className="text-white font-semibold mb-4">Select Time</h4>
          <div className="grid grid-cols-2 gap-2">
            {availableTimes.map((time) => {
              const isSelected = selectedTime === time;

              return (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`
                    p-3 rounded-lg border text-center transition-all duration-200
                    ${
                      isSelected
                        ? "bg-blue-500/20 border-blue-500/50 ring-2 ring-blue-400/30"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }
                  `}
                >
                  <p className="text-white font-semibold">
                    {new Date(`2024-01-01T${time}`).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      },
                    )}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contact Preferences */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h4 className="text-white font-semibold mb-4">Contact Preferences</h4>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {(["phone", "email", "text"] as const).map((method) => {
            const isSelected = contactMethod === method;
            const icons = {
              phone: PhoneIcon,
              email: EnvelopeIcon,
              text: ChatBubbleLeftIcon,
            };
            const Icon = icons[method];

            return (
              <button
                key={method}
                onClick={() => setContactMethod(method)}
                className={`
                  flex items-center space-x-3 p-4 rounded-lg border transition-all duration-200
                  ${
                    isSelected
                      ? "bg-blue-500/20 border-blue-500/50"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }
                `}
              >
                <Icon className="h-5 w-5 text-blue-400" />
                <span className="text-white font-medium capitalize">
                  {method}
                </span>
              </button>
            );
          })}
        </div>

        <div>
          <label className="block text-slate-300 text-sm mb-2">
            Special Instructions (Optional)
          </label>
          <textarea
            value={clientNotes}
            onChange={(e) => setClientNotes(e.target.value)}
            placeholder="Any special access instructions, areas of concern, or other notes for the inspector..."
            className="w-full h-24 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>
      </div>

      {/* Cost Summary */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h4 className="text-white font-semibold mb-4">Cost Summary</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-white/10">
            <span className="text-slate-300">General Home Inspection</span>
            <span className="text-white font-semibold">
              {formatPrice(inspector.standardInspectionFee)}
            </span>
          </div>

          {selectedServices
            .filter((s) => s !== "general")
            .map((serviceId) => {
              const service = inspector.additionalServiceFees.find((s) =>
                s.serviceName
                  .toLowerCase()
                  .includes(serviceId.replace("-", " ")),
              );
              if (!service) return null;

              return (
                <div
                  key={serviceId}
                  className="flex justify-between items-center py-2 border-b border-white/10"
                >
                  <span className="text-slate-300">{service.serviceName}</span>
                  <span className="text-white font-semibold">
                    +{formatPrice(service.fee)}
                  </span>
                </div>
              );
            })}

          <div className="flex justify-between items-center py-3 text-lg">
            <span className="text-white font-bold">Total Cost</span>
            <span className="text-emerald-400 font-bold">
              {formatPrice(calculateTotalCost())}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          variant="glass"
          onClick={onPrevious}
          leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
        >
          Previous
        </Button>
        <Button
          variant="gradient"
          onClick={handleBooking}
          rightIcon={<CheckIcon className="h-5 w-5" />}
          disabled={!selectedDate || !selectedTime}
        >
          Book Inspection ({formatPrice(calculateTotalCost())})
        </Button>
      </div>
    </div>
  );
};

export default InspectorBookingStep;
