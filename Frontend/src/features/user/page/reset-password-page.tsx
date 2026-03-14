import { Button, Form, Input, Typography, InputRef } from "antd";
import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/app.store";
import {
  requestPasswordReset,
  verifyPasswordResetCode,
  resetPassword,
} from "../../../shared/auth/api/auth-api";
import bgImage from "../../../../public/assets/images/login-bg.png";

const { Title } = Typography;

type ResetStep = "email" | "code" | "password";

// OTP Input Component
function OTPInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(InputRef | null)[]>([]);

  useEffect(() => {
    // Sync external value with internal state
    if (value && value.length === 6) {
      setOtp(value.split(""));
    }
  }, [value]);

  const handleChange = (index: number, value: string) => {
    // Only allow numeric input
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    onChange(newOtp.join(""));

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.input?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.input?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    
    // Only process if it's 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      onChange(pastedData);
      // Focus the last input
      inputRefs.current[5]?.input?.focus();
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      {otp.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => {
            if (el) {
              inputRefs.current[index] = el;
            }
          }}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          maxLength={1}
          className="w-14 h-14 text-center text-2xl font-semibold rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          style={{ fontSize: "24px" }}
          autoFocus={index === 0}
        />
      ))}
    </div>
  );
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const isLoading = useSelector(
    (state: RootState) => state.authReducer.loading
  );
  const [step, setStep] = useState<ResetStep>("email");
  const [email, setEmail] = useState<string>("");
  const [resetCode, setResetCode] = useState<string>("");
  const [otpValue, setOtpValue] = useState<string>("");

  // Step 1: Request password reset
  async function onRequestReset(values: { email: string }) {
    try {
      await requestPasswordReset(values.email);
      setEmail(values.email);
      setStep("code");
    } catch (error) {
      // Error is already handled in the API function
    }
  }

  // Step 2: Verify code
  async function onVerifyCode() {
    if (otpValue.length !== 6) {
      return;
    }
    try {
      await verifyPasswordResetCode(email, otpValue);
      setResetCode(otpValue);
      setStep("password");
    } catch (error) {
      // Error is already handled in the API function
      setOtpValue("");
    }
  }

  // Step 3: Set new password
  async function onSetPassword(values: { password: string; confirmPassword: string }) {
    try {
      await resetPassword(email, resetCode, values.password);
      // Redirect to login after successful reset
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      // Error is already handled in the API function
    }
  }

  return (
    <div className="flex bg-white h-screen">
      {/* Left Side: Blue overlay with image and app name, hidden on small screens */}
      <div
        className="hidden md:flex md:ml-10 md:my-8 rounded-4xl flex-1 items-center justify-center relative"
        style={{
          background: `linear-gradient(rgba(66, 133, 244, 0.55), rgba(66, 133, 244, 0.65)), url(${bgImage}) center/cover no-repeat`,
        }}
      >
        <div className="text-white text-6xl font-bold z-10">
          EDU Budget Ease
        </div>
      </div>

      {/* Right Side: Reset Password Form */}
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-8 py-10 rounded shadow-lg">
          {/* Step 1: Request Reset */}
          {step === "email" && (
            <>
              <Title level={2} className="mb-2 font-semibold">
                Reset Password <span role="img" aria-label="key">🔑</span>
              </Title>
              <p className="mb-6 text-gray-500">
                Enter your email address and we'll send you a verification code
              </p>
              <Form
                name="requestReset"
                onFinish={onRequestReset}
                autoComplete="off"
                layout="vertical"
              >
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: "Please input your email!" },
                    { type: "email", message: "Please enter a valid email!" },
                  ]}
                >
                  <Input placeholder="Email address" size="large" />
                </Form.Item>

                <Button
                  className="w-full rounded shadow"
                  htmlType="submit"
                  type="primary"
                  loading={isLoading}
                  size="large"
                >
                  Send Verification Code
                </Button>
              </Form>
            </>
          )}

          {/* Step 2: Verify Code */}
          {step === "code" && (
            <>
              <Title level={2} className="mb-2 font-semibold">
                Verify Code <span role="img" aria-label="mail">📧</span>
              </Title>
              <p className="mb-6 text-gray-500">
                We've sent a 6-digit code to <strong>{email}</strong>
              </p>
              <div className="mb-6">
                <OTPInput value={otpValue} onChange={setOtpValue} />
                {otpValue.length === 6 && (
                  <p className="text-sm text-green-600 mt-2 text-center">
                    ✓ Code entered
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 rounded shadow"
                  onClick={() => {
                    setStep("email");
                    setResetCode("");
                    setOtpValue("");
                  }}
                  size="large"
                >
                  Back
                </Button>
                <Button
                  className="flex-1 rounded shadow"
                  type="primary"
                  loading={isLoading}
                  size="large"
                  onClick={onVerifyCode}
                  disabled={otpValue.length !== 6}
                >
                  Verify Code
                </Button>
              </div>
            </>
          )}

          {/* Step 3: Set New Password */}
          {step === "password" && (
            <>
              <Title level={2} className="mb-2 font-semibold">
                Set New Password <span role="img" aria-label="lock">🔒</span>
              </Title>
              <p className="mb-6 text-gray-500">
                Enter your new password below
              </p>
              <Form
                name="setPassword"
                onFinish={onSetPassword}
                autoComplete="off"
                layout="vertical"
              >
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: "Please input your new password!" },
                    {
                      min: 8,
                      message: "Password must be at least 8 characters!",
                    },
                  ]}
                >
                  <Input.Password placeholder="New password" size="large" />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "Please confirm your password!" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("The two passwords do not match!")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Confirm new password" size="large" />
                </Form.Item>

                <div className="flex gap-3">
                  <Button
                    className="flex-1 rounded shadow"
                    onClick={() => {
                      setStep("code");
                    }}
                    size="large"
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 rounded shadow"
                    htmlType="submit"
                    type="primary"
                    loading={isLoading}
                    size="large"
                  >
                    Reset Password
                  </Button>
                </div>
              </Form>
            </>
          )}

          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <NavLink
              to="/login"
              className="text-sm text-gray-500 hover:text-primary"
            >
              ← Back to Login
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}
