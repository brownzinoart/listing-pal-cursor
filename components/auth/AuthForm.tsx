import React, { useState } from "react";
import { AuthFormMode } from "../../types";
import Input from "../shared/Input";
import Button from "../shared/Button";
import { Link } from "react-router-dom";

interface AuthFormProps {
  mode: AuthFormMode;
  onSubmit: (email: string, password: string) => Promise<void>;
  loading: boolean;
  serverError: string | null;
}

const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  onSubmit,
  loading,
  serverError,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (mode === "signup" && password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    if (!email || !password) {
      setFormError("Email and password are required.");
      return;
    }
    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }
    await onSubmit(email, password);
  };

  const title = mode === "login" ? "Welcome Back!" : "Create Your Account";
  const subtitle =
    mode === "login"
      ? "Login to access your dashboard."
      : "Sign up to get started.";
  const buttonText = mode === "login" ? "Login" : "Sign Up";
  const switchLinkText =
    mode === "login" ? "Don't have an account?" : "Already have an account?";
  const switchLinkPath = mode === "login" ? "/signup" : "/login";
  const switchLinkActionText = mode === "login" ? "Sign Up" : "Login";

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-brand-panel p-8 sm:p-10 rounded-xl shadow-2xl border border-brand-border">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-brand-text-primary">
            {title}
          </h2>
          <p className="mt-2 text-center text-sm text-brand-text-secondary">
            {subtitle}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {serverError && (
            <div className="text-sm text-brand-danger bg-brand-danger/10 p-3 rounded-md text-center border border-brand-danger/20">
              {serverError}
            </div>
          )}
          {formError && (
            <div className="text-sm text-brand-danger bg-brand-danger/10 p-3 rounded-md text-center border border-brand-danger/20">
              {formError}
            </div>
          )}

          <Input
            id="email"
            label="Email address"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            variant="glass"
          />
          <Input
            id="password"
            label="Password"
            type="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            variant="glass"
          />
          {mode === "signup" && (
            <Input
              id="confirm-password"
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              variant="glass"
            />
          )}
          <div>
            <Button
              type="submit"
              variant="primary"
              fullWidth={true}
              isLoading={loading}
              size="lg"
            >
              {buttonText}
            </Button>
          </div>
        </form>
        <div className="text-sm text-center">
          <span className="text-brand-text-secondary">{switchLinkText} </span>
          <Link
            to={switchLinkPath}
            className="font-medium text-brand-primary hover:text-brand-accent transition-colors"
          >
            {switchLinkActionText}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
