import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { base64Decode } from "../utils/helper";
import { CheckCircle, AlertCircle, Home, ArrowRight } from "lucide-react";

const Success = () => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationError, setVerificationError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);

  const token = queryParams.get("data");
  const decoded = token ? base64Decode(token) : null;
  const product_id =
    decoded?.transaction_uuid || queryParams.get("purchase_order_id");

  const isKhalti = queryParams.get("pidx") !== null;
  const rawAmount =
    decoded?.total_amount ||
    queryParams.get("total_amount") ||
    queryParams.get("amount");
  const total_amount = isKhalti ? rawAmount / 100 : rawAmount;

  useEffect(() => {
    verifyPaymentAndUpdateStatus();
  }, [product_id]);

  const verifyPaymentAndUpdateStatus = async () => {
    if (!product_id) {
      setIsLoading(false);
      setVerificationError(true);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/payment/payment-status",
        {
          product_id, // Send the product_id to find the transaction
          pidx: queryParams.get("pidx"), // Send the pidx for Khalti verification
        }
      );

      if (response.status === 200) {
        setIsLoading(false);

        if (response.data.status === "COMPLETED") {
          setPaymentStatus("COMPLETED");
          localStorage.setItem("payment_status", "COMPLETED");
          localStorage.setItem("transaction_id", product_id);
          localStorage.setItem("total_amount", total_amount);
        } else {
          navigate("/payment-failure", {
            search: `?purchase_order_id=${product_id}`,
          });
          return;
        }
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      setIsLoading(false);
      setVerificationError(true);
      if (error.response && error.response.status === 400) {
        navigate("/payment-failure", {
          search: `?purchase_order_id=${product_id}`,
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-semibold text-gray-700">
          Verifying your payment...
        </h2>
        <p className="text-gray-500 mt-2">This will only take a moment</p>
      </div>
    );
  }

  // System error state - when can't verify the payment status
  if (verificationError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-amber-500" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
              Oops! Error occurred on confirming payment
            </h1>
            <h2 className="text-lg font-medium text-center text-gray-700 mb-4">
              We will resolve it soon.
            </h2>

            <div className="space-y-3 text-gray-600 mb-8">
              <p>
                Your transaction is being processed, but we couldn't verify its
                status.
              </p>
              <p>
                If the amount was deducted from your account, please contact our
                support team.
              </p>
              <p className="bg-gray-50 p-3 rounded-lg text-sm font-mono">
                Reference ID:{" "}
                {product_id || queryParams.get("pidx") || "Unknown"}
              </p>
            </div>

            <button
              onClick={() => navigate("/")}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state - only shown for confirmed successful payments
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-400 to-green-500 h-2"></div>
        <div className="p-6 sm:p-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Payment Successful!
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Thank you for your payment. Your transaction was successful.
          </p>

          <div className="bg-gray-50 rounded-lg p-5 mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Transaction Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-medium text-gray-800">
                  NPR {total_amount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-medium text-gray-800 text-sm font-mono">
                  {product_id}
                </span>
              </div>
              {paymentStatus === "COMPLETED" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium text-gray-800">
                      {isKhalti ? "Khalti" : "eSewa"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;
