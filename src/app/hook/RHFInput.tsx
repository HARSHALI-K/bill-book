"use client"

import * as React from "react"
import { useController } from "react-hook-form"

interface RHFInputProps {
  control: any
  name: string
  inputType?: "text" | "password" | "otp" | "refferal" | "newsletter"
  disabled?: boolean
  placeholder?: string
  rows?: number
  multiline?: boolean
  label: string
  mandatory?: boolean
  addbtn?: boolean
  label_footer?: string
  button_label?: string

  // handlers
  handlebtnclick?: () => void
  handleResend?: () => void
  handleReferralCode?: () => void
  handleForgotPass?: () => void

  // options
  resendValue?: number
  forgotpassword?: boolean
}

const RHFInput: React.FC<RHFInputProps> = ({
  control,
  name,
  label,
  placeholder,
  inputType = "text",
  mandatory = true,
  disabled,
  label_footer,
  addbtn = false,
  button_label,
  handlebtnclick,
  handleResend,
  handleReferralCode,
  handleForgotPass,
  forgotpassword = false,
}) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const [expiryTime, setExpiryTime] = React.useState(
    new Date().getTime() + 2 * 60 * 1000
  )

  const calculateTimeLeft = () => {
    const difference = expiryTime - new Date().getTime()
    if (difference <= 0) return { minutes: 0, seconds: 0 }
    return {
      minutes: Math.floor(difference / 1000 / 60),
      seconds: Math.floor((difference / 1000) % 60),
    }
  }

  const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft())

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)
    return () => clearInterval(timer)
  }, [expiryTime])

  const {
    field: { value, onChange },
    fieldState: { invalid, error },
  } = useController({
    name,
    control,
    defaultValue: "",
  })

  const handleSendButton = () => {
    if (handleResend) {
      handleResend()
      setExpiryTime(new Date().getTime() + 2 * 60 * 1000)
    }
  }

  return (
    <div className="w-full space-y-1">
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {mandatory && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}

      {/* Input */}
      <div className="relative">
        <input
          id={name}
          value={value}
          type={inputType === "password" && showPassword ? "text" : inputType}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder || label}
          className={`h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-0 transition focus:border-primary pr-10 ${invalid ? "border-red-500" : ""}`}
        />

        {/* Password toggle */}
        {inputType === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-600"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}

        {/* OTP timer / resend */}
        {inputType === "otp" && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {timeLeft.minutes === 0 && timeLeft.seconds === 0 ? (
              <button
                type="button"
                onClick={handleSendButton}
                className="text-blue-600 text-sm"
              >
                Resend OTP
              </button>
            ) : (
              <span className="text-sm text-gray-500">
                Resend in {timeLeft.minutes}:
                {timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds}
              </span>
            )}
          </div>
        )}

        {/* Referral apply button */}
        {inputType === "refferal" && (
          <button
            type="button"
            onClick={handleReferralCode}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 text-sm"
          >
            Apply
          </button>
        )}

        {/* Newsletter input */}
        {inputType === "newsletter" && (
          <>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</span>
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-blue-600 text-white px-3 py-1 text-xs"
            >
              Submit
            </button>
          </>
        )}
      </div>

      {/* Error */}
      {error && <p className="text-xs text-red-500">{error.message}</p>}

      {/* Footer text */}
      {label_footer && (
        <p className="text-xs text-muted-foreground">{label_footer}</p>
      )}

      {/* Add extra button */}
      {addbtn && (
        <button
          type="button"
          onClick={handlebtnclick}
          className="flex items-center space-x-1 text-blue-600 text-sm"
        >
          <span>{button_label}</span>
        </button>
      )}

      {/* Forgot password link */}
      {forgotpassword && handleForgotPass && (
        <button
          type="button"
          onClick={handleForgotPass}
          className="text-xs text-blue-600 hover:underline"
        >
          Forgot Password?
        </button>
      )}
    </div>
  )
}

export default RHFInput
