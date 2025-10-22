"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Settings,
  Users as UsersIcon,
  Link as LinkIcon,
  Copy,
  CheckCheck,
  Target,
  Shield,
  Zap,
  Rocket,
  X,
  AlertTriangle,
  MessageSquare,
  Smartphone,
  Heart,
  Award,
  Loader2,
  Palette,
  Eye,
  Layout,
  Globe,
  Edit3,
  Save,
  Type,
  FileText,
  Database,
  UserCheck,
  Users
} from "lucide-react";
import toast from "react-hot-toast";
import { debounce } from "lodash";

// Mock types for demonstration - replace with your actual imports
type FormSettings = {
  userType: string;
  validityDuration: number;
  maxResponses: number;
  allowMultipleResponses: boolean;
  enableProgressSave: boolean;
  collectEmail: boolean;
  customSlug: string;
  enableCustomSlug: boolean;
  isActive: boolean;
  previousSlugs: string[];
  whatsappGroupLink: string;
  arrataiGroupLink: string;
  showGroupLinks: boolean;
};

type Theme = {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
};

type Form = {
  _id: string;
  title: string;
  description?: string;
  status: "draft" | "published";
  settings: FormSettings;
  theme: Theme;
};

interface SettingsTabProps {
  form: Form;
  onUpdate: (updates: Partial<Form>) => void;
}

// Global path constant for the form access route
const BASE_FORM_PATH = "/forms/";

