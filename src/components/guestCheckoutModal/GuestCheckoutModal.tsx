"use client";
import React from "react";
import { Modal, Button } from "antd";
import { useRouter } from "next/navigation";
import { FaUser, FaUserPlus } from "react-icons/fa6";
import { IoCartOutline } from "react-icons/io5";
import "./styles.scss";

interface GuestCheckoutModalProps {
  open: boolean;
  onClose: () => void;
  onContinueAsGuest: () => void;
  action?: "cart" | "buy"; // What action triggered the modal
}

const GuestCheckoutModal: React.FC<GuestCheckoutModalProps> = ({
  open,
  onClose,
  onContinueAsGuest,
  action = "cart",
}) => {
  const router = useRouter();

  const handleLogin = () => {
    onClose();
    // Store the current URL to redirect back after login
    const currentPath = window.location.pathname;
    router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
  };

  const handleSignup = () => {
    onClose();
    const currentPath = window.location.pathname;
    router.push(`/signup?redirect=${encodeURIComponent(currentPath)}`);
  };

  const handleGuestContinue = () => {
    onClose();
    onContinueAsGuest();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      className="guest-checkout-modal"
      width={450}
    >
      <div className="guest-modal-content">
        <div className="guest-modal-icon">
          <IoCartOutline size={50} color="#1890ff" />
        </div>
        <h2 className="guest-modal-title">
          {action === "buy" ? "Ready to Buy?" : "Add to Cart"}
        </h2>
        <p className="guest-modal-description">
          Sign in for a personalized shopping experience, or continue as a guest
          to complete your purchase quickly.
        </p>

        <div className="guest-modal-options">
          {/* Sign In Option */}
          <div className="guest-modal-option">
            <Button
              type="primary"
              size="large"
              icon={<FaUser />}
              onClick={handleLogin}
              className="guest-modal-btn login-btn"
              block
            >
              Sign In
            </Button>
            <span className="option-hint">Access your saved addresses & orders</span>
          </div>

          <div className="guest-modal-divider">
            <span>or</span>
          </div>

          {/* Guest Option */}
          <div className="guest-modal-option">
            <Button
              size="large"
              icon={<IoCartOutline />}
              onClick={handleGuestContinue}
              className="guest-modal-btn guest-btn"
              block
            >
              Continue as Guest
            </Button>
            <span className="option-hint">No account needed</span>
          </div>

          <div className="guest-modal-divider">
            <span>or</span>
          </div>

          {/* Sign Up Option */}
          <div className="guest-modal-option">
            <Button
              size="large"
              icon={<FaUserPlus />}
              onClick={handleSignup}
              className="guest-modal-btn signup-btn"
              block
            >
              Create Account
            </Button>
            <span className="option-hint">Save your info for faster checkout</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default GuestCheckoutModal;
