import { useState } from "react";
import axios from "axios";

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    productName: "",
    amount: "",
    paymentGateway: "esewa",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const generateUniqueId = () => {
    return `txn_${Date.now()}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const productId = generateUniqueId();
      sessionStorage.setItem("current_transaction_id", productId);

      const response = await axios.post(
        "http://localhost:5000/api/v1/payment/initiate-payment",
        {
          ...formData,
          productId,
        }
      );

      if (response.data.url) {
        setSuccessMessage("Redirecting to payment gateway...");
        setTimeout(() => {
          window.location.href = response.data.url;
        }, 1000);
      } else {
        throw new Error("Payment URL not received");
      }

      // Optional: clear form after initiating
      setFormData({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        productName: "",
        amount: "",
        paymentGateway: "esewa",
      });
    } catch (error) {
      console.error("Error initiating payment:", error);
      setErrorMessage("Payment failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const headerBgColor =
    formData.paymentGateway === "esewa" ? "bg-green-600" : "bg-purple-600";
  const buttonBgColor =
    formData.paymentGateway === "esewa" ? "bg-green-600" : "bg-purple-600";
  const buttonHoverColor =
    formData.paymentGateway === "esewa"
      ? "hover:bg-green-700"
      : "hover:bg-purple-700";
  const focusRingColor =
    formData.paymentGateway === "esewa"
      ? "focus:ring-green-500"
      : "focus:ring-purple-500";

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className={`text-white px-6 py-4 ${headerBgColor}`}>
        <h2 className="text-xl font-semibold">Complete Your Payment</h2>
      </div>

      <div className="p-6">
        <p className="text-gray-600 mb-4">
          Please fill in all the details to proceed with payment
        </p>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="customerName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name:
              </label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="customerEmail"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email:
              </label>
              <input
                type="email"
                id="customerEmail"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="customerPhone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number:
              </label>
              <input
                type="tel"
                id="customerPhone"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                required
                placeholder="Enter your phone number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="productName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Product/Service Name:
              </label>
              <input
                type="text"
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                required
                placeholder="Enter product/service name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Amount (NPR):
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="1"
                placeholder="Enter amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="paymentGateway"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Payment Method:
              </label>
              <select
                id="paymentGateway"
                name="paymentGateway"
                value={formData.paymentGateway}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="esewa">eSewa</option>
                <option value="khalti">Khalti</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className={`w-full ${buttonBgColor} ${buttonHoverColor} text-white px-4 py-2 rounded-md ${focusRingColor} focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Proceed to Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function PaymentFormContainer() {
  return (
    <div className="p-8">
      <PaymentForm />
    </div>
  );
}
