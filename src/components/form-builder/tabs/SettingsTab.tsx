'use client';

import { useState, useEffect, useCallback } from "react";
import { Settings, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { debounce } from "lodash";

// Types

// Components
import StatusIndicator from "../settings/StatusIndicator";
import FormDetailsEditor from "../settings/FormDetailsEditor";
import PageBrandingSection from "../settings/PageBrandingSection";
import DataCollectionSection from "../settings/DataCollectionSection";
import DefaultSourceSection from "../settings//DefaultSourceSection";
import StatusBanner from "../settings/StatusBanner";
import ThemeCustomization from "../settings/ThemeCustomization";
import FormFeatures from "../settings/FormFeatures";
import FormAccessSection from "../settings/FormAccessSection";
import ActionSection from "../settings/ActionSection";

// Constants
const BASE_FORM_PATH = "/forms/";

interface SettingsTabProps {
  form: Form;
  onUpdate: (updates: Partial<Form>) => void;
}

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
    defaultSource: "",
    pageTitle: form.title || ""
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
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");
  
  // State for sources
  const [sources, setSources] = useState<Source[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(true);

  const appOrigin = typeof window !== "undefined" ? window.location.origin : "";

  // Fetch sources on component mount
  useEffect(() => {
    const fetchSources = async () => {
      try {
        setSourcesLoading(true);
        const response = await fetch('/api/admin/sources');
        
        if (!response.ok) {
          throw new Error('Failed to fetch sources');
        }
        
        const data = await response.json();
        setSources(data);
      } catch (error) {
        console.error('Error fetching sources:', error);
        toast.error('Failed to load sources');
      } finally {
        setSourcesLoading(false);
      }
    };

    fetchSources();
  }, []);

  // Real slug availability check
  const debouncedCheckSlug = useCallback(
    debounce(async (slug: string) => {
      if (!slug) {
        setSlugStatus({ checking: false, available: null, message: "" });
        return;
      }

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

  const handlePageTitleUpdate = (pageTitle: string) => {
    updateSettings({ pageTitle });
  };

  const handleImagesUpdate = (images: any) => {
    onUpdate({ images });
  };

  const handleSaveChanges = async (newStatus: "published" | "draft") => {
    console.log("🚀 PUBLISH BUTTON CLICKED!", {
      newStatus,
      currentStatus: form.status,
      collectionType: settings.userType,
      defaultSource: settings.defaultSource,
      pageTitle: settings.pageTitle,
      hasFavicon: !!form.images?.favicon,
      images: form.images
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
      title: form.title,
      form_name12: form.form_name12,
      description: form.description,
      settings: {
        ...settings,
        isActive: newStatus === "published",
        customSlug: settings.enableCustomSlug ? settings.customSlug : undefined,
      },
      theme: theme,
      images: form.images || {}
    };

    console.log("📦 Sending payload with images:", payload.images);

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

      // Update parent component with the returned form data
      onUpdate({
        status: newStatus,
        settings: data.form?.settings || payload.settings,
        theme: data.form?.theme || payload.theme,
        form_name12: data.form?.form_name12 || payload.form_name12,
        images: data.form?.images || payload.images
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

  const currentSlug = settings.enableCustomSlug && settings.customSlug
    ? settings.customSlug
    : form._id;

  const currentFormUrl = `${appOrigin}${BASE_FORM_PATH}${currentSlug}`;

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

      {/* Page Branding Section */}
      <PageBrandingSection 
        form={form}
        settings={settings}
        onImagesUpdate={handleImagesUpdate}
        onPageTitleUpdate={handlePageTitleUpdate}
      />

      {/* Collection Type Section */}
      <DataCollectionSection 
        settings={settings}
        onUpdate={updateSettings}
      />

      {/* Default Source Section */}
      <DefaultSourceSection 
        settings={settings}
        onUpdate={updateSettings}
        sources={sources}
        loading={sourcesLoading}
      />

      {/* Status Banner */}
      <StatusBanner 
        form={form}
        settings={settings}
        currentFormUrl={currentFormUrl}
      />

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left Column - Theme & Settings */}
        <div className="space-y-6 lg:space-y-8">
          <ThemeCustomization 
            theme={theme}
            onUpdate={updateTheme}
          />
          
          <FormFeatures 
            settings={settings}
            onUpdate={updateSettings}
          />
        </div>

        {/* Right Column - URL & Actions */}
        <div className="space-y-6 lg:space-y-8">
          <FormAccessSection 
            settings={settings}
            form={form}
            appOrigin={appOrigin}
            baseFormPath={BASE_FORM_PATH}
            slugStatus={slugStatus}
            onUpdate={updateSettings}
            onSlugCheck={debouncedCheckSlug}
          />
          
          <ActionSection 
            form={form}
            saveStatus={saveStatus}
            onSaveChanges={handleSaveChanges}
            settings={settings}
          />
        </div>
      </div>
    </div>
  );
}