// Modern Toggle Switch Component
const ToggleSwitch = ({
  checked,
  onChange,
  labelId,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  labelId: string;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-labelledby={labelId}
    onClick={() => onChange(!checked)}
    className={`${
      checked ? "bg-purple-600" : "bg-slate-300"
    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-inner`}
  >
    <span
      aria-hidden="true"
      className={`${
        checked ? "translate-x-5" : "translate-x-0"
      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-all duration-300 ease-in-out ${
        checked ? "shadow-purple-500/25" : "shadow-slate-400/25"
      }`}
    />
  </button>
);

// Function to safely get app origin
const getAppOrigin = () => {
  return typeof window !== "undefined" ? window.location.origin : "";
};

// Color picker component - Mobile responsive
const ColorPicker = ({
  color,
  onChange,
  label,
}: {
  color: string;
  onChange: (color: string) => void;
  label: string;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
    <label className="text-sm font-semibold text-slate-700 sm:min-w-[120px]">
      {label}
    </label>
    <div className="flex items-center gap-3 flex-1">
      <div className="relative">
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 cursor-pointer rounded-2xl border-4 border-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
        />
        <div className="absolute inset-0 rounded-2xl border border-slate-200 pointer-events-none" />
      </div>
      <input
        type="text"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-sm font-mono min-w-0 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
        placeholder="#7C3AED"
      />
    </div>
  </div>
);

// Status Indicator Component
const StatusIndicator = ({
  status,
  message,
}: {
  status: "idle" | "loading" | "success" | "error";
  message: string;
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case "loading":
        return {
          color: "text-purple-600 bg-purple-50 border-purple-200",
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
        };
      case "success":
        return {
          color: "text-green-600 bg-green-50 border-green-200",
          icon: <CheckCheck className="w-4 h-4" />,
        };
      case "error":
        return {
          color: "text-red-600 bg-red-50 border-red-200",
          icon: <AlertTriangle className="w-4 h-4" />,
        };
      default:
        return {
          color: "text-slate-600 bg-slate-50 border-slate-200",
          icon: null,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 ${config.color} transition-all duration-300 shadow-lg backdrop-blur-sm`}
    >
      {config.icon}
      <span className="text-sm font-semibold">{message}</span>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  isActive,
  onToggle,
  labelId,
}: {
  icon: any;
  title: string;
  description: string;
  isActive: boolean;
  onToggle: (checked: boolean) => void;
  labelId: string;
}) => (
  <div
    className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
      isActive
        ? "bg-purple-50 border-purple-200 shadow-lg shadow-purple-500/10"
        : "bg-slate-50 border-slate-200 hover:border-slate-300"
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 flex-1">
        <div
          className={`p-2 rounded-xl transition-all duration-300 ${
            isActive
              ? "bg-purple-100 text-purple-600"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-800 text-sm">{title}</h4>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>
      </div>
      <ToggleSwitch checked={isActive} onChange={onToggle} labelId={labelId} />
    </div>
  </div>
);

// Collection Type Selector Component
const CollectionTypeSelector = ({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (value: 'swayamsevak' | 'lead') => void;
}) => (
  <div className="space-y-4">
    <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
      <Database className="w-4 h-4 text-purple-600" />
      Save Responses To Collection
    </label>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Swayamsevak Collection Option */}
      <button
        onClick={() => onChange('swayamsevak')}
        className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
          value === 'swayamsevak'
            ? 'bg-blue-50 border-blue-300 shadow-lg shadow-blue-500/10'
            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${
            value === 'swayamsevak' 
              ? 'bg-blue-100 text-blue-600' 
              : 'bg-slate-100 text-slate-500'
          }`}>
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 text-sm">Swayamsevak Collection</h4>
            <p className="text-xs text-slate-500 mt-1">Save responses to volunteer database</p>
          </div>
        </div>
        {value === 'swayamsevak' && (
          <div className="mt-2 flex items-center gap-1 text-blue-600 text-xs font-semibold">
            <CheckCheck className="w-3 h-3" />
            Currently Selected
          </div>
        )}
      </button>

      {/* Lead Collection Option */}
      <button
        onClick={() => onChange('lead')}
        className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
          value === 'lead'
            ? 'bg-green-50 border-green-300 shadow-lg shadow-green-500/10'
            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${
            value === 'lead' 
              ? 'bg-green-100 text-green-600' 
              : 'bg-slate-100 text-slate-500'
          }`}>
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 text-sm">Lead Collection</h4>
            <p className="text-xs text-slate-500 mt-1">Save responses to leads database</p>
          </div>
        </div>
        {value === 'lead' && (
          <div className="mt-2 flex items-center gap-1 text-green-600 text-xs font-semibold">
            <CheckCheck className="w-3 h-3" />
            Currently Selected
          </div>
        )}
      </button>
    </div>

    <p className="text-xs text-slate-500">
      Choose where form responses will be stored. This determines which database collection will be used.
    </p>
  </div>
);

// Editable Form Title & Description Component
const FormDetailsEditor = ({ 
  form, 
  onUpdate 
}: { 
  form: Form; 
  onUpdate: (updates: Partial<Form>) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState(form.title);
  const [localDescription, setLocalDescription] = useState(form.description || "");

  const handleSave = () => {
    if (localTitle.trim() === "") {
      toast.error("Form title cannot be empty");
      return;
    }

    onUpdate({
      title: localTitle.trim(),
      description: localDescription.trim() || undefined
    });
    setIsEditing(false);
    toast.success("Form details updated!");
  };

  const handleCancel = () => {
    setLocalTitle(form.title);
    setLocalDescription(form.description || "");
    setIsEditing(false);
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
      <header className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-lg">
            <Type className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Form Details</h3>
            <p className="text-sm text-slate-500">Edit title and description</p>
          </div>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Edit3 className="w-4 h-4" />
            <span className="font-semibold">Edit</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-slate-500 text-white rounded-xl hover:bg-slate-600 transition-all duration-300 shadow-lg"
            >
              <X className="w-4 h-4" />
              <span className="font-semibold">Cancel</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Save className="w-4 h-4" />
              <span className="font-semibold">Save</span>
            </button>
          </div>
        )}
      </header>

      <div className="space-y-6">
        {/* Title Input */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600" />
            Form Title
          </label>
          {isEditing ? (
            <input
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-lg font-semibold transition-all duration-200 shadow-sm"
              placeholder="Enter form title..."
              maxLength={100}
            />
          ) : (
            <div className="px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent">
              <h4 className="text-lg font-semibold text-slate-800">{form.title}</h4>
            </div>
          )}
          <div className="text-xs text-slate-500 flex justify-between">
            <span>This will be displayed as the main form heading</span>
            {isEditing && <span>{localTitle.length}/100 characters</span>}
          </div>
        </div>

        {/* Description Input */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600" />
            Description
          </label>
          {isEditing ? (
            <textarea
              value={localDescription}
              onChange={(e) => setLocalDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm transition-all duration-200 shadow-sm resize-none"
              placeholder="Describe the purpose of this form..."
              maxLength={500}
            />
          ) : (
            <div className="px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent min-h-[80px]">
              <p className="text-sm text-slate-700">
                {form.description || "No description provided"}
              </p>
            </div>
          )}
          <div className="text-xs text-slate-500 flex justify-between">
            <span>Optional description to provide context to respondents</span>
            {isEditing && <span>{localDescription.length}/500 characters</span>}
          </div>
        </div>
      </div>
    </section>
  );
};

export default function SettingsTab({ form, onUpdate }: SettingsTabProps) {
  const defaultSettings: FormSettings = {
    userType: "swayamsevak",
    validityDuration: 10080,
    maxResponses: 0,
    allowMultipleResponses: false,
    enableProgressSave: true,
    collectEmail: true,
    customSlug: "",
    enableCustomSlug: false,
    isActive: form.status === "published",
    previousSlugs: [],
    whatsappGroupLink: "",
    arrataiGroupLink: "",
    showGroupLinks: false,
  };

  const defaultTheme: Theme = {
    primaryColor: "#7C3AED",
    backgroundColor: "#FFFFFF",
    textColor: "#1F2937",
    fontFamily: "Inter",
  };

  const [settings, setSettings] = useState<FormSettings>(
    form.settings || defaultSettings
  );
  const [theme, setTheme] = useState<Theme>(form.theme || defaultTheme);
  const [slugStatus, setSlugStatus] = useState({
    checking: false,
    available: null as boolean | null,
    message: "",
  });
  const [copiedLink, setCopiedLink] = useState("");
  const [previewTheme, setPreviewTheme] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const appOrigin = getAppOrigin();

  // Real slug availability check
  const debouncedCheckSlug = useCallback(
    debounce(async (slug: string) => {
      if (!slug) {
        setSlugStatus({ checking: false, available: null, message: "" });
        return;
      }

      // Basic validation
      if (slug.length < 3) {
        setSlugStatus({
          checking: false,
          available: false,
          message: "Slug must be at least 3 characters",
        });
        return;
      }

      if (!/^[a-z0-9-]+$/.test(slug)) {
        setSlugStatus({
          checking: false,
          available: false,
          message: "Only lowercase letters, numbers, and hyphens allowed",
        });
        return;
      }

      setSlugStatus({
        checking: true,
        available: null,
        message: "Checking availability...",
      });

      try {
        const response = await fetch(
          `/api/forms/check-slug?slug=${encodeURIComponent(slug)}&formId=${
            form._id
          }`
        );
        const data = await response.json();

        if (response.ok) {
          setSlugStatus({
            checking: false,
            available: data.available,
            message:
              data.message ||
              (data.available
                ? "Slug is available! 🎉"
                : "Slug is already taken 😔"),
          });
        } else {
          throw new Error(data.error || "Failed to check slug");
        }
      } catch (error) {
        console.error("Error checking slug:", error);
        setSlugStatus({
          checking: false,
          available: false,
          message: "Error checking slug availability",
        });
      }
    }, 800),
    [form._id]
  );

  useEffect(() => {
    return () => debouncedCheckSlug.cancel();
  }, [debouncedCheckSlug]);

  useEffect(() => {
    if (settings.enableCustomSlug && settings.customSlug) {
      if (settings.customSlug !== form.settings?.customSlug) {
        debouncedCheckSlug(settings.customSlug);
      }
    } else {
      setSlugStatus({ checking: false, available: null, message: "" });
    }
  }, [
    settings.customSlug,
    settings.enableCustomSlug,
    debouncedCheckSlug,
    form.settings?.customSlug,
  ]);

  useEffect(() => {
    setSettings((prev) => ({ ...prev, isActive: form.status === "published" }));
  }, [form.status]);

  const updateSettings = (updates: Partial<FormSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    onUpdate({ settings: newSettings });
  };

  const updateTheme = (updates: Partial<Theme>) => {
    const newTheme = { ...theme, ...updates };
    setTheme(newTheme);
    onUpdate({ theme: newTheme });
  };

  const generateSlugFromTitle = () => {
    if (!form.title) return;
    const slug = form.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    updateSettings({ customSlug: slug });
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(type);
      toast.success("Link copied! 🔗");
      setTimeout(() => setCopiedLink(""), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  // Save/Publish/Update Handler
  const handleSaveChanges = async (newStatus: "published" | "draft") => {
    console.log("🚀 PUBLISH BUTTON CLICKED!", {
      newStatus,
      currentStatus: form.status,
      collectionType: settings.userType
    });

    setSaveStatus("loading");

    if (newStatus === "published" && form.status === "draft") {
      setStatusMessage("Publishing form... 🚀");
    } else if (newStatus === "published" && form.status === "published") {
      setStatusMessage("Updating settings...");
    } else {
      setStatusMessage("Unpublishing form...");
    }

    // Slug validation for publishing
    if (newStatus === "published" && settings.enableCustomSlug) {
      if (!settings.customSlug || settings.customSlug.length < 3) {
        setSaveStatus("error");
        setStatusMessage("Custom Slug too short");
        toast.error("Custom slug must be at least 3 characters.");
        setTimeout(() => setSaveStatus("idle"), 3000);
        return;
      }
      if (settings.customSlug !== form.settings?.customSlug) {
        if (slugStatus.checking) {
          setSaveStatus("error");
          setStatusMessage("Please wait for slug check");
          toast.error("Please wait for slug availability check to finish.");
          setTimeout(() => setSaveStatus("idle"), 3000);
          return;
        }
        if (slugStatus.available === false) {
          setSaveStatus("error");
          setStatusMessage("Slug is not available");
          toast.error("The chosen slug is not available.");
          setTimeout(() => setSaveStatus("idle"), 3000);
          return;
        }
      }
    }

    // Prepare payload
    const payload = {
      formId: form._id,
      status: newStatus,
      settings: {
        ...settings,
        isActive: newStatus === "published",
        customSlug: settings.enableCustomSlug ? settings.customSlug : undefined,
      },
      theme: theme,
    };

    console.log("📦 Sending payload:", payload);

    try {
      setStatusMessage("Saving to server...");

      const response = await fetch("/api/forms", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("📡 API Response status:", response.status);

      const data = await response.json();
      console.log("📡 API Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      // SUCCESS
      setSaveStatus("success");

      if (newStatus === "published" && form.status === "draft") {
        setStatusMessage("Form published successfully! 🎉");
        toast.success("Form published successfully! 🚀");
      } else if (newStatus === "published" && form.status === "published") {
        setStatusMessage("Settings updated successfully! ✅");
        toast.success("Settings updated!");
      } else {
        setStatusMessage("Form unpublished successfully");
        toast.success("Form unpublished successfully");
      }

      // Update parent component
      onUpdate({
        status: newStatus,
        settings: data.form?.settings || payload.settings,
        theme: data.form?.theme || payload.theme,
      });

      // Reset status after success
      setTimeout(() => {
        setSaveStatus("idle");
        setStatusMessage("");
      }, 3000);
    } catch (error: any) {
      console.error("❌ Save error:", error);
      setSaveStatus("error");
      setStatusMessage(error.message || "Failed to save changes");
      toast.error(error.message || "Failed to save changes. Please try again.");

      // Reset error status
      setTimeout(() => {
        setSaveStatus("idle");
        setStatusMessage("");
      }, 5000);
    }
  };

  const currentSlug =
    settings.enableCustomSlug && settings.customSlug
      ? settings.customSlug
      : form._id;

  const currentFormUrl = `${appOrigin}${BASE_FORM_PATH}${currentSlug}`;

  // Fixed handleSlugChange function
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    updateSettings({ customSlug: newSlug });
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 space-y-8 pb-12 font-sans">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex flex-col items-center p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-indigo-50/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-100/50 w-full max-w-4xl">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/50 mb-4">
            <Settings
              className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-pulse"
              style={{ animationDuration: "4s" }}
            />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-br from-purple-600 to-indigo-700 bg-clip-text text-transparent tracking-tight px-4">
            Form Configuration
          </h2>
          <p className="mt-3 text-sm sm:text-lg text-slate-600 max-w-2xl px-4">
            Customize your form's appearance, behavior, and sharing options
          </p>
        </div>
      </div>

      {/* Status Indicator */}
      {saveStatus !== "idle" && (
        <div className="animate-in slide-in-from-top duration-500">
          <StatusIndicator status={saveStatus} message={statusMessage} />
        </div>
      )}

      {/* Form Details Editor */}
      <FormDetailsEditor form={form} onUpdate={onUpdate} />

      {/* Collection Type Section - NEW */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
        <header className="flex items-center gap-4 pb-4 border-b border-slate-100">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-lg">
            <Database className="w-7 h-7 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Data Collection</h3>
            <p className="text-sm text-slate-500">Choose where responses will be saved</p>
          </div>
        </header>

        <CollectionTypeSelector 
          value={settings.userType} 
          onChange={(value) => updateSettings({ userType: value })} 
        />
      </section>

      {/* Status Banner */}
      <div
        className={`p-4 sm:p-6 rounded-3xl text-center shadow-xl transition-all duration-500 backdrop-blur-sm ${
          form.status === "published"
            ? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-800"
            : "bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 text-amber-800"
        }`}
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          {form.status === "published" ? (
            <>
              <Rocket className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
              <h4 className="font-bold text-xl sm:text-2xl">FORM IS LIVE</h4>
            </>
          ) : (
            <>
              <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600" />
              <h4 className="font-bold text-xl sm:text-2xl">FORM IS DRAFT</h4>
            </>
          )}
        </div>
        <p className="text-xs sm:text-sm font-medium text-slate-600">
          {form.status === "published"
            ? `Your form is publicly accessible at:`
            : "Your form is not currently visible to the public"}
        </p>
        {form.status === "published" && (
          <p className="mt-2 font-mono text-xs sm:text-sm bg-white/50 px-3 sm:px-4 py-2 rounded-xl border border-green-200 inline-block max-w-full overflow-x-auto">
            {currentFormUrl}
          </p>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left Column - Theme & Settings */}
        <div className="space-y-6 lg:space-y-8">
          {/* Theme Customization */}
          <section className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-4 sm:p-6 lg:p-8 space-y-6">
            <header className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center shadow-lg">
                <Palette className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Theme Design
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Customize the visual appearance
                </p>
              </div>
            </header>

            {/* Theme Preview */}
            {previewTheme && (
              <div className="p-4 sm:p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-purple-200 animate-in fade-in duration-500">
                <div className="text-center mb-4">
                  <h4 className="font-bold text-slate-700 text-base sm:text-lg flex items-center justify-center gap-2">
                    <Layout className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" /> Live Preview
                  </h4>
                </div>
                <div
                  className="p-4 sm:p-6 rounded-2xl border-2 border-slate-200 shadow-lg"
                  style={{
                    backgroundColor: theme.backgroundColor,
                    color: theme.textColor,
                    fontFamily: theme.fontFamily,
                  }}
                >
                  <div className="space-y-4">
                    <h5 className="text-lg sm:text-2xl font-bold">Sample Form Title</h5>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Sample input field..."
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 transition-colors"
                        style={{ borderColor: theme.primaryColor + "40" }}
                        disabled
                      />
                      <button
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-bold transition-transform hover:scale-[1.02] text-sm sm:text-base shadow-lg"
                        style={{
                          backgroundColor: theme.primaryColor,
                          color: "white",
                        }}
                      >
                        Submit Response
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-5">
              <ColorPicker
                label="Primary Color"
                color={theme.primaryColor}
                onChange={(color) => updateTheme({ primaryColor: color })}
              />
              <ColorPicker
                label="Background"
                color={theme.backgroundColor}
                onChange={(color) => updateTheme({ backgroundColor: color })}
              />
              <ColorPicker
                label="Text Color"
                color={theme.textColor}
                onChange={(color) => updateTheme({ textColor: color })}
              />

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="text-sm font-semibold text-slate-700 sm:min-w-[120px]">
                  Font Family
                </label>
                <select
                  value={theme.fontFamily}
                  onChange={(e) => updateTheme({ fontFamily: e.target.value })}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-sm bg-white shadow-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                >
                  <option value="Inter">Inter (Default)</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Lato">Lato</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setPreviewTheme(!previewTheme)}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all duration-300 text-purple-700 font-semibold border border-purple-200 hover:border-purple-300"
            >
              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              {previewTheme ? "Hide Live Preview" : "Show Live Preview"}
            </button>
          </section>

          {/* Form Features */}
          <section className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-4 sm:p-6 lg:p-8 space-y-6">
            <header className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Form Features
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Configure form behavior and options
                </p>
              </div>
            </header>

            <div className="space-y-4">
              <FeatureCard
                icon={Shield}
                title="Progress Saving"
                description="Allow users to save and continue later"
                isActive={settings.enableProgressSave}
                onToggle={(val) => updateSettings({ enableProgressSave: val })}
                labelId="progress-saving"
              />
              <FeatureCard
                icon={UsersIcon}
                title="Collect Email"
                description="Require email address for responses"
                isActive={settings.collectEmail}
                onToggle={(val) => updateSettings({ collectEmail: val })}
                labelId="collect-email"
              />
              <FeatureCard
                icon={Globe}
                title="Multiple Responses"
                description="Allow users to submit multiple times"
                isActive={settings.allowMultipleResponses}
                onToggle={(val) =>
                  updateSettings({ allowMultipleResponses: val })
                }
                labelId="multiple-responses"
              />
            </div>
          </section>
        </div>

        {/* Right Column - URL & Actions */}
        <div className="space-y-6 lg:space-y-8">
          {/* URL & Links Section */}
          <section className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-4 sm:p-6 lg:p-8 space-y-6">
            <header className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-teal-100 to-green-100 rounded-2xl flex items-center justify-center shadow-lg">
                <LinkIcon className="w-6 h-6 sm:w-7 sm:h-7 text-teal-600" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Form Access
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Configure your public URL and links
                </p>
              </div>
            </header>

            {/* Current Live URL Display */}
            <div className="p-4 sm:p-5 bg-gradient-to-br from-purple-50 to-indigo-50/70 rounded-2xl border-2 border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">
                  Public Form Link
                </p>
                <p className="text-sm sm:text-base font-mono break-all text-purple-900 font-medium">
                  {currentFormUrl}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(currentFormUrl, "main")}
                className={`p-2 sm:p-3 rounded-xl transition-all duration-300 flex-shrink-0 shadow-lg ${
                  copiedLink === "main"
                    ? "bg-green-500 text-white scale-110"
                    : "bg-white text-purple-600 hover:bg-purple-50 border border-purple-200 hover:scale-105"
                }`}
              >
                {copiedLink === "main" ? (
                  <CheckCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>

            {/* Fixed Custom Slug Section */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label
                  id="custom-slug-label"
                  className="font-semibold text-slate-700 text-base sm:text-lg flex items-center gap-3"
                >
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" /> Custom URL Slug
                </label>
                <ToggleSwitch
                  checked={settings.enableCustomSlug}
                  onChange={(val) => updateSettings({ enableCustomSlug: val })}
                  labelId="custom-slug-label"
                />
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Use a memorable, human-readable URL instead of the default ID.
              </p>

              {settings.enableCustomSlug && (
                <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-4 animate-in fade-in duration-500">
                  <label className="block text-sm font-bold text-slate-700">
                    Set Custom Slug
                  </label>

                  {/* Fixed Input Container */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Simple input without URL prefix */}
                    <div className="flex-1">
                      <input
                        type="text"
                        value={settings.customSlug ?? ""}
                        onChange={handleSlugChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm transition-all duration-200 shadow-sm font-medium"
                        placeholder="my-special-event"
                      />
                      <div className="mt-1 text-xs text-slate-500 break-all">
                        Full URL: {appOrigin}
                        {BASE_FORM_PATH}
                        {settings.customSlug}
                      </div>
                    </div>

                    {/* Auto-Generate Button */}
                    <button
                      onClick={generateSlugFromTitle}
                      className="px-3 sm:px-4 py-2 sm:py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-900 text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 flex-shrink-0 whitespace-nowrap"
                    >
                      <Target className="w-4 h-4" />
                      <span className="hidden sm:inline">Auto-Generate</span>
                      <span className="sm:hidden">Auto</span>
                    </button>
                  </div>

                  {settings.customSlug && (
                    <div
                      className={`text-sm font-semibold flex items-center gap-2 ${
                        slugStatus.available === true
                          ? "text-green-600"
                          : slugStatus.available === false
                          ? "text-red-600"
                          : "text-purple-600"
                      }`}
                    >
                      {slugStatus.checking ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : null}
                      {slugStatus.message}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Community Links Section */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <label
                  id="show-groups-label"
                  className="font-semibold text-slate-700 text-base sm:text-lg flex items-center gap-3"
                >
                  <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" /> Community
                  Links
                </label>
                <ToggleSwitch
                  checked={settings.showGroupLinks}
                  onChange={(val) => updateSettings({ showGroupLinks: val })}
                  labelId="show-groups-label"
                />
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Show links to community groups on the form completion page.
              </p>

              {settings.showGroupLinks && (
                <div className="p-4 sm:p-5 bg-gradient-to-br from-purple-50 to-indigo-50/70 rounded-2xl border-2 border-purple-200 space-y-4 animate-in fade-in duration-500">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />{" "}
                      WhatsApp Group
                    </label>
                    <input
                      type="text"
                      value={settings.whatsappGroupLink}
                      onChange={(e) =>
                        updateSettings({ whatsappGroupLink: e.target.value })
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm transition-all duration-200 shadow-sm"
                      placeholder="chat.whatsapp.com/invitecode"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" /> Arratai
                      Group
                    </label>
                    <input
                      type="text"
                      value={settings.arrataiGroupLink}
                      onChange={(e) =>
                        updateSettings({ arrataiGroupLink: e.target.value })
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm transition-all duration-200 shadow-sm"
                      placeholder="arratai-group.com/join"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Action Section */}
          <section className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-white to-purple-50/30 rounded-3xl border-2 border-purple-200 shadow-2xl">
            <div className="text-center mb-6">
              <h4 className="font-bold text-xl sm:text-2xl text-slate-800 mb-2">
                {form.status === "published"
                  ? "Form Management"
                  : "Ready to Launch?"}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600">
                {form.status === "published"
                  ? "Your form is live and collecting responses"
                  : "Publish to make your form publicly accessible"}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              {form.status === "published" ? (
                <>
                  <button
                    onClick={() => handleSaveChanges("draft")}
                    disabled={saveStatus === "loading"}
                    className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-red-300/50 disabled:opacity-50 font-bold transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-lg text-sm sm:text-base"
                  >
                    {saveStatus === "loading" ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    ) : (
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                    {saveStatus === "loading"
                      ? "Unpublishing..."
                      : "Unpublish Form"}
                  </button>
                  <button
                    onClick={() => handleSaveChanges("published")}
                    disabled={saveStatus === "loading"}
                    className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-2xl hover:shadow-2xl hover:shadow-purple-300/60 disabled:opacity-50 font-bold transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-lg text-sm sm:text-base"
                  >
                    {saveStatus === "loading" ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    ) : (
                      <CheckCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                    {saveStatus === "loading"
                      ? "Updating..."
                      : "Update Settings"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleSaveChanges("published")}
                  disabled={saveStatus === "loading"}
                  className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-2xl shadow-green-300/60 hover:shadow-3xl hover:shadow-emerald-300/70 disabled:opacity-50 text-base sm:text-lg font-bold transition-all duration-300 flex items-center justify-center gap-3 hover:scale-105"
                >
                  {saveStatus === "loading" ? (
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                  ) : (
                    <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                  {saveStatus === "loading"
                    ? "Publishing..."
                    : "Publish Form Now"}
                </button>
              )}
            </div>

            {form.status === "published" && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-50 text-green-700 rounded-xl border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-medium">
                    Live • Collecting Responses • {settings.userType === 'swayamsevak' ? 'Swayamsevak Collection' : 'Lead Collection'}
                  </span>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}