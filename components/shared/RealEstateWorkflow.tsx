import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  FileText,
  Home,
  Users,
  DollarSign,
  Briefcase,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  Bell,
  ChevronLeft,
  List,
  Grid3X3,
  ArrowLeft,
  PlayCircle,
  CheckCircle2,
  Target,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "./Button";
import ModernDashboardLayout from "./ModernDashboardLayout";

const RealEstateWorkflow = () => {
  const navigate = useNavigate();
  const { listingId } = useParams();

  // Comprehensive 180-step workflow - 30 steps per phase
  const workflowPhases = {
    "Pre-Listing": {
      icon: <Briefcase className="w-5 h-5" />,
      color: "blue",
      description: "Client consultation through listing agreement",
      days: "1-15",
      steps: [
        {
          id: 1,
          task: "Initial client consultation scheduled",
          priority: "critical",
          timeframe: "Day 1",
          type: "meeting",
        },
        {
          id: 2,
          task: "Gather property documents from seller",
          priority: "critical",
          timeframe: "Day 1-2",
          type: "document",
        },
        {
          id: 3,
          task: "Property deed and title review",
          priority: "high",
          timeframe: "Day 2",
          type: "document",
        },
        {
          id: 4,
          task: "HOA documents requested (if applicable)",
          priority: "medium",
          timeframe: "Day 2",
          type: "document",
        },
        {
          id: 5,
          task: "Property tax records obtained",
          priority: "high",
          timeframe: "Day 2",
          type: "document",
        },
        {
          id: 6,
          task: "Recent utility bills collected",
          priority: "medium",
          timeframe: "Day 2",
          type: "document",
        },
        {
          id: 7,
          task: "Comparative Market Analysis (CMA) started",
          priority: "critical",
          timeframe: "Day 2-3",
          type: "analysis",
        },
        {
          id: 8,
          task: "Recent sales data compiled",
          priority: "high",
          timeframe: "Day 3",
          type: "analysis",
        },
        {
          id: 9,
          task: "Active listing competition analyzed",
          priority: "high",
          timeframe: "Day 3",
          type: "analysis",
        },
        {
          id: 10,
          task: "Market trends research completed",
          priority: "medium",
          timeframe: "Day 3",
          type: "analysis",
        },
        {
          id: 11,
          task: "Property condition assessment",
          priority: "high",
          timeframe: "Day 3-4",
          type: "inspection",
        },
        {
          id: 12,
          task: "Exterior condition evaluation",
          priority: "medium",
          timeframe: "Day 4",
          type: "inspection",
        },
        {
          id: 13,
          task: "Interior condition assessment",
          priority: "medium",
          timeframe: "Day 4",
          type: "inspection",
        },
        {
          id: 14,
          task: "Major systems inspection notes",
          priority: "medium",
          timeframe: "Day 4",
          type: "inspection",
        },
        {
          id: 15,
          task: "Repair recommendations list created",
          priority: "medium",
          timeframe: "Day 4",
          type: "document",
        },
        {
          id: 16,
          task: "Pricing strategy discussion with seller",
          priority: "critical",
          timeframe: "Day 5",
          type: "meeting",
        },
        {
          id: 17,
          task: "Price positioning strategy finalized",
          priority: "high",
          timeframe: "Day 5",
          type: "strategy",
        },
        {
          id: 18,
          task: "Marketing timeline presented",
          priority: "high",
          timeframe: "Day 5",
          type: "presentation",
        },
        {
          id: 19,
          task: "Commission structure agreed upon",
          priority: "high",
          timeframe: "Day 5",
          type: "negotiation",
        },
        {
          id: 20,
          task: "Listing agreement terms negotiated",
          priority: "critical",
          timeframe: "Day 6",
          type: "negotiation",
        },
        {
          id: 21,
          task: "Exclusive listing agreement signed",
          priority: "critical",
          timeframe: "Day 6",
          type: "document",
        },
        {
          id: 22,
          task: "Seller disclosure forms completed",
          priority: "critical",
          timeframe: "Day 7",
          type: "document",
        },
        {
          id: 23,
          task: "Lead-based paint disclosure (if applicable)",
          priority: "high",
          timeframe: "Day 7",
          type: "document",
        },
        {
          id: 24,
          task: "Property condition disclosure review",
          priority: "high",
          timeframe: "Day 7",
          type: "review",
        },
        {
          id: 25,
          task: "Schedule professional photography",
          priority: "critical",
          timeframe: "Day 8",
          type: "scheduling",
        },
        {
          id: 26,
          task: "Photographer selection and booking",
          priority: "high",
          timeframe: "Day 8",
          type: "task",
        },
        {
          id: 27,
          task: "Photography shot list prepared",
          priority: "medium",
          timeframe: "Day 8",
          type: "preparation",
        },
        {
          id: 28,
          task: "Home staging consultation ordered",
          priority: "high",
          timeframe: "Day 9",
          type: "consultation",
        },
        {
          id: 29,
          task: "Staging recommendations received",
          priority: "medium",
          timeframe: "Day 10",
          type: "review",
        },
        {
          id: 30,
          task: "Property history research completed",
          priority: "medium",
          timeframe: "Day 10",
          type: "research",
        },
      ],
    },
    "Listing Preparation": {
      icon: <Home className="w-5 h-5" />,
      color: "purple",
      description: "Photography through MLS activation",
      days: "16-45",
      steps: [
        {
          id: 31,
          task: "Property preparation for photography",
          priority: "high",
          timeframe: "Day 11",
          type: "preparation",
        },
        {
          id: 32,
          task: "Staging implementation (if applicable)",
          priority: "medium",
          timeframe: "Day 11",
          type: "task",
        },
        {
          id: 33,
          task: "Professional photos taken",
          priority: "critical",
          timeframe: "Day 12",
          type: "task",
        },
        {
          id: 34,
          task: "Aerial/drone photography (if applicable)",
          priority: "medium",
          timeframe: "Day 12",
          type: "task",
        },
        {
          id: 35,
          task: "Virtual tour planning",
          priority: "high",
          timeframe: "Day 13",
          type: "planning",
        },
        {
          id: 36,
          task: "Virtual tour/video created",
          priority: "high",
          timeframe: "Day 13-14",
          type: "task",
        },
        {
          id: 37,
          task: "Photo editing and selection",
          priority: "high",
          timeframe: "Day 14",
          type: "editing",
        },
        {
          id: 38,
          task: "Virtual tour editing completed",
          priority: "medium",
          timeframe: "Day 15",
          type: "editing",
        },
        {
          id: 39,
          task: "Property description writing started",
          priority: "critical",
          timeframe: "Day 15",
          type: "writing",
        },
        {
          id: 40,
          task: "Key features highlighting",
          priority: "high",
          timeframe: "Day 15",
          type: "writing",
        },
        {
          id: 41,
          task: "Property description finalized",
          priority: "critical",
          timeframe: "Day 16",
          type: "document",
        },
        {
          id: 42,
          task: "MLS listing form preparation",
          priority: "critical",
          timeframe: "Day 16",
          type: "preparation",
        },
        {
          id: 43,
          task: "Property details input verification",
          priority: "high",
          timeframe: "Day 16",
          type: "verification",
        },
        {
          id: 44,
          task: "Photos uploaded to MLS system",
          priority: "high",
          timeframe: "Day 17",
          type: "upload",
        },
        {
          id: 45,
          task: "Virtual tour linked to MLS",
          priority: "medium",
          timeframe: "Day 17",
          type: "setup",
        },
        {
          id: 46,
          task: "Marketing materials design started",
          priority: "high",
          timeframe: "Day 18",
          type: "design",
        },
        {
          id: 47,
          task: "Flyer design and content creation",
          priority: "medium",
          timeframe: "Day 18",
          type: "design",
        },
        {
          id: 48,
          task: "Brochure layout and content",
          priority: "medium",
          timeframe: "Day 19",
          type: "design",
        },
        {
          id: 49,
          task: "Digital marketing graphics created",
          priority: "high",
          timeframe: "Day 19",
          type: "design",
        },
        {
          id: 50,
          task: "Social media posts scheduled",
          priority: "high",
          timeframe: "Day 20",
          type: "marketing",
        },
        {
          id: 51,
          task: "Facebook marketing post prepared",
          priority: "medium",
          timeframe: "Day 20",
          type: "marketing",
        },
        {
          id: 52,
          task: "Instagram content created",
          priority: "medium",
          timeframe: "Day 20",
          type: "marketing",
        },
        {
          id: 53,
          task: "Email campaign template designed",
          priority: "high",
          timeframe: "Day 21",
          type: "marketing",
        },
        {
          id: 54,
          task: "Client database segmentation",
          priority: "medium",
          timeframe: "Day 21",
          type: "preparation",
        },
        {
          id: 55,
          task: "Open house dates selected",
          priority: "high",
          timeframe: "Day 22",
          type: "scheduling",
        },
        {
          id: 56,
          task: "Open house scheduling coordination",
          priority: "medium",
          timeframe: "Day 22",
          type: "coordination",
        },
        {
          id: 57,
          task: "Signage design and ordering",
          priority: "high",
          timeframe: "Day 23",
          type: "task",
        },
        {
          id: 58,
          task: "Yard sign installation scheduled",
          priority: "medium",
          timeframe: "Day 23",
          type: "scheduling",
        },
        {
          id: 59,
          task: "Lockbox procurement and programming",
          priority: "high",
          timeframe: "Day 24",
          type: "task",
        },
        {
          id: 60,
          task: "Property access system setup",
          priority: "high",
          timeframe: "Day 25",
          type: "setup",
        },
      ],
    },
    "Active Marketing": {
      icon: <Users className="w-5 h-5" />,
      color: "green",
      description: "MLS activation through showing feedback",
      days: "46-90",
      steps: [
        {
          id: 61,
          task: "MLS listing activated",
          priority: "critical",
          timeframe: "Day 26",
          type: "activation",
        },
        {
          id: 62,
          task: "MLS syndication verification",
          priority: "high",
          timeframe: "Day 26",
          type: "verification",
        },
        {
          id: 63,
          task: "Property posted on company website",
          priority: "high",
          timeframe: "Day 26",
          type: "posting",
        },
        {
          id: 64,
          task: "Zillow listing verification",
          priority: "high",
          timeframe: "Day 27",
          type: "verification",
        },
        {
          id: 65,
          task: "Trulia listing verification",
          priority: "high",
          timeframe: "Day 27",
          type: "verification",
        },
        {
          id: 66,
          task: "Realtor.com syndication confirmed",
          priority: "high",
          timeframe: "Day 27",
          type: "verification",
        },
        {
          id: 67,
          task: "First showing requests received",
          priority: "medium",
          timeframe: "Day 28",
          type: "communication",
        },
        {
          id: 68,
          task: "Showing coordination system setup",
          priority: "high",
          timeframe: "Day 28",
          type: "setup",
        },
        {
          id: 69,
          task: "First open house hosted",
          priority: "critical",
          timeframe: "Weekend 1",
          type: "event",
        },
        {
          id: 70,
          task: "Open house visitor log maintained",
          priority: "medium",
          timeframe: "Weekend 1",
          type: "tracking",
        },
        {
          id: 71,
          task: "Open house feedback collection",
          priority: "high",
          timeframe: "After open house",
          type: "follow-up",
        },
        {
          id: 72,
          task: "Visitor follow-up communications",
          priority: "medium",
          timeframe: "Day 30",
          type: "follow-up",
        },
        {
          id: 73,
          task: "Neighbor notification letters sent",
          priority: "medium",
          timeframe: "Day 30",
          type: "marketing",
        },
        {
          id: 74,
          task: "Local community board postings",
          priority: "low",
          timeframe: "Day 31",
          type: "marketing",
        },
        {
          id: 75,
          task: "Sphere of influence notifications",
          priority: "high",
          timeframe: "Day 31",
          type: "communication",
        },
        {
          id: 76,
          task: "Past client email blast",
          priority: "medium",
          timeframe: "Day 32",
          type: "marketing",
        },
        {
          id: 77,
          task: "Professional network notifications",
          priority: "medium",
          timeframe: "Day 32",
          type: "networking",
        },
        {
          id: 78,
          task: "Broker tour scheduled",
          priority: "high",
          timeframe: "Week 3",
          type: "scheduling",
        },
        {
          id: 79,
          task: "Agent preview event organized",
          priority: "medium",
          timeframe: "Week 3",
          type: "event",
        },
        {
          id: 80,
          task: "Weekly seller update call",
          priority: "high",
          timeframe: "Weekly",
          type: "communication",
        },
        {
          id: 81,
          task: "Market activity report prepared",
          priority: "medium",
          timeframe: "Weekly",
          type: "reporting",
        },
        {
          id: 82,
          task: "Showing feedback tracking system",
          priority: "high",
          timeframe: "Ongoing",
          type: "tracking",
        },
        {
          id: 83,
          task: "Individual showing debriefs",
          priority: "medium",
          timeframe: "After each showing",
          type: "follow-up",
        },
        {
          id: 84,
          task: "Price adjustment analysis (if needed)",
          priority: "high",
          timeframe: "Week 4",
          type: "analysis",
        },
        {
          id: 85,
          task: "Marketing strategy evaluation",
          priority: "medium",
          timeframe: "Week 4",
          type: "evaluation",
        },
        {
          id: 86,
          task: "Additional marketing initiatives",
          priority: "medium",
          timeframe: "Week 5",
          type: "marketing",
        },
        {
          id: 87,
          task: "Second open house (if needed)",
          priority: "medium",
          timeframe: "Week 5",
          type: "event",
        },
        {
          id: 88,
          task: "Online presence optimization",
          priority: "medium",
          timeframe: "Week 6",
          type: "optimization",
        },
        {
          id: 89,
          task: "Lead generation follow-up",
          priority: "high",
          timeframe: "Ongoing",
          type: "follow-up",
        },
        {
          id: 90,
          task: "Buyer agent outreach program",
          priority: "medium",
          timeframe: "Ongoing",
          type: "outreach",
        },
      ],
    },
    "Offer Management": {
      icon: <DollarSign className="w-5 h-5" />,
      color: "yellow",
      description: "First offer through contract execution",
      days: "91-120",
      steps: [
        {
          id: 91,
          task: "First offer received notification",
          priority: "critical",
          timeframe: "When received",
          type: "communication",
        },
        {
          id: 92,
          task: "Offer documentation review",
          priority: "critical",
          timeframe: "Within 1 hour",
          type: "review",
        },
        {
          id: 93,
          task: "Buyer agent verification",
          priority: "high",
          timeframe: "Within 2 hours",
          type: "verification",
        },
        {
          id: 94,
          task: "Buyer pre-approval verification",
          priority: "critical",
          timeframe: "Within 2 hours",
          type: "verification",
        },
        {
          id: 95,
          task: "Proof of funds verification (cash offers)",
          priority: "critical",
          timeframe: "Within 2 hours",
          type: "verification",
        },
        {
          id: 96,
          task: "Offer terms analysis",
          priority: "critical",
          timeframe: "Within 4 hours",
          type: "analysis",
        },
        {
          id: 97,
          task: "Seller consultation scheduling",
          priority: "critical",
          timeframe: "Within 4 hours",
          type: "scheduling",
        },
        {
          id: 98,
          task: "Offer presentation to seller",
          priority: "critical",
          timeframe: "Within 6 hours",
          type: "presentation",
        },
        {
          id: 99,
          task: "Seller decision consultation",
          priority: "critical",
          timeframe: "Within 8 hours",
          type: "consultation",
        },
        {
          id: 100,
          task: "Counter offer strategy development",
          priority: "high",
          timeframe: "If needed",
          type: "strategy",
        },
        {
          id: 101,
          task: "Counter offer preparation",
          priority: "high",
          timeframe: "If needed",
          type: "preparation",
        },
        {
          id: 102,
          task: "Terms negotiation with buyer agent",
          priority: "critical",
          timeframe: "24-48 hours",
          type: "negotiation",
        },
        {
          id: 103,
          task: "Price negotiation coordination",
          priority: "critical",
          timeframe: "24-48 hours",
          type: "negotiation",
        },
        {
          id: 104,
          task: "Closing date negotiation",
          priority: "high",
          timeframe: "24-48 hours",
          type: "negotiation",
        },
        {
          id: 105,
          task: "Contingency terms negotiation",
          priority: "high",
          timeframe: "24-48 hours",
          type: "negotiation",
        },
        {
          id: 106,
          task: "Multiple offer strategy (if applicable)",
          priority: "critical",
          timeframe: "If applicable",
          type: "strategy",
        },
        {
          id: 107,
          task: "Highest and best offer coordination",
          priority: "critical",
          timeframe: "If applicable",
          type: "coordination",
        },
        {
          id: 108,
          task: "Final offer acceptance decision",
          priority: "critical",
          timeframe: "Decision day",
          type: "decision",
        },
        {
          id: 109,
          task: "Offer acceptance documentation",
          priority: "critical",
          timeframe: "Same day",
          type: "documentation",
        },
        {
          id: 110,
          task: "Executed contract distribution",
          priority: "critical",
          timeframe: "Same day",
          type: "distribution",
        },
        {
          id: 111,
          task: "Earnest money deposit verification",
          priority: "critical",
          timeframe: "24-48 hours",
          type: "verification",
        },
        {
          id: 112,
          task: "Earnest money deposit to escrow",
          priority: "critical",
          timeframe: "48-72 hours",
          type: "task",
        },
        {
          id: 113,
          task: "Contract copies to all parties",
          priority: "critical",
          timeframe: "Same day",
          type: "distribution",
        },
        {
          id: 114,
          task: "Lender notification of accepted offer",
          priority: "high",
          timeframe: "Next business day",
          type: "notification",
        },
        {
          id: 115,
          task: "Title company notification",
          priority: "critical",
          timeframe: "Next business day",
          type: "notification",
        },
        {
          id: 116,
          task: 'MLS status update to "Under Contract"',
          priority: "critical",
          timeframe: "Same day",
          type: "update",
        },
        {
          id: 117,
          task: "Website listing status update",
          priority: "high",
          timeframe: "Same day",
          type: "update",
        },
        {
          id: 118,
          task: "Pending offer notifications to other agents",
          priority: "medium",
          timeframe: "24 hours",
          type: "notification",
        },
        {
          id: 119,
          task: "Backup offer solicitation (if desired)",
          priority: "medium",
          timeframe: "24-48 hours",
          type: "marketing",
        },
        {
          id: 120,
          task: "Contract milestone calendar creation",
          priority: "high",
          timeframe: "Within 24 hours",
          type: "planning",
        },
      ],
    },
    "Under Contract": {
      icon: <FileText className="w-5 h-5" />,
      color: "orange",
      description: "Contract execution through closing preparation",
      days: "121-150",
      steps: [
        {
          id: 121,
          task: "Contract sent to title company",
          priority: "critical",
          timeframe: "Day 1",
          type: "transmission",
        },
        {
          id: 122,
          task: "Title order initiated",
          priority: "critical",
          timeframe: "Day 1-2",
          type: "order",
        },
        {
          id: 123,
          task: "Preliminary title report request",
          priority: "high",
          timeframe: "Day 2",
          type: "request",
        },
        {
          id: 124,
          task: "Home inspection scheduling",
          priority: "critical",
          timeframe: "Within 3 days",
          type: "scheduling",
        },
        {
          id: 125,
          task: "Inspector selection and booking",
          priority: "high",
          timeframe: "Within 3 days",
          type: "booking",
        },
        {
          id: 126,
          task: "Inspection contingency timeline tracking",
          priority: "critical",
          timeframe: "Ongoing",
          type: "tracking",
        },
        {
          id: 127,
          task: "Home inspection attendance",
          priority: "critical",
          timeframe: "As scheduled",
          type: "attendance",
        },
        {
          id: 128,
          task: "Inspection report receipt",
          priority: "high",
          timeframe: "Within 24 hours",
          type: "receipt",
        },
        {
          id: 129,
          task: "Inspection report review with seller",
          priority: "critical",
          timeframe: "Within 24 hours",
          type: "review",
        },
        {
          id: 130,
          task: "Repair negotiations coordination",
          priority: "high",
          timeframe: "2-3 days after inspection",
          type: "negotiation",
        },
        {
          id: 131,
          task: "Repair estimates procurement",
          priority: "medium",
          timeframe: "If needed",
          type: "procurement",
        },
        {
          id: 132,
          task: "Repair addendum preparation",
          priority: "high",
          timeframe: "If needed",
          type: "preparation",
        },
        {
          id: 133,
          task: "Inspection contingency removal",
          priority: "critical",
          timeframe: "Per contract terms",
          type: "removal",
        },
        {
          id: 134,
          task: "Appraisal scheduling coordination",
          priority: "critical",
          timeframe: "Within 10 days",
          type: "scheduling",
        },
        {
          id: 135,
          task: "Appraisal appointment facilitation",
          priority: "high",
          timeframe: "As scheduled",
          type: "facilitation",
        },
        {
          id: 136,
          task: "Property preparation for appraisal",
          priority: "medium",
          timeframe: "Before appraisal",
          type: "preparation",
        },
        {
          id: 137,
          task: "Comparable sales data for appraiser",
          priority: "high",
          timeframe: "Before appraisal",
          type: "preparation",
        },
        {
          id: 138,
          task: "Appraisal report receipt",
          priority: "critical",
          timeframe: "Within 48 hours",
          type: "receipt",
        },
        {
          id: 139,
          task: "Appraisal review and analysis",
          priority: "critical",
          timeframe: "Within 24 hours",
          type: "analysis",
        },
        {
          id: 140,
          task: "Low appraisal negotiation (if needed)",
          priority: "critical",
          timeframe: "If applicable",
          type: "negotiation",
        },
        {
          id: 141,
          task: "Appraisal contingency resolution",
          priority: "critical",
          timeframe: "Per contract terms",
          type: "resolution",
        },
        {
          id: 142,
          task: "Buyer financing progress monitoring",
          priority: "critical",
          timeframe: "Weekly",
          type: "monitoring",
        },
        {
          id: 143,
          task: "Lender communication and updates",
          priority: "high",
          timeframe: "Bi-weekly",
          type: "communication",
        },
        {
          id: 144,
          task: "Loan approval status verification",
          priority: "critical",
          timeframe: "Weekly",
          type: "verification",
        },
        {
          id: 145,
          task: "Financing contingency timeline tracking",
          priority: "critical",
          timeframe: "Ongoing",
          type: "tracking",
        },
        {
          id: 146,
          task: "Title examination and clearance",
          priority: "high",
          timeframe: "Mid-contract period",
          type: "examination",
        },
        {
          id: 147,
          task: "Title issues resolution",
          priority: "high",
          timeframe: "If needed",
          type: "resolution",
        },
        {
          id: 148,
          task: "HOA documentation procurement",
          priority: "medium",
          timeframe: "If applicable",
          type: "procurement",
        },
        {
          id: 149,
          task: "Property condition maintenance",
          priority: "medium",
          timeframe: "Ongoing",
          type: "maintenance",
        },
        {
          id: 150,
          task: "Seller disclosure updates (if needed)",
          priority: "medium",
          timeframe: "If needed",
          type: "update",
        },
      ],
    },
    "Closing Preparation": {
      icon: <Calendar className="w-5 h-5" />,
      color: "red",
      description: "Final walkthrough through closing completion",
      days: "151-180",
      steps: [
        {
          id: 151,
          task: "Closing date confirmation",
          priority: "critical",
          timeframe: "1 week before",
          type: "confirmation",
        },
        {
          id: 152,
          task: "Final walkthrough scheduling",
          priority: "critical",
          timeframe: "24-48 hours before",
          type: "scheduling",
        },
        {
          id: 153,
          task: "Walkthrough checklist preparation",
          priority: "high",
          timeframe: "Before walkthrough",
          type: "preparation",
        },
        {
          id: 154,
          task: "Utility transfer coordination",
          priority: "high",
          timeframe: "3-5 days before",
          type: "coordination",
        },
        {
          id: 155,
          task: "Home warranty information",
          priority: "medium",
          timeframe: "3 days before",
          type: "information",
        },
        {
          id: 156,
          task: "Property insurance verification",
          priority: "high",
          timeframe: "3 days before",
          type: "verification",
        },
        {
          id: 157,
          task: "Final repair completion verification",
          priority: "high",
          timeframe: "2-3 days before",
          type: "verification",
        },
        {
          id: 158,
          task: "Property condition final check",
          priority: "medium",
          timeframe: "2 days before",
          type: "inspection",
        },
        {
          id: 159,
          task: "Closing statement (HUD-1/CD) review",
          priority: "critical",
          timeframe: "3 days before",
          type: "review",
        },
        {
          id: 160,
          task: "Seller closing cost verification",
          priority: "critical",
          timeframe: "3 days before",
          type: "verification",
        },
        {
          id: 161,
          task: "Certified funds calculation",
          priority: "critical",
          timeframe: "2 days before",
          type: "calculation",
        },
        {
          id: 162,
          task: "Wire transfer instructions (if applicable)",
          priority: "high",
          timeframe: "2 days before",
          type: "instructions",
        },
        {
          id: 163,
          task: "Closing document preparation",
          priority: "critical",
          timeframe: "2 days before",
          type: "preparation",
        },
        {
          id: 164,
          task: "Power of attorney arrangements (if needed)",
          priority: "medium",
          timeframe: "2 days before",
          type: "arrangement",
        },
        {
          id: 165,
          task: "Closing location and time confirmation",
          priority: "critical",
          timeframe: "24 hours before",
          type: "confirmation",
        },
        {
          id: 166,
          task: "All parties closing time coordination",
          priority: "high",
          timeframe: "24 hours before",
          type: "coordination",
        },
        {
          id: 167,
          task: "Final walkthrough execution",
          priority: "critical",
          timeframe: "Day before/day of",
          type: "execution",
        },
        {
          id: 168,
          task: "Walkthrough issues resolution",
          priority: "critical",
          timeframe: "If issues found",
          type: "resolution",
        },
        {
          id: 169,
          task: "Keys and access items collection",
          priority: "critical",
          timeframe: "At closing",
          type: "collection",
        },
        {
          id: 170,
          task: "Remote controls and access codes",
          priority: "high",
          timeframe: "At closing",
          type: "collection",
        },
        {
          id: 171,
          task: "Garage door openers",
          priority: "medium",
          timeframe: "At closing",
          type: "collection",
        },
        {
          id: 172,
          task: "Home manuals and warranties",
          priority: "medium",
          timeframe: "At closing",
          type: "collection",
        },
        {
          id: 173,
          task: "Closing document signing coordination",
          priority: "critical",
          timeframe: "Closing day",
          type: "coordination",
        },
        {
          id: 174,
          task: "Fund disbursement verification",
          priority: "critical",
          timeframe: "Closing day",
          type: "verification",
        },
        {
          id: 175,
          task: "Deed recording coordination",
          priority: "critical",
          timeframe: "Closing day",
          type: "coordination",
        },
        {
          id: 176,
          task: 'MLS status update to "Sold"',
          priority: "high",
          timeframe: "After closing",
          type: "update",
        },
        {
          id: 177,
          task: "Remove all signage and lockboxes",
          priority: "high",
          timeframe: "After closing",
          type: "removal",
        },
        {
          id: 178,
          task: "Post-closing client follow-up",
          priority: "medium",
          timeframe: "1 week after",
          type: "follow-up",
        },
        {
          id: 179,
          task: "Transaction file organization",
          priority: "medium",
          timeframe: "1 week after",
          type: "organization",
        },
        {
          id: 180,
          task: "Commission processing and records",
          priority: "high",
          timeframe: "1 week after",
          type: "processing",
        },
      ],
    },
  };

  const [tasks, setTasks] = useState({});
  const [currentPhase, setCurrentPhase] = useState("Pre-Listing");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState("phase"); // 'phase' or 'calendar'
  const [startDate, setStartDate] = useState(new Date());
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState("month"); // 'month', 'week', 'day'

  // Calculate task due dates based on start date
  const calculateTaskDates = (startDate) => {
    const taskDates = {};
    let currentDate = new Date(startDate);

    Object.entries(workflowPhases).forEach(([phase, data]) => {
      data.steps.forEach((step, index) => {
        // Parse timeframe to get day offset
        let dayOffset = 0;
        const timeframe = step.timeframe.toLowerCase();

        if (timeframe.includes("day")) {
          const match = timeframe.match(/day\s*(\d+)/);
          if (match) {
            dayOffset = parseInt(match[1]) - 1; // Day 1 = 0 offset
          }
        } else if (timeframe.includes("week")) {
          const match = timeframe.match(/week\s*(\d+)/);
          if (match) {
            dayOffset = (parseInt(match[1]) - 1) * 7; // Week 1 = 0, Week 2 = 7 days, etc.
          }
        } else if (timeframe.includes("weekend")) {
          const match = timeframe.match(/weekend\s*(\d+)/);
          if (match) {
            dayOffset = (parseInt(match[1]) - 1) * 7 + 5; // Weekend 1 = Day 6 (Saturday)
          }
        } else if (timeframe.includes("within")) {
          const match = timeframe.match(/within\s*(\d+)/);
          if (match) {
            dayOffset = parseInt(match[1]);
          }
        } else if (timeframe.includes("hours")) {
          // Same day tasks
          dayOffset = Math.floor(step.id / 10); // Rough approximation
        } else {
          // Default based on step sequence
          dayOffset = Math.floor((step.id - 1) / 6); // Roughly 6 tasks per day
        }

        const taskDate = new Date(startDate);
        taskDate.setDate(taskDate.getDate() + dayOffset);
        taskDates[step.id] = taskDate.toISOString();
      });
    });

    return taskDates;
  };

  // Initialize tasks with completion status and persistence
  useEffect(() => {
    const storageKey = listingId ? `workflow-${listingId}` : "workflow-general";
    const savedTasks = localStorage.getItem(storageKey);
    const savedStartDate = localStorage.getItem(`${storageKey}-startDate`);

    if (savedStartDate) {
      setStartDate(new Date(savedStartDate));
    }

    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      // Recalculate dates if start date changed
      const taskDates = calculateTaskDates(
        savedStartDate ? new Date(savedStartDate) : startDate,
      );
      Object.keys(parsedTasks).forEach((taskId) => {
        if (taskDates[taskId]) {
          parsedTasks[taskId].dueDate = taskDates[taskId];
        }
      });
      setTasks(parsedTasks);
    } else {
      const initialTasks = {};
      const taskDates = calculateTaskDates(startDate);

      Object.entries(workflowPhases).forEach(([phase, data]) => {
        data.steps.forEach((step) => {
          initialTasks[step.id] = {
            ...step,
            phase,
            completed: false,
            completedDate: null,
            dueDate: taskDates[step.id],
            notes: "",
            reminder: null,
          };
        });
      });
      setTasks(initialTasks);
    }
  }, [listingId, startDate]);

  // Save tasks and start date to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(tasks).length > 0) {
      const storageKey = listingId
        ? `workflow-${listingId}`
        : "workflow-general";
      localStorage.setItem(storageKey, JSON.stringify(tasks));
      localStorage.setItem(`${storageKey}-startDate`, startDate.toISOString());
    }
  }, [tasks, listingId, startDate]);

  // Update start date and recalculate all task dates (debounced)
  const handleStartDateChange = useCallback((newStartDate) => {
    setStartDate(newStartDate);

    // Debounce the expensive task date recalculation
    const timeoutId = setTimeout(() => {
      const taskDates = calculateTaskDates(newStartDate);

      setTasks((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((taskId) => {
          if (taskDates[taskId]) {
            updated[taskId] = {
              ...updated[taskId],
              dueDate: taskDates[taskId],
            };
          }
        });
        return updated;
      });
    }, 150);

    return () => clearTimeout(timeoutId);
  }, []);

  // Determine current phase automatically based on completed tasks
  useEffect(() => {
    const completedTasksByPhase = {};
    Object.entries(workflowPhases).forEach(([phase, data]) => {
      const completed = data.steps.filter(
        (step) => tasks[step.id]?.completed,
      ).length;
      const total = data.steps.length;
      completedTasksByPhase[phase] = {
        completed,
        total,
        percentage: Math.round((completed / total) * 100),
      };
    });

    // Find the first phase that's not 100% complete
    const currentPhaseAuto =
      Object.entries(completedTasksByPhase).find(
        ([phase, stats]) => stats.percentage < 100,
      )?.[0] || "Closing Preparation";

    if (currentPhase === "Pre-Listing" && Object.keys(tasks).length > 0) {
      setCurrentPhase(currentPhaseAuto);
    }
  }, [tasks]);

  const toggleTask = useCallback((taskId) => {
    setTasks((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        completed: !prev[taskId].completed,
        completedDate: !prev[taskId].completed
          ? new Date().toISOString()
          : null,
      },
    }));
  }, []);

  const getPhaseProgress = (phase) => {
    const phaseTasks = workflowPhases[phase].steps;
    const completed = phaseTasks.filter(
      (step) => tasks[step.id]?.completed,
    ).length;
    return Math.round((completed / phaseTasks.length) * 100);
  };

  const getOverallProgress = () => {
    const allTasks = Object.values(tasks);
    const completed = allTasks.filter((task) => task.completed).length;
    return Math.round((completed / allTasks.length) * 100);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "high":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "meeting":
        return <Users className="w-4 h-4" />;
      case "document":
        return <FileText className="w-4 h-4" />;
      case "phone":
        return <Phone className="w-4 h-4" />;
      case "email":
        return <Mail className="w-4 h-4" />;
      case "inspection":
        return <Search className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const getCurrentPhaseTasks = useMemo(() => {
    const phase = workflowPhases[currentPhase];
    if (!phase) return [];

    return phase.steps.filter((step) => {
      const task = tasks[step.id];
      if (!task) return false;

      if (
        searchTerm &&
        !task.task.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      switch (filter) {
        case "completed":
          return task.completed;
        case "pending":
          return !task.completed;
        case "critical":
          return task.priority === "critical" && !task.completed;
        case "overdue":
          return task.priority === "critical" && !task.completed;
        default:
          return true;
      }
    });
  }, [currentPhase, tasks, searchTerm, filter]);

  const getNextIncompleteTask = useMemo(() => {
    return getCurrentPhaseTasks.find((step) => !tasks[step.id]?.completed);
  }, [getCurrentPhaseTasks, tasks]);

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getTasksForDate = useCallback(
    (date) => {
      const dateStr = date.toISOString().split("T")[0];
      return Object.values(tasks)
        .filter((task) => {
          if (!task.dueDate) return false;
          const taskDate = new Date(task.dueDate).toISOString().split("T")[0];
          return taskDate === dateStr;
        })
        .sort((a, b) => {
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    },
    [tasks],
  );

  const getWeekDates = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const formatMonth = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const navigateCalendar = useCallback(
    (direction) => {
      setCurrentCalendarDate((prev) => {
        const newDate = new Date(prev);
        if (calendarView === "month") {
          newDate.setMonth(prev.getMonth() + direction);
        } else if (calendarView === "week") {
          newDate.setDate(prev.getDate() + direction * 7);
        } else {
          newDate.setDate(prev.getDate() + direction);
        }
        return newDate;
      });
    },
    [calendarView],
  );

  // Memoize calendar data to prevent constant recalculation
  const calendarDays = useMemo(() => {
    if (calendarView !== "month") return [];

    const daysInMonth = getDaysInMonth(currentCalendarDate);
    const firstDay = getFirstDayOfMonth(currentCalendarDate);
    const days = [];
    const today = new Date().toDateString();
    const startDateStr = startDate.toDateString();

    // Empty cells for alignment
    for (let i = 0; i < firstDay; i++) {
      days.push({ type: "empty", key: `empty-${i}` });
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentCalendarDate.getFullYear(),
        currentCalendarDate.getMonth(),
        day,
      );
      const dateStr = date.toDateString();
      const dayTasks = getTasksForDate(date);

      days.push({
        type: "day",
        key: day,
        day,
        date,
        dateStr,
        dayTasks,
        isToday: dateStr === today,
        isStartDate: dateStr === startDateStr,
      });
    }

    return days;
  }, [calendarView, currentCalendarDate, startDate, getTasksForDate]);

  // Memoize week data to prevent constant recalculation
  const weekDaysData = useMemo(() => {
    if (calendarView !== "week") return [];

    const weekDates = getWeekDates(currentCalendarDate);
    const today = new Date().toDateString();
    const startDateStr = startDate.toDateString();

    return weekDates.map((date, index) => ({
      key: index,
      date,
      dateStr: date.toDateString(),
      dayTasks: getTasksForDate(date),
      isToday: date.toDateString() === today,
      isStartDate: date.toDateString() === startDateStr,
    }));
  }, [calendarView, currentCalendarDate, startDate, getTasksForDate]);

  // Memoize day view data
  const dayViewData = useMemo(() => {
    if (calendarView !== "day") return null;

    const dayTasks = getTasksForDate(currentCalendarDate);
    const isToday =
      currentCalendarDate.toDateString() === new Date().toDateString();
    const isStartDate =
      currentCalendarDate.toDateString() === startDate.toDateString();

    return {
      dayTasks,
      isToday,
      isStartDate,
    };
  }, [calendarView, currentCalendarDate, startDate, getTasksForDate]);

  // Create a stable task click handler
  const handleTaskClick = useCallback(
    (taskId) => (e) => {
      e.stopPropagation();
      toggleTask(taskId);
    },
    [toggleTask],
  );

  const CalendarView = () => {
    if (calendarView === "month") {
      return (
        <div className="grid grid-cols-7 gap-3">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center font-bold text-slate-300 p-3">
              {day}
            </div>
          ))}
          {calendarDays.map((dayData) => {
            if (dayData.type === "empty") {
              return <div key={dayData.key} className="p-2" />;
            }

            const { day, dayTasks, isToday, isStartDate } = dayData;

            return (
              <div
                key={day}
                className={`border rounded-2xl p-3 min-h-[120px] cursor-pointer transition-all duration-200 ${
                  isToday
                    ? "bg-blue-500/20 border-blue-400/50"
                    : isStartDate
                      ? "bg-emerald-500/20 border-emerald-400/50"
                      : "border-white/20 hover:bg-white/10"
                }`}
              >
                <div
                  className={`font-bold text-sm mb-2 flex items-center justify-between ${
                    isToday
                      ? "text-blue-300"
                      : isStartDate
                        ? "text-emerald-300"
                        : "text-white"
                  }`}
                >
                  <span>{day}</span>
                  {isStartDate && (
                    <span className="text-xs bg-emerald-500/30 px-2 py-1 rounded-full">
                      START
                    </span>
                  )}
                </div>
                <div className="space-y-1 overflow-hidden">
                  {dayTasks.slice(0, 4).map((task) => (
                    <div
                      key={task.id}
                      onClick={handleTaskClick(task.id)}
                      className={`text-xs p-2 rounded-lg border cursor-pointer transition-all ${
                        task.completed
                          ? "bg-white/5 text-slate-400 line-through border-white/10"
                          : task.priority === "critical"
                            ? "bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30"
                            : task.priority === "high"
                              ? "bg-orange-500/20 text-orange-300 border-orange-500/30 hover:bg-orange-500/30"
                              : "bg-white/10 text-slate-300 border-white/20 hover:bg-white/20"
                      }`}
                      title={task.task}
                    >
                      <div className="flex items-center space-x-1">
                        {task.completed ? (
                          <CheckCircle className="w-3 h-3 flex-shrink-0" />
                        ) : (
                          <Circle className="w-3 h-3 flex-shrink-0" />
                        )}
                        <span className="truncate font-medium">
                          {task.task}
                        </span>
                      </div>
                    </div>
                  ))}
                  {dayTasks.length > 4 && (
                    <div className="text-xs text-slate-400 text-center py-1">
                      +{dayTasks.length - 4} more tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (calendarView === "week") {
      return (
        <div className="grid grid-cols-7 gap-3">
          {weekDaysData.map((dayData) => {
            const { key, date, dayTasks, isToday, isStartDate } = dayData;

            return (
              <div
                key={key}
                className={`border rounded-2xl p-3 min-h-[400px] ${
                  isToday
                    ? "bg-blue-500/20 border-blue-400/50"
                    : isStartDate
                      ? "bg-emerald-500/20 border-emerald-400/50"
                      : "border-white/20"
                }`}
              >
                <div
                  className={`text-center mb-3 ${
                    isToday
                      ? "text-blue-300"
                      : isStartDate
                        ? "text-emerald-300"
                        : "text-white"
                  }`}
                >
                  <div className="text-sm font-medium">
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div className="text-xl font-bold">{date.getDate()}</div>
                  {isStartDate && (
                    <div className="text-xs bg-emerald-500/30 px-2 py-1 rounded-full mt-1">
                      START
                    </div>
                  )}
                </div>
                <div className="space-y-2 overflow-y-auto max-h-[320px]">
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={handleTaskClick(task.id)}
                      className={`p-2 rounded-lg text-xs cursor-pointer border transition-all ${
                        task.completed
                          ? "bg-white/5 text-slate-500 line-through border-white/10"
                          : getPriorityColor(task.priority) +
                            " hover:bg-opacity-30"
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {task.completed ? (
                          <CheckCircle className="w-3 h-3 flex-shrink-0" />
                        ) : (
                          <Circle className="w-3 h-3 flex-shrink-0" />
                        )}
                        <span className="font-medium">{task.priority}</span>
                      </div>
                      <p className="font-medium leading-tight">{task.task}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {task.timeframe}
                      </p>
                    </div>
                  ))}
                  {dayTasks.length === 0 && (
                    <div className="text-center text-slate-400 py-4">
                      <Circle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">No tasks</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // Day view
    if (!dayViewData) return null;

    const { dayTasks, isToday, isStartDate } = dayViewData;

    return (
      <div className="space-y-4">
        <div
          className={`text-center py-6 rounded-2xl border ${
            isToday
              ? "bg-blue-500/20 border-blue-400/50"
              : isStartDate
                ? "bg-emerald-500/20 border-emerald-400/50"
                : "bg-white/5 border-white/20"
          }`}
        >
          <h3
            className={`text-2xl font-bold mb-2 ${
              isToday
                ? "text-blue-300"
                : isStartDate
                  ? "text-emerald-300"
                  : "text-white"
            }`}
          >
            {currentCalendarDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </h3>
          {isStartDate && (
            <span className="inline-block bg-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full text-sm font-medium">
              Listing Start Date
            </span>
          )}
          <p className="text-slate-400 mt-2">
            {dayTasks.length} tasks scheduled
          </p>
        </div>

        <div className="space-y-3">
          {dayTasks.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-300 text-lg">
                No tasks scheduled for this day
              </p>
              <p className="text-slate-400">
                Tasks will appear based on your workflow timeline
              </p>
            </div>
          ) : (
            dayTasks.map((task) => (
              <div
                key={task.id}
                onClick={handleTaskClick(task.id)}
                className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                  task.completed
                    ? "bg-white/5 border-white/10"
                    : "bg-white/10 border-white/20 hover:bg-white/15"
                }`}
              >
                <div className="flex items-start space-x-4">
                  <button
                    onClick={handleTaskClick(task.id)}
                    className="mt-1 flex-shrink-0 transition-transform hover:scale-110"
                  >
                    {task.completed ? (
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-400 hover:text-white" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p
                      className={`font-medium text-lg transition-all duration-200 ${
                        task.completed
                          ? "text-slate-400 line-through"
                          : "text-white"
                      }`}
                    >
                      {task.task}
                    </p>
                    <div className="flex items-center space-x-3 mt-3">
                      <span
                        className={`text-xs px-3 py-1 rounded-full border ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{task.timeframe}</span>
                      </span>
                      <span className="text-xs text-slate-400 flex items-center space-x-1">
                        {getTypeIcon(task.type)}
                        <span className="capitalize">{task.type}</span>
                      </span>
                      <span className="text-xs text-slate-400 bg-white/10 px-2 py-1 rounded-full">
                        {task.phase}
                      </span>
                    </div>

                    {task.completedDate && (
                      <p className="text-xs text-emerald-400 mt-3 flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>
                          Completed:{" "}
                          {new Date(task.completedDate).toLocaleDateString()}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const PhaseNavigation = () => (
    <div className="space-y-2">
      {Object.entries(workflowPhases).map(([phase, data]) => {
        const progress = getPhaseProgress(phase);
        const isActive = currentPhase === phase;

        return (
          <button
            key={phase}
            onClick={() => {
              setCurrentPhase(phase);
              setSidebarOpen(false);
            }}
            className={`w-full text-left p-4 rounded-2xl transition-all duration-200 ${
              isActive
                ? "bg-white/20 border border-white/30 shadow-lg"
                : "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20"
            }`}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div
                className={`p-2 rounded-lg bg-${data.color}-500/20 border border-${data.color}-500/30`}
              >
                {data.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white text-sm">{phase}</h3>
                <p className="text-xs text-slate-400">{data.days}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-white">{progress}%</p>
                <div className="w-12 bg-white/10 rounded-full h-2 mt-1">
                  <div
                    className={`bg-${data.color}-500 h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-300">{data.description}</p>
          </button>
        );
      })}
    </div>
  );

  return (
    <ModernDashboardLayout
      title="180-Day Workflow Guide"
      subtitle="Complete step-by-step real estate transaction workflow"
    >
      <div className="flex gap-6 h-full">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden">
            <div className="fixed left-0 top-0 h-full w-80 bg-slate-900/95 backdrop-blur-lg border-r border-white/10 p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">
                  Workflow Phases
                </h3>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <PhaseNavigation />
            </div>
          </div>
        )}

        {/* Desktop Sidebar - positioned to not overlap main navigation */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <div className="relative group h-full" style={{ zIndex: 10 }}>
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 h-full overflow-y-auto">
              <div className="mb-6">
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => navigate("/dashboard/resources")}
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                  className="mb-4"
                >
                  Back to Resources
                </Button>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Views</h3>
                  <div className="flex bg-white/10 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode("phase")}
                      className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 text-sm ${
                        viewMode === "phase"
                          ? "bg-white/20 text-white shadow-lg"
                          : "text-slate-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <List className="w-4 h-4" />
                      <span>Phase</span>
                    </button>
                    <button
                      onClick={() => setViewMode("calendar")}
                      className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 text-sm ${
                        viewMode === "calendar"
                          ? "bg-white/20 text-white shadow-lg"
                          : "text-slate-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Calendar</span>
                    </button>
                  </div>
                </div>

                {viewMode === "calendar" && (
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-4">
                    <h4 className="font-semibold text-white text-sm mb-3">
                      Set Start Date
                    </h4>
                    <input
                      type="date"
                      value={startDate.toISOString().split("T")[0]}
                      onChange={(e) =>
                        handleStartDateChange(new Date(e.target.value))
                      }
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                    />
                    <p className="text-xs text-slate-400 mt-2">
                      All 180 tasks will be scheduled from this date
                    </p>
                  </div>
                )}

                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-white text-sm">
                      Overall Progress
                    </span>
                    <span className="text-xl font-bold text-emerald-400">
                      {getOverallProgress()}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${getOverallProgress()}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {Object.values(tasks).filter((t) => t.completed).length} of
                    180 tasks complete
                  </p>
                </div>

                {viewMode === "phase" && (
                  <>
                    <h3 className="text-lg font-bold text-white mb-2">
                      Workflow Phases
                    </h3>
                  </>
                )}
              </div>
              {viewMode === "phase" ? (
                <PhaseNavigation />
              ) : (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-white mb-2">
                    Calendar Navigation
                  </h4>
                  <div className="flex gap-2">
                    {["month", "week", "day"].map((view) => (
                      <button
                        key={view}
                        onClick={() => setCalendarView(view)}
                        className={`px-3 py-2 rounded-xl capitalize transition-all duration-200 text-sm ${
                          calendarView === view
                            ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/50"
                            : "bg-white/10 text-slate-300 border border-white/20 hover:bg-white/20 hover:text-white"
                        }`}
                      >
                        {view}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Mobile Header */}
          <div className="lg:hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  leftIcon={<Menu className="h-4 w-4" />}
                >
                  {viewMode === "phase" ? "Phases" : "Calendar"}
                </Button>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => navigate("/dashboard/resources")}
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                >
                  Back
                </Button>
              </div>
            </div>
          </div>

          {viewMode === "calendar" && (
            <>
              {/* Calendar Navigation Header */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => navigateCalendar(-1)}
                      className="p-2 hover:bg-white/10 rounded-lg transition"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <h2 className="text-xl font-semibold text-white">
                      {calendarView === "month"
                        ? formatMonth(currentCalendarDate)
                        : calendarView === "week"
                          ? `Week of ${currentCalendarDate.toLocaleDateString()}`
                          : currentCalendarDate.toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentCalendarDate(new Date())}
                        className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition text-white"
                      >
                        Today
                      </button>
                      <button
                        onClick={() => navigateCalendar(1)}
                        className="p-2 hover:bg-white/10 rounded-lg transition"
                      >
                        <ChevronRight className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calendar View */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <CalendarView />
                </div>
              </div>
            </>
          )}

          {viewMode === "phase" && (
            <>
              {/* Current Phase Header */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-3 rounded-2xl bg-${workflowPhases[currentPhase].color}-500/20 border border-${workflowPhases[currentPhase].color}-500/30`}
                      >
                        {workflowPhases[currentPhase].icon}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          {currentPhase}
                        </h2>
                        <p className="text-slate-300">
                          {workflowPhases[currentPhase].description}
                        </p>
                        <p className="text-sm text-slate-400">
                          Timeline: {workflowPhases[currentPhase].days}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-emerald-400">
                        {getPhaseProgress(currentPhase)}%
                      </p>
                      <p className="text-sm text-slate-400">
                        {
                          workflowPhases[currentPhase].steps.filter(
                            (step) => tasks[step.id]?.completed,
                          ).length
                        }{" "}
                        of {workflowPhases[currentPhase].steps.length}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-white/10 rounded-full h-3 mb-4">
                    <div
                      className={`bg-${workflowPhases[currentPhase].color}-500 h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${getPhaseProgress(currentPhase)}%` }}
                    />
                  </div>

                  {/* Next Task Highlight */}
                  {(() => {
                    const nextTask = getNextIncompleteTask;
                    return nextTask ? (
                      <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center space-x-3">
                          <Target className="w-5 h-5 text-emerald-400" />
                          <div>
                            <p className="text-sm font-semibold text-white">
                              Next Task:
                            </p>
                            <p className="text-slate-300">{nextTask.task}</p>
                            <p className="text-xs text-slate-400">
                              {nextTask.timeframe}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/30">
                        <div className="flex items-center space-x-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <div>
                            <p className="text-sm font-semibold text-emerald-300">
                              Phase Complete!
                            </p>
                            <p className="text-emerald-400">
                              All tasks in this phase are finished.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Filters */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search current phase tasks..."
                          className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {["all", "pending", "completed", "critical"].map(
                        (filterType) => (
                          <button
                            key={filterType}
                            onClick={() => setFilter(filterType)}
                            className={`px-4 py-2 rounded-xl capitalize transition-all duration-200 text-sm ${
                              filter === filterType
                                ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/50"
                                : "bg-white/10 text-slate-300 border border-white/20 hover:bg-white/20 hover:text-white"
                            }`}
                          >
                            {filterType}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Task List */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">
                      Phase Tasks ({getCurrentPhaseTasks.length})
                    </h3>
                    <div className="space-y-3">
                      {getCurrentPhaseTasks.map((step) => {
                        const task = tasks[step.id];
                        if (!task) return null;

                        return (
                          <div
                            key={step.id}
                            className={`p-4 rounded-2xl border transition-all duration-200 ${
                              task.completed
                                ? "bg-white/5 border-white/10"
                                : "bg-white/10 border-white/20 hover:bg-white/15"
                            }`}
                          >
                            <div className="flex items-start space-x-4">
                              <button
                                onClick={() => toggleTask(step.id)}
                                className="mt-1 flex-shrink-0 transition-transform hover:scale-110"
                              >
                                {task.completed ? (
                                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                                ) : (
                                  <Circle className="w-6 h-6 text-slate-400 hover:text-white" />
                                )}
                              </button>

                              <div className="flex-1">
                                <p
                                  className={`font-medium text-lg transition-all duration-200 ${
                                    task.completed
                                      ? "text-slate-400 line-through"
                                      : "text-white"
                                  }`}
                                >
                                  {task.task}
                                </p>
                                <div className="flex items-center space-x-3 mt-2">
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}
                                  >
                                    {task.priority}
                                  </span>
                                  <span className="text-xs text-slate-400 flex items-center space-x-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{task.timeframe}</span>
                                  </span>
                                  <span className="text-xs text-slate-400 flex items-center space-x-1">
                                    {getTypeIcon(task.type)}
                                    <span className="capitalize">
                                      {task.type}
                                    </span>
                                  </span>
                                </div>

                                {task.completedDate && (
                                  <p className="text-xs text-emerald-400 mt-2 flex items-center space-x-1">
                                    <CheckCircle className="w-3 h-3" />
                                    <span>
                                      Completed:{" "}
                                      {new Date(
                                        task.completedDate,
                                      ).toLocaleDateString()}
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {getCurrentPhaseTasks.length === 0 && (
                        <div className="text-center py-12">
                          <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                          <p className="text-slate-300 text-lg">
                            No tasks match your current filter
                          </p>
                          <p className="text-slate-400">
                            Try adjusting your search or filter settings
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ModernDashboardLayout>
  );
};

export default RealEstateWorkflow;
