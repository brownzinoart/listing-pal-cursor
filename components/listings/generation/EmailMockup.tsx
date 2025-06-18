import React from "react";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

interface EmailMockupProps {
  emailContent: string;
}

const EmailMockup: React.FC<EmailMockupProps> = ({ emailContent }) => {
  // Extract subject line from email content with improved parsing
  const extractSubjectAndBody = (content: string) => {
    const lines = content.split("\n");
    let subjectLine = "Email Subject";
    let bodyContent = content;

    // Find the subject line
    const subjectLineIndex = lines.findIndex((line) =>
      line.toLowerCase().startsWith("subject:"),
    );

    if (subjectLineIndex >= 0) {
      const rawSubjectLine = lines[subjectLineIndex];
      subjectLine = rawSubjectLine.replace(/^subject:\s*/i, "").trim();

      // Check if subject line contains body content (common indicators)
      if (
        subjectLine.includes("Dear") ||
        subjectLine.includes("Hello") ||
        subjectLine.includes("Hi ") ||
        subjectLine.length > 80
      ) {
        // Subject line likely contains body content, try to split it
        const sentenceEnd = subjectLine.search(/[.!?]\s+/);
        if (sentenceEnd > 0 && sentenceEnd < 60) {
          // Split at sentence boundary
          const properSubject = subjectLine
            .substring(0, sentenceEnd + 1)
            .trim();
          const extraContent = subjectLine.substring(sentenceEnd + 1).trim();
          subjectLine = properSubject;

          // Rebuild body content without original subject line, adding extracted content
          const remainingLines = lines.slice(subjectLineIndex + 1);
          bodyContent =
            extraContent +
            (remainingLines.length > 0 ? "\n" + remainingLines.join("\n") : "");
        } else {
          // No good sentence boundary, take first 10 words as subject
          const words = subjectLine.split(" ");
          subjectLine = words.slice(0, 10).join(" ");
          const extraContent = words.slice(10).join(" ");

          // Rebuild body content
          const remainingLines = lines.slice(subjectLineIndex + 1);
          bodyContent =
            extraContent +
            (remainingLines.length > 0 ? "\n" + remainingLines.join("\n") : "");
        }
      } else {
        // Subject line looks clean, just remove it from body
        const beforeSubject = lines.slice(0, subjectLineIndex);
        const afterSubject = lines.slice(subjectLineIndex + 1);
        bodyContent = [...beforeSubject, ...afterSubject].join("\n").trim();
      }
    }

    return { subjectLine, bodyContent };
  };

  const { subjectLine, bodyContent } = extractSubjectAndBody(emailContent);

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Email Header */}
      <div className="bg-gray-100 p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
              <EnvelopeIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              [Your Name]
            </p>
            <p className="text-xs text-gray-500 truncate">to: [Client Email]</p>
          </div>
        </div>
      </div>

      {/* Subject Line */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <p className="text-sm font-semibold text-gray-900" title={subjectLine}>
          {subjectLine}
        </p>
      </div>

      {/* Email Body Preview - Enhanced */}
      <div className="p-4">
        <div className="text-sm text-gray-700 space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {bodyContent.split("\n").map((line, index) => (
            <p
              key={index}
              className={`${line.trim() === "" ? "h-3" : ""} leading-relaxed`}
            >
              {line.trim() || "\u00A0"}
            </p>
          ))}
        </div>
      </div>

      {/* Email Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Real Estate Email</span>
          <div className="flex space-x-2">
            <button className="text-xs text-teal-600 hover:text-teal-700">
              Reply
            </button>
            <button className="text-xs text-teal-600 hover:text-teal-700">
              Forward
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailMockup;
