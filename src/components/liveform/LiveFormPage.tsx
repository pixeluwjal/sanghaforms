"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import LoadingState from "./LoadingState";
import FormHeader from "./FormHeader";
import FormSection from "./FormSection";
import SuccessScreen from "./SuccessScreen";
import {
  LiveFormPageProps,
  FormData,
  FormSection as FormSectionType,
  ConditionalGroupLink,
} from "./types";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentData {
  submissionId: string;
  formResponses: any;
}

export default function LiveFormPage({ slug }: LiveFormPageProps) {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    new Set()
  );
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set());
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    getValues,
    setValue,
    trigger,
  } = useForm();

  // Function to set default values for all fields
  const setDefaultValues = useCallback(
    (data: FormData) => {
      if (!data.sections) return;

      const setFieldDefaults = (fields: any[]) => {
        fields.forEach((field: any) => {
          if (field.defaultValue) {
            console.log(
              `Setting default value for ${field.id}: ${field.defaultValue}`
            );
            setValue(field.id, field.defaultValue);
          }

          if (field.nestedFields && field.nestedFields.length > 0) {
            setFieldDefaults(field.nestedFields);
          }
        });
      };

      data.sections.forEach((section: FormSectionType) => {
        if (section.fields && section.fields.length > 0) {
          setFieldDefaults(section.fields);
        }
      });
    },
    [setValue]
  );

  // Function to get conditional group link based on form responses
  const getConditionalGroupLink = useCallback(
    (formResponses: any, currentFormData: FormData | null) => {
      if (
        !currentFormData?.settings?.conditionalGroupLinks ||
        !currentFormData.settings.enableConditionalLinks
      ) {
        console.log(
          "❌ Conditional links not enabled or no conditional links found"
        );
        return null;
      }

      console.log("🔍 Checking conditional group links...");
      console.log("Form responses:", formResponses);
      console.log(
        "Conditional links:",
        currentFormData.settings.conditionalGroupLinks
      );

      // Find the first matching condition
      const matchingLink = currentFormData.settings.conditionalGroupLinks.find(
        (link: ConditionalGroupLink) => {
          const fieldValue = formResponses[link.fieldId];
          console.log(
            `Checking condition: field ${link.fieldId} = ${fieldValue}, expected: ${link.fieldValue}`
          );

          const matches = fieldValue === link.fieldValue;
          console.log(`Condition matches: ${matches}`);

          return matches;
        }
      );

      if (matchingLink) {
        console.log("✅ Found matching conditional link:", matchingLink);
        return {
          platform: matchingLink.platform,
          url: matchingLink.groupLink,
        };
      }

      console.log("❌ No matching conditional link found");
      return null;
    },
    []
  );

  // Function to check if user opted in to platform
  const getUserPlatformOptin = useCallback(
    (formResponses: any, currentFormData: FormData | null) => {
      if (!currentFormData?.sections)
        return { whatsappOptin: false, arrataiOptin: false };

      let whatsappOptin = false;
      let arrataiOptin = false;

      currentFormData.sections.forEach((section: FormSectionType) => {
        section.fields?.forEach((field: any) => {
          const responseValue = formResponses[field.id];

          if (field.type === "whatsapp_optin" && responseValue === "true") {
            whatsappOptin = true;
            console.log(`✅ User opted in to WhatsApp via field: ${field.id}`);
          }

          if (field.type === "arratai_optin" && responseValue === "true") {
            arrataiOptin = true;
            console.log(`✅ User opted in to Arratai via field: ${field.id}`);
          }
        });
      });

      console.log("User platform opt-ins:", { whatsappOptin, arrataiOptin });
      return { whatsappOptin, arrataiOptin };
    },
    []
  );

  // Function to determine redirect URL
  const getRedirectUrl = useCallback(
    (formResponses: any) => {
      console.log("🎯 Determining redirect URL...");
      console.log("Current formData:", formData);

      if (!formData) {
        console.log("❌ formData is null");
        return null;
      }

      // 1. First check conditional group links (highest priority)
      const conditionalLink = getConditionalGroupLink(formResponses, formData);
      if (conditionalLink && conditionalLink.url) {
        console.log("🎯 Using conditional group link:", conditionalLink);
        return conditionalLink.url;
      }

      // 2. Check user opt-ins and default links
      const { whatsappOptin, arrataiOptin } = getUserPlatformOptin(
        formResponses,
        formData
      );
      const settings = formData.settings;

      console.log("Platform settings:", {
        whatsappOptin,
        arrataiOptin,
        whatsappLink: settings?.whatsappGroupLink,
        arrataiLink: settings?.arrataiGroupLink,
      });

      if (whatsappOptin && settings?.whatsappGroupLink) {
        console.log("📱 Redirecting to default WhatsApp group");
        return settings.whatsappGroupLink;
      }

      if (arrataiOptin && settings?.arrataiGroupLink) {
        console.log("👥 Redirecting to default Arratai group");
        return settings.arrataiGroupLink;
      }

      console.log("❌ No redirect URL found");
      return null;
    },
    [formData, getConditionalGroupLink, getUserPlatformOptin]
  );

  // Function to extract customer details from form responses
  const getCustomerDetails = useCallback((formResponses: any) => {
    console.log("🔍 Extracting customer details from form responses:", formResponses);
    
    // Common name field variations
    const nameFields = ['name', 'fullname', 'fullName', 'firstName', 'first_name', 'customerName'];
    const emailFields = ['email', 'emailAddress', 'email_address'];
    const phoneFields = ['phone', 'mobile', 'phoneNumber', 'phone_number', 'mobileNumber', 'contact'];
    
    let customerName = "Customer";
    let customerEmail = "";
    let customerContact = "";

    // Find name from form responses
    for (const field of nameFields) {
      if (formResponses[field] && formResponses[field].trim()) {
        customerName = formResponses[field].trim();
        console.log(`✅ Found customer name from field '${field}': ${customerName}`);
        break;
      }
    }

    // Find email from form responses
    for (const field of emailFields) {
      if (formResponses[field] && formResponses[field].trim()) {
        customerEmail = formResponses[field].trim();
        console.log(`✅ Found customer email from field '${field}': ${customerEmail}`);
        break;
      }
    }

    // Find phone from form responses
    for (const field of phoneFields) {
      if (formResponses[field] && formResponses[field].trim()) {
        customerContact = formResponses[field].trim();
        console.log(`✅ Found customer contact from field '${field}': ${customerContact}`);
        break;
      }
    }

    // If no specific name fields found, try to find any field that might contain a name
    if (customerName === "Customer") {
      for (const [field, value] of Object.entries(formResponses)) {
        if (typeof value === 'string' && value.trim() && 
            (field.toLowerCase().includes('name') || 
             field.toLowerCase().includes('first') || 
             field.toLowerCase().includes('last'))) {
          customerName = value.trim();
          console.log(`✅ Found customer name from generic field '${field}': ${customerName}`);
          break;
        }
      }
    }

    console.log("🎯 Final customer details:", {
      name: customerName,
      email: customerEmail,
      contact: customerContact
    });

    return {
      name: customerName,
      email: customerEmail,
      contact: customerContact
    };
  }, []);

  // Update document head with form title and favicon
  useEffect(() => {
    if (formData) {
      const pageTitle =
        formData.settings?.pageTitle || formData.title || "Form";
      document.title = pageTitle;

      if (formData.images?.favicon) {
        let link = document.querySelector(
          "link[rel*='icon']"
        ) as HTMLLinkElement;
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.href = formData.images.favicon;
      }
    }
  }, [formData]);

  // Fetch form data with payment settings
  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/forms/${slug}/details`);
        if (!response.ok) throw new Error("Form not found");
        const data = await response.json();
        console.log("Fetched form data with PAYMENT:", data);
        console.log("Payment settings:", {
          acceptPayments: data.settings?.acceptPayments,
          paymentAmount: data.settings?.paymentAmount,
          paymentCurrency: data.settings?.paymentCurrency,
        });
        console.log(
          "Conditional links in form data:",
          data.settings?.conditionalGroupLinks
        );
        console.log(
          "Enable conditional links:",
          data.settings?.enableConditionalLinks
        );
        setFormData(data);

        setDefaultValues(data);

        const initialSections = new Set(
          data.sections?.map((section: FormSectionType) => section.id) || []
        );
        const initialFields = new Set();
        data.sections?.forEach((section: FormSectionType) => {
          section.fields?.forEach((field: any) => {
            initialFields.add(field.id);
            if (field.nestedFields) {
              field.nestedFields.forEach((nestedField: any) => {
                initialFields.add(nestedField.id);
              });
            }
          });
        });
        setVisibleSections(initialSections);
        setVisibleFields(initialFields);
      } catch (error) {
        console.error("Error fetching form:", error);
        setSubmitStatus("error");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [slug, setDefaultValues]);

  // CONDITIONAL LOGIC - COMPLETELY INTACT
  const evaluateConditionalLogic = useCallback(() => {
    if (!formData || !formData.sections) return;

    const evaluateCondition = (rule: any, currentValues: any) => {
      console.log("Evaluating rule:", rule);

      let targetFieldId = rule.targetField;

      if (!targetFieldId) {
        formData.sections?.forEach((section: FormSectionType) => {
          section.fields?.forEach((field: any) => {
            if (field.options && field.options.includes(rule.value)) {
              targetFieldId = field.id;
              console.log(
                `Inferred target field: ${targetFieldId} for value: ${rule.value}`
              );
            }
          });
        });
      }

      if (!targetFieldId) {
        console.log("Could not determine target field for rule:", rule);
        return false;
      }

      const targetValue = currentValues[targetFieldId];

      console.log(
        `Evaluating condition: ${targetFieldId} = ${targetValue}, operator: ${rule.operator}, value: ${rule.value}`
      );

      if (targetValue === undefined || targetValue === null) {
        console.log(
          `Target value is undefined/null for field ${targetFieldId}`
        );
        return false;
      }

      if (Array.isArray(targetValue)) {
        const checkboxValue = targetValue.find((val) => val === rule.value);
        switch (rule.operator) {
          case "equals":
            return checkboxValue !== undefined;
          case "not_equals":
            return checkboxValue === undefined;
          default:
            return false;
        }
      }

      switch (rule.operator) {
        case "equals":
          const equalsResult = String(targetValue) === String(rule.value);
          console.log(
            `Equals check: ${targetValue} === ${rule.value} = ${equalsResult}`
          );
          return equalsResult;
        case "not_equals":
          return String(targetValue) !== String(rule.value);
        case "contains":
          return String(targetValue).includes(String(rule.value));
        case "greater_than":
          return Number(targetValue) > Number(rule.value);
        case "less_than":
          return Number(targetValue) < Number(rule.value);
        default:
          console.log(`Unknown operator: ${rule.operator}`);
          return false;
      }
    };

    const currentValues = getValues();
    console.log("=== CURRENT FORM VALUES ===", currentValues);

    const newVisibleSections = new Set();
    const newVisibleFields = new Set();

    const evaluateFieldVisibility = (field: any, currentValues: any) => {
      let shouldShowField = true;

      if (field.conditionalRules && field.conditionalRules.length > 0) {
        shouldShowField = field.conditionalRules.every((rule) =>
          evaluateCondition(rule, currentValues)
        );
        console.log(
          `Field ${field.id} should show:`,
          shouldShowField,
          "rules:",
          field.conditionalRules
        );
      }

      return shouldShowField;
    };

    const processFieldsRecursively = (fields: any[], currentValues: any) => {
      fields.forEach((field: any) => {
        if (evaluateFieldVisibility(field, currentValues)) {
          newVisibleFields.add(field.id);
          console.log(`✅ Adding field to visible: ${field.id}`);

          if (field.nestedFields && field.nestedFields.length > 0) {
            processFieldsRecursively(field.nestedFields, currentValues);
          }
        } else {
          console.log(`❌ Hiding field: ${field.id}`);
        }
      });
    };

    const sectionsWithIndices = formData.sections.map((section, index) => ({
      ...section,
      originalIndex: index,
    }));

    const sortedSections = [...sectionsWithIndices].sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.originalIndex - b.originalIndex;
    });

    console.log(
      "Sorted sections:",
      sortedSections.map((s) => ({
        title: s.title,
        order: s.order,
        originalIndex: s.originalIndex,
      }))
    );

    sortedSections.forEach(
      (section: FormSectionType & { originalIndex: number }) => {
        let shouldShowSection = true;

        if (section.conditionalRules && section.conditionalRules.length > 0) {
          console.log(`=== EVALUATING SECTION: ${section.title} ===`);
          console.log("Section conditional rules:", section.conditionalRules);

          shouldShowSection = section.conditionalRules.every((rule) => {
            const conditionMet = evaluateCondition(rule, currentValues);
            console.log(
              `Section ${section.title} condition result: ${conditionMet}`
            );
            return conditionMet;
          });

          console.log(
            `Section ${section.title} final visibility: ${shouldShowSection}`
          );
        }

        if (shouldShowSection) {
          newVisibleSections.add(section.id);
          console.log(`✅ Showing section: ${section.title}`);

          if (section.fields && section.fields.length > 0) {
            processFieldsRecursively(section.fields, currentValues);
          }
        } else {
          console.log(`❌ Hiding section: ${section.title}`);
        }
      }
    );

    console.log(
      "=== FINAL VISIBLE SECTIONS ===",
      Array.from(newVisibleSections)
    );
    console.log("=== FINAL VISIBLE FIELDS ===", Array.from(newVisibleFields));

    setVisibleSections(newVisibleSections);
    setVisibleFields(newVisibleFields);
  }, [formData, getValues]);

  // Watch form changes and evaluate conditions
  useEffect(() => {
    const subscription = watch(() => {
      evaluateConditionalLogic();
    });
    return () => subscription.unsubscribe();
  }, [watch, evaluateConditionalLogic]);

  // Initial evaluation
  useEffect(() => {
    if (formData) {
      evaluateConditionalLogic();
    }
  }, [formData, evaluateConditionalLogic]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setValue(fieldId, value, { shouldValidate: true });
    setTimeout(() => {
      evaluateConditionalLogic();
    }, 50);
  };

  // Handle redirect after success screen is shown
  useEffect(() => {
    if (submitStatus === "success" && redirectUrl) {
      console.log("🔄 Success screen shown, preparing to redirect...");

      // Redirect after a short delay to show success message
      const redirectTimer = setTimeout(() => {
        console.log("🚀 REDIRECTING TO:", redirectUrl);
        window.location.href = redirectUrl;
      }, 2000); // 2 seconds delay to show success message

      return () => clearTimeout(redirectTimer);
    }
  }, [submitStatus, redirectUrl]);

  // Function to initiate payment - UPDATED FOR UPI ONLY
// Function to initiate payment - UPDATED FOR UPI ONLY
const onSubmit = async (data: any) => {
  try {
    setSubmitting(true);
    
    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('📋 Form slug from props:', slug);
    console.log('📦 Form data state:', formData);
    console.log('🔗 Form customLink:', formData?.customLink);

    const responses = Object.entries(data)
      .filter(([key]) => key !== 'responses')
      .map(([fieldId, value]) => ({
        fieldId,
        value: value === undefined ? '' : value
      }));

    console.log('📤 Submitting responses:', responses);

    const submissionData = {
      responses,
      submittedAt: new Date().toISOString()
    };

    // ✅ CORRECTED: Use the same endpoint as your API route
    console.log('🎯 Making API call to:', `/api/forms/${slug}`);
    
    const response = await fetch(`/api/forms/${slug}`, { // Remove "/submit"
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData),
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);

    // Get the raw response text first
    const responseText = await response.text();
    console.log('📥 Raw response text:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
      console.log('✅ Parsed response:', result);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      throw new Error('Invalid response from server');
    }

    if (!response.ok) {
      console.error('❌ Form submission failed:', result);
      throw new Error(result.error || `Submission failed with status: ${response.status}`);
    }

    console.log('✅ Form submission result:', result);

    // Check if we got a submission ID - note the API returns "responseId"
    const submissionId = result.responseId; // Your API returns "responseId"
    if (!submissionId) {
      console.error('❌ No submission ID in response:', result);
      throw new Error('Submission failed - no submission ID received');
    }

    console.log('🎯 Using submission ID:', submissionId);

    // Check if form requires payment
    const requiresPayment = formData?.settings?.acceptPayments &&
                           formData?.settings?.paymentAmount &&
                           formData.settings.paymentAmount > 0;

    if (requiresPayment) {
      console.log('💰 Payment required, initiating UPI payment flow...');
      await initiateUPIPayment(submissionId, data);
    } else {
      console.log('📄 No payment required, proceeding with success flow');
      
      // Handle conditional group links based on API response
      if (result.groupLinks && result.groupLinks.showGroupLinks) {
        console.log('🔗 Showing group links:', result.groupLinks);
        // You can set state to show group links to user
        setGroupLinks(result.groupLinks);
      }

      // Handle opt-ins
      if (result.optIns) {
        console.log('📱 Opt-ins:', result.optIns);
        // You can handle opt-in specific logic here
      }

      const calculatedRedirectUrl = getRedirectUrl(data);
      console.log('Final Redirect URL:', calculatedRedirectUrl);

      if (calculatedRedirectUrl) {
        setRedirectUrl(calculatedRedirectUrl);
        setSubmitStatus('success');
      } else {
        setSubmitStatus('success');
      }
    }
  } catch (error) {
    console.error('❌ Error submitting form:', error);
    setSubmitStatus('error');
  } finally {
    setSubmitting(false);
  }
};
  // Function to initiate UPI-only payment - FIXED SYNTAX
  const initiateUPIPayment = async (
    submissionId: string,
    formResponses: any
  ) => {
    try {
      console.log("💰 Initiating payment for submission:", submissionId);

      // Extract customer details from form responses
      const customerDetails = getCustomerDetails(formResponses);
      
      console.log("🎯 Using customer details for payment:", customerDetails);

      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formId: formData?._id,
          submissionId: submissionId,
          amount: formData?.settings?.paymentAmount || 0,
          currency: "INR",
          customerDetails: {
            name: customerDetails.name,
            email: customerDetails.email,
            contact: customerDetails.contact,
          },
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("❌ Payment order creation failed:", responseData);
        throw new Error(responseData.error || "Failed to create payment order");
      }

      const orderData = responseData;
      console.log("📦 Payment order created:", orderData);

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
      }

      // Wait for Razorpay to load
      await new Promise((resolve, reject) => {
        const checkRazorpay = () => {
          if (window.Razorpay) {
            resolve(true);
          } else {
            setTimeout(checkRazorpay, 100);
          }
        };

        setTimeout(() => {
          reject(new Error("Razorpay script loading timeout"));
        }, 10000);

        checkRazorpay();
      });

      // ✅ SIMPLE CONFIG - NO RESTRICTIONS, USE ALL AVAILABLE METHODS
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderData.amount,
        currency: orderData.currency,
        name: formData?.settings?.pageTitle || formData?.title || "Form Payment",
        description: `Payment for ${formData?.title}`,
        order_id: orderData.id,

        // ✅ PREFILL CUSTOMER DETAILS FROM FORM RESPONSES
        prefill: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.contact,
        },

        theme: {
          color: formData?.theme?.primaryColor || "#7C3AED",
        },

        // ✅ PAYMENT SUCCESS HANDLER
        handler: async function (response: any) {
          console.log("✅ Payment successful:", response);

          // Verify payment on server
          const verifyResponse = await fetch("/api/payments/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              submissionId: submissionId,
            }),
          });

          const verificationResult = await verifyResponse.json();

          if (verificationResult.success) {
            console.log("✅ Payment verified successfully");
            handlePaymentSuccess(submissionId, formResponses, response, customerDetails);
          } else {
            console.error("❌ Payment verification failed");
            handlePaymentFailure(
              submissionId,
              formResponses,
              "Verification failed",
              customerDetails
            );
          }
        },

        // ✅ MODAL CONFIG
        modal: {
          ondismiss: function () {
            console.log("❌ Payment modal closed by user");
            handlePaymentFailure(
              submissionId,
              formResponses,
              "Payment cancelled by user",
              customerDetails
            );
          },
          escape: true,
          handleback: true,
        },
      };

      const razorpay = new window.Razorpay(options);
      
      // ✅ PAYMENT FAILED HANDLER
      razorpay.on("payment.failed", function (response: any) {
        console.error("❌ Payment failed:", response.error);
        handlePaymentFailure(
          submissionId,
          formResponses,
          response.error.description || "Payment failed",
          customerDetails
        );
      });

      razorpay.open();
    } catch (error) {
      console.error("❌ Error initiating payment:", error);
      handlePaymentFailure(
        submissionId,
        formResponses,
        error.message || "Payment initiation failed",
        getCustomerDetails(formResponses)
      );
    }
  };

  // Handle payment success
  const handlePaymentSuccess = (
    submissionId: string,
    formResponses: any,
    paymentResponse: any,
    customerDetails: any
  ) => {
    console.log("🎉 UPI Payment successful, proceeding with success flow");

    // Update payment status in database with actual customer details
    fetch("/api/payments/update-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        submissionId,
        status: "success",
        paymentId: paymentResponse.razorpay_payment_id,
        orderId: paymentResponse.razorpay_order_id,
        paymentMethod: "upi",
        customerDetails: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.contact,
        }
      }),
    });

    // Get redirect URL and proceed
    const calculatedRedirectUrl = getRedirectUrl(formResponses);
    console.log("Final Redirect URL after UPI payment:", calculatedRedirectUrl);

    if (calculatedRedirectUrl) {
      setRedirectUrl(calculatedRedirectUrl);
      setSubmitStatus("success");
    } else {
      setSubmitStatus("success");
    }
  };

  // Handle payment failure
  const handlePaymentFailure = (
    submissionId: string,
    formResponses: any,
    error: string,
    customerDetails: any
  ) => {
    console.error("💥 UPI Payment failed:", error);

    // Update payment status in database with actual customer details
    fetch("/api/payments/update-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        submissionId,
        status: "failed",
        error: error,
        paymentMethod: "upi",
        customerDetails: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.contact,
        }
      }),
    });

    // Even if payment fails, proceed with WhatsApp group joining
    const calculatedRedirectUrl = getRedirectUrl(formResponses);
    console.log(
      "Redirect URL after UPI payment failure:",
      calculatedRedirectUrl
    );

    if (calculatedRedirectUrl) {
      setRedirectUrl(calculatedRedirectUrl);
      setSubmitStatus("success");
    } else {
      setSubmitStatus("success");
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-6 animate-bounce">📝</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Form Not Found
          </h1>
          <p className="text-gray-600 text-lg">
            The form you're looking for doesn't exist or is no longer available.
          </p>
        </div>
      </div>
    );
  }

  if (submitStatus === "success") {
    return <SuccessScreen formData={formData} redirectUrl={redirectUrl} />;
  }

  // Create properly sorted sections for rendering
  const getSortedVisibleSections = () => {
    if (!formData?.sections) return [];

    const sectionsWithIndices = formData.sections.map((section, index) => ({
      ...section,
      originalIndex: index,
    }));

    const visibleSectionsWithIndices = sectionsWithIndices.filter((section) =>
      visibleSections.has(section.id)
    );

    return visibleSectionsWithIndices.sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.originalIndex - b.originalIndex;
    });
  };

  const sortedVisibleSections = getSortedVisibleSections();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <FormHeader formData={formData} />

        {/* UPI Payment Info Banner */}
        {formData.settings?.acceptPayments &&
          formData.settings?.paymentAmount &&
          formData.settings.paymentAmount > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl shadow-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 text-lg">💳</span>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800">
                    UPI Payment Required
                  </h3>
                  <p className="text-blue-700 text-sm">
                    This form requires a UPI payment of{" "}
                    <strong>₹{formData.settings.paymentAmount}</strong> to be
                    submitted. Only UPI payment methods are accepted.
                  </p>
                </div>
              </div>
            </div>
          )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white/90 backdrop-blur-lg p-8 sm:p-10 shadow-2xl rounded-3xl border border-white/20 relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-orange-200/40 to-amber-200/40 rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tr from-amber-200/40 to-yellow-200/40 rounded-full translate-x-20 translate-y-20"></div>

          <div className="relative z-10">
            {sortedVisibleSections.map((section: FormSectionType, index) => (
              <div
                key={section.id}
                className="mb-10 last:mb-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <FormSection
                  section={section}
                  register={register}
                  errors={errors}
                  getValues={getValues}
                  setValue={setValue}
                  handleFieldChange={handleFieldChange}
                  visibleFields={visibleFields}
                  formData={formData}
                />
              </div>
            ))}

            {submitStatus === "error" && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/60 text-red-700 rounded-2xl flex items-start animate-shake shadow-lg">
                <span className="mr-3 flex-shrink-0 mt-0.5 text-xl">⚠️</span>
                <div>
                  <p className="font-semibold">Submission Error</p>
                  <p className="text-sm mt-1 opacity-90">
                    Please try again or contact support if the problem persists.
                  </p>
                </div>
              </div>
            )}

            {/* Submit button with proper spacing */}
            <div className="mt-10 pt-8 border-t border-orange-200/50">
              <button
                type="submit"
                disabled={submitting}
                className="w-full text-lg py-5 px-6 bg-gradient-to-r from-[#FF8100] to-amber-500 hover:from-[#E67300] hover:to-amber-600 text-white font-bold rounded-2xl shadow-2xl shadow-orange-500/40 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-orange-500/30 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                <span className="relative flex items-center justify-center">
                  {submitting ? (
                    <>
                      <span className="animate-spin mr-3 text-xl">⟳</span>
                      <span className="animate-pulse">Processing...</span>
                    </>
                  ) : (
                    <>
                      <span className="mr-3 text-xl group-hover:scale-110 transition-transform"></span>
                      {formData.settings?.acceptPayments &&
                      formData.settings?.paymentAmount
                        ? `Pay ₹${formData.settings.paymentAmount} via UPI`
                        : "Submit Form"}
                    </>
                  )}
                </span>
              </button>

              {/* Progress indicator */}
              {submitting && (
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-[#FF8100] to-amber-500 h-2 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Your information is secure and encrypted</p>
        </div>
      </div>
      <GlobalStyles />
    </div>
  );
}

// GlobalStyles function
function GlobalStyles() {
  return (
    <style jsx global>{`
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes fade-in-up {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes shake {
        0%,
        100% {
          transform: translateX(0);
        }
        10%,
        30%,
        50%,
        70%,
        90% {
          transform: translateX(-5px);
        }
        20%,
        40%,
        60%,
        80% {
          transform: translateX(5px);
        }
      }
      @keyframes bounce-in {
        0% {
          transform: scale(0.5);
          opacity: 0;
        }
        60% {
          transform: scale(1.2);
          opacity: 1;
        }
        100% {
          transform: scale(1);
        }
      }
      @keyframes float {
        0%,
        100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
      }
      @keyframes glow {
        0%,
        100% {
          box-shadow: 0 0 20px rgba(255, 129, 0, 0.3);
        }
        50% {
          box-shadow: 0 0 30px rgba(255, 129, 0, 0.6);
        }
      }

      .animate-fade-in-up {
        animation: fade-in-up 0.6s ease-out forwards;
        opacity: 0;
      }
      .animate-shake {
        animation: shake 0.5s ease-in-out;
      }
      .animate-bounce-in {
        animation: bounce-in 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
      }
      .animate-float {
        animation: float 3s ease-in-out infinite;
      }
      .animate-glow {
        animation: glow 2s ease-in-out infinite;
      }

      /* Smooth scrolling */
      html {
        scroll-behavior: smooth;
      }

      /* Custom scrollbar with orange theme */
      ::-webkit-scrollbar {
        width: 6px;
      }
      ::-webkit-scrollbar-track {
        background: #fef3c7;
      }
      ::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, #ff8100, #f59e0b);
        border-radius: 10px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(to bottom, #e67300, #d97706);
      }

      /* Remove number input spinners */
      input[type="number"]::-webkit-outer-spin-button,
      input[type="number"]::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      input[type="number"] {
        -moz-appearance: textfield;
      }

      /* Focus styles with orange theme */
      input:focus,
      select:focus,
      textarea:focus {
        outline: none;
        ring: 2px;
        ring-color: #ff8100;
        ring-opacity: 0.5;
      }

      /* Smooth transitions for all interactive elements */
      * {
        transition: all 0.2s ease-in-out;
      }

      /* Custom orange theme for various elements */
      .orange-gradient-text {
        background: linear-gradient(135deg, #ff8100, #f59e0b);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .orange-glow {
        box-shadow: 0 0 20px rgba(255, 129, 0, 0.3);
      }

      .orange-glow:hover {
        box-shadow: 0 0 30px rgba(255, 129, 0, 0.5);
    `}</style>
  );
}