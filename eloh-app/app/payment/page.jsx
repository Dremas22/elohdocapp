import PayOptions from "@/components/patients/payments/payOptions";

export const metadata = {
  title: "Payments | ElohApp",
  description:
    "Securely manage and complete payments on ElohApp for medical services, ambulance requests, and other healthcare-related transactions.",
};

const PaymentPage = () => {
  return (
    <div className="flex items-center justify-center w-full h-screen font-bold">
      <PayOptions />
    </div>
  );
};

export default PaymentPage;
