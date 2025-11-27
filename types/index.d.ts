interface Job {
    title: string;
    description: string;
    location: string;
    requiredSkills: string[];
  }
  
  interface Resume {
    id: string;
    companyName?: string;
    jobTitle?: string;
    imagePath: string;
    resumePath: string;
    feedback: Feedback;
  }
  
  interface Feedback {
    overallScore: number;
    ATS: {
      score: number;
      tips: {
        type: "good" | "improve";
        tip: string;
      }[];
    };
    toneAndStyle: {
      score: number;
      tips: {
        type: "good" | "improve";
        tip: string;
        explanation: string;
      }[];
    };
    content: {
      score: number;
      tips: {
        type: "good" | "improve";
        tip: string;
        explanation: string;
      }[];
    };
    structure: {
      score: number;
      tips: {
        type: "good" | "improve";
        tip: string;
        explanation: string;
      }[];
    };
    skills: {
      score: number;
      tips: {
        type: "good" | "improve";
        tip: string;
        explanation: string;
      }[];
    };
  }

  // Types for Resume Builder
  interface ResumeData {
    id: string;
    fullName: string;
    title: string; // "Frontend Developer", "Designer", etc.
    about: string; // AI-generated professional about text
    aboutRaw?: string; // User's raw input before AI generation
    location?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    telegram?: string;
    experiences: Experience[];
    skills: string[];
    languages: Language[];
    recommendations: Recommendation[];
    style: ResumeStyle;
    createdAt: string;
    updatedAt: string;
  }

  interface Experience {
    id: string;
    company: string;
    position: string;
    period: {
      start: string; // YYYY-MM format
      end: string | null; // YYYY-MM format or null for "Present"
    };
    description: string; // AI-generated professional description
    descriptionRaw?: string; // User's raw input before AI generation
  }

  interface Language {
    id: string;
    name: string;
    level: LanguageLevel;
  }

  type LanguageLevel = "native" | "fluent" | "intermediate" | "basic";

  interface Recommendation {
    id: string;
    name: string;
    position: string;
    contact: string; // email or phone
  }

  type ResumeStyle = "modern" | "classic" | "minimal";

  interface KVItem {
    key: string;
    value: string;
  }

  interface PuterUser {
    username: string;
    email?: string;
  }

  interface FSItem {
    path: string;
    name: string;
    isDirectory: boolean;
  }

  interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string | Array<{
      type: "text" | "file";
      text?: string;
      puter_path?: string;
    }>;
  }

  interface PuterChatOptions {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  }

  interface AIResponse {
    message: {
      content: string | Array<{
        type: string;
        text: string;
      }>;
    };
  }