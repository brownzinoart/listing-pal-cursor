import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import Card from "./Card";
import { APP_NAME } from "../../constants";
import {
  SparklesIcon,
  HomeModernIcon,
  ShieldCheckIcon,
  CpuChipIcon,
} from "@heroicons/react/24/solid";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <HomeModernIcon className="w-24 h-24 text-brand-primary mb-6" />
      <h1 className="text-5xl font-extrabold mb-4 text-brand-text-primary">
        Welcome to <span className="text-brand-primary">{APP_NAME}</span>
      </h1>
      <p className="text-xl text-brand-text-secondary max-w-2xl mb-8">
        The ultimate tool for real estate agents. Streamline your marketing,
        generate compelling content, and close more deals. This is Phase 1: Core
        Listing Management and Authentication.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="primary" size="lg" onClick={() => navigate("/login")}>
          Login
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </Button>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
        <Card variant="default" padding="lg" className="text-center">
          <SparklesIcon className="w-12 h-12 text-brand-primary mb-4 mx-auto" />
          <h3 className="text-xl font-semibold mb-2 text-brand-text-primary">
            Manage Listings
          </h3>
          <p className="text-brand-text-secondary text-sm">
            Easily create, edit, and organize all your property listings in one
            place.
          </p>
        </Card>

        <Card variant="default" padding="lg" className="text-center">
          <ShieldCheckIcon className="w-12 h-12 text-brand-primary mb-4 mx-auto" />
          <h3 className="text-xl font-semibold mb-2 text-brand-text-primary">
            Secure Authentication
          </h3>
          <p className="text-brand-text-secondary text-sm">
            Your data is protected with secure account creation and login.
          </p>
        </Card>

        <Card variant="default" padding="lg" className="text-center">
          <CpuChipIcon className="w-12 h-12 text-brand-primary mb-4 mx-auto" />
          <h3 className="text-xl font-semibold mb-2 text-brand-text-primary">
            Foundation for AI
          </h3>
          <p className="text-brand-text-secondary text-sm">
            This phase builds the essential platform for exciting AI-powered
            marketing tools coming soon.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default LandingPage;
