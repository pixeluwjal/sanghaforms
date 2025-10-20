"use client";

import { useState, useEffect } from "react";
import { Loader2, ChevronDown } from "lucide-react";

interface Ghata {
  _id: string;
  name: string;
}

interface Milan {
  _id: string;
  name: string;
  ghatas: Ghata[];
}

interface Valay {
  _id: string;
  name: string;
  milans: Milan[];
}

interface Khanda {
  _id: string;
  name: string;
  code: string;
  valays: Valay[];
}

interface Organization {
  _id: string;
  name: string;
  khandas: Khanda[];
}

interface Field {
  id: string;
  label: string;
  required?: boolean;
}

interface SanghaHierarchyFieldProps {
  field: Field;
  onFieldChange: (fieldId: string, value: string) => void;
}

export const SanghaHierarchyField: React.FC<SanghaHierarchyFieldProps> = ({
  field,
  onFieldChange,
}) => {
  const primaryColor = "#ea6221";

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for user selections
  const [khandaId, setKhandaId] = useState("");
  const [valayaId, setValayaId] = useState("");
  const [milanId, setMilanId] = useState("");
  const [ghataId, setGhataId] = useState("");

  useEffect(() => {
    const loadOrganizationData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/organization');
        const data = await response.json();
        
        if (data.success && data.organizations && data.organizations.length > 0) {
          setOrganization(data.organizations[0]);
        } else {
          setError("No organization data found");
        }
      } catch (err) {
        setError("Failed to load organization data");
        console.error("Error loading organization data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrganizationData();
  }, []);

  // Derived states for dropdown options
  const availableKhandas = organization?.khandas || [];
  const selectedKhanda = availableKhandas.find(k => k._id === khandaId);
  const availableValayas = selectedKhanda?.valays || [];
  const selectedValaya = availableValayas.find(v => v._id === valayaId);
  const availableMilans = selectedValaya?.milans || [];
  const selectedMilan = availableMilans.find(m => m._id === milanId);
  const availableGhatas = selectedMilan?.ghatas || [];

  // Handlers
  const handleKhandaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setKhandaId(value);
    setValayaId("");
    setMilanId("");
    setGhataId("");
    onFieldChange(`${field.id}-khanda`, value);
  };

  const handleValayaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setValayaId(value);
    setMilanId("");
    setGhataId("");
    onFieldChange(`${field.id}-valaya`, value);
  };

  const handleMilanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setMilanId(value);
    setGhataId("");
    onFieldChange(`${field.id}-milan`, value);
  };

  const handleGhataChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setGhataId(value);
    onFieldChange(`${field.id}-ghata`, value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 rounded-lg border border-gray-200">
        <Loader2 className="w-5 h-5 animate-spin mr-2" style={{ color: primaryColor }} />
        <p className="text-sm font-medium" style={{ color: primaryColor }}>
          Loading hierarchy...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 text-sm font-medium">{error}</p>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700 text-sm">No organization data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Khanda Selection */}
      <div className="relative">
        <label className="block text-sm font-medium mb-2" style={{ color: primaryColor }}>
          Khanda {field.required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={khandaId}
          onChange={handleKhandaChange}
          required={field.required}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-base focus:ring-2 focus:ring-offset-1 appearance-none cursor-pointer"
          style={{
            borderColor: khandaId ? primaryColor : '#D1D5DB',
            focusBorderColor: primaryColor,
            focusRingColor: `${primaryColor}40`,
          }}
        >
          <option value="">Select Khanda</option>
          {availableKhandas.map((khanda) => (
            <option key={khanda._id} value={khanda._id}>
              {khanda.name} ({khanda.code})
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" style={{ color: primaryColor }} />
      </div>

      {/* Valaya Selection */}
      <div className="relative">
        <label className="block text-sm font-medium mb-2" style={{ color: primaryColor }}>
          Valaya {field.required && availableValayas.length > 0 && <span className="text-red-500">*</span>}
        </label>
        <select
          value={valayaId}
          onChange={handleValayaChange}
          disabled={!khandaId || availableValayas.length === 0}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-base focus:ring-2 focus:ring-offset-1 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            borderColor: valayaId ? primaryColor : '#D1D5DB',
            focusBorderColor: primaryColor,
            focusRingColor: `${primaryColor}40`,
          }}
        >
          <option value="">
            {availableValayas.length === 0 ? 'No valays available' : 'Select Valaya'}
          </option>
          {availableValayas.map((valaya) => (
            <option key={valaya._id} value={valaya._id}>
              {valaya.name}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" style={{ color: primaryColor }} />
      </div>

      {/* Milan Selection */}
      <div className="relative">
        <label className="block text-sm font-medium mb-2" style={{ color: primaryColor }}>
          Milan {field.required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={milanId}
          onChange={handleMilanChange}
          disabled={!khandaId || (availableValayas.length > 0 && !valayaId) || availableMilans.length === 0}
          required={field.required}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-base focus:ring-2 focus:ring-offset-1 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            borderColor: milanId ? primaryColor : '#D1D5DB',
            focusBorderColor: primaryColor,
            focusRingColor: `${primaryColor}40`,
          }}
        >
          <option value="">
            {availableMilans.length === 0 ? 'No milans available' : 'Select Milan'}
          </option>
          {availableMilans.map((milan) => (
            <option key={milan._id} value={milan._id}>
              {milan.name}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" style={{ color: primaryColor }} />
      </div>

      {/* Ghata Selection */}
      <div className="relative">
        <label className="block text-sm font-medium mb-2" style={{ color: primaryColor }}>
          Ghata
        </label>
        <select
          value={ghataId}
          onChange={handleGhataChange}
          disabled={!milanId || availableGhatas.length === 0}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-base focus:ring-2 focus:ring-offset-1 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            borderColor: ghataId ? primaryColor : '#D1D5DB',
            focusBorderColor: primaryColor,
            focusRingColor: `${primaryColor}40`,
          }}
        >
          <option value="">
            {availableGhatas.length === 0 ? 'No ghatas available' : 'Select Ghata (Optional)'}
          </option>
          {availableGhatas.map((ghata) => (
            <option key={ghata._id} value={ghata._id}>
              {ghata.name}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" style={{ color: primaryColor }} />
      </div>
    </div>
  );
};