import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import CzechMap from "./CzechMap";

const ESTATE_TYPES = {
  byt: "Byt",
  dům: "Dům",
  pozemek: "Pozemek",
} as const;

type EstateType = keyof typeof ESTATE_TYPES;

type FormData = {
  estateType: EstateType;
  region: string;
  district: string;
  fullname: string;
  phone: string;
  email: string;
};

const LeadForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [generalError, setGeneralError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    trigger,
    clearErrors,
  } = useForm<FormData>({
    defaultValues: {
      estateType: undefined,
      region: "",
      district: "",
      fullname: "",
      phone: "",
      email: "",
    },
    mode: "onChange",
  });

  const watchedValues = watch();

  // Handle region and district selection from CzechMap
  const handleRegionDistrictChange = (region: string, district: string) => {
    setValue("region", region);
    setValue("district", district);
    if (errors.region) clearErrors("region");
    if (errors.district) clearErrors("district");
  };

  const validateStep1 = async (): Promise<boolean> => {
    const result = await trigger(["estateType", "region", "district"]);
    return result;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setValue(field, value);
    if (errors[field]) {
      clearErrors(field);
    }
  };

  const handleNextStep = async () => {
    const isValid = await validateStep1();
    if (isValid) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
    setGeneralError("");

    try {
      const response = await fetch("http://localhost:5000/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage(
          "Vaše poptávka byla úspěšně odeslána! Brzy se vám ozveme."
        );
        reset();
        setCurrentStep(1);
      } else {
        if (result.errors) {
          result.errors.forEach((error: any) => {});
        } else {
          setGeneralError(
            result.message || "Došlo k chybě při odeslání formuláře."
          );
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setGeneralError(
        "Došlo k chybě při odeslání formuláře. Zkuste to prosím znovu."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successMessage) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Děkujeme!</h2>
          <p className="text-green-700 mb-4">{successMessage}</p>
          <button
            onClick={() => setSuccessMessage("")}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Odeslat další poptávku
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-0">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-left">
          Chci nabídku
        </h1>
        <p className="text-gray-600 mb-8 text-left">
          Vyplňte formulář a my vám připravíme nabídku na míru
        </p>

        {/* Progress indicator */}
        <div className="flex mb-8">
          <div className="flex items-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold ${
                currentStep >= 1 ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              1
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">
              Nemovitost
            </span>
          </div>
          <div
            className={`flex-1 h-1 mx-4 mt-3 ${
              currentStep >= 2 ? "bg-blue-600" : "bg-gray-300"
            }`}
          ></div>
          <div className="flex items-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold ${
                currentStep >= 2 ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              2
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">
              Kontakt
            </span>
          </div>
        </div>

        {generalError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{generalError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 text-left">
                Informace o nemovitosti
              </h2>

              {/* Estate Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Vyberte typ nemovitosti
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(ESTATE_TYPES).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        handleInputChange("estateType", value as EstateType)
                      }
                      className={`p-1 border-2 rounded-lg text-center font-medium transition-colors ${
                        watchedValues.estateType === value
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <input
                  type="hidden"
                  {...register("estateType", {
                    required: "Vyberte typ nemovitosti",
                  })}
                />
                {errors.estateType && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.estateType.message}
                  </p>
                )}
              </div>

              {/* Interactive Map */}
              <div className="mb-6">
                <CzechMap
                  selectedRegion={watchedValues.region}
                  selectedDistrict={watchedValues.district}
                  onSelectionChange={handleRegionDistrictChange}
                />
                <input
                  type="hidden"
                  {...register("region", {
                    required: "Vyberte kraj",
                  })}
                />
                {errors.region && (
                  <p className="text-red-600 text-sm mt-1 text-center">
                    {errors.region.message}
                  </p>
                )}
                <input
                  type="hidden"
                  {...register("district", {
                    required: "Vyberte okres",
                  })}
                />
                {errors.district && (
                  <p className="text-red-600 text-sm mt-2 text-center">
                    {errors.district.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Pokračovat
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Kontaktní informace
              </h2>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Celé jméno *
                </label>
                <input
                  type="text"
                  {...register("fullname", {
                    required: "Zadejte celé jméno",
                    minLength: {
                      value: 2,
                      message: "Celé jméno musí mít alespoň 2 znaky",
                    },
                  })}
                  placeholder="Jan Novák"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.fullname ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.fullname && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.fullname.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefonní číslo *
                </label>
                <input
                  type="tel"
                  {...register("phone", {
                    required: "Zadejte telefonní číslo",
                    pattern: {
                      value: /^(\+420)?[ ]?[0-9]{3}[ ]?[0-9]{3}[ ]?[0-9]{3}$/,
                      message:
                        "Zadejte platné české telefonní číslo (např. 777 123 456)",
                    },
                  })}
                  placeholder="777 123 456"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  {...register("email", {
                    required: "Zadejte emailovou adresu",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Zadejte platnou emailovou adresu",
                    },
                  })}
                  placeholder="jan.novak@email.cz"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Zpět
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Odesílám..." : "Odeslat poptávku"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LeadForm;
