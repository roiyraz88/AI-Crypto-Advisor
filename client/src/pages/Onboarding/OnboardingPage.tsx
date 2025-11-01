import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { usePreferencesStore } from "../../store/usePreferencesStore";
import { useNavigate } from "react-router-dom";
import type {
  ExperienceLevel,
  RiskTolerance,
  InvestorType,
  ContentType,
} from "../../types";
import {
  CRYPTO_OPTIONS,
  INVESTOR_TYPES,
  CONTENT_TYPES,
} from "../../utils/constants";

type OnboardingStep = 1 | 2 | 3;

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [selectedCryptos, setSelectedCryptos] = useState<string[]>([]);
  const [investorType, setInvestorType] = useState<InvestorType | "">("");
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel | "">("");
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { savePreferences, hasCompletedOnboarding, fetchPreferences } =
    usePreferencesStore();
  const navigate = useNavigate();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!hasCompletedOnboarding()) {
        try {
          await fetchPreferences();
        } catch (error) {
          console.log("Preferences not found, showing onboarding");
        }
      }

      if (hasCompletedOnboarding()) {
        navigate("/dashboard", { replace: true });
      }
    };

    checkOnboardingStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as OnboardingStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as OnboardingStep);
    }
  };

  const handleCryptoToggle = (crypto: string) => {
    setSelectedCryptos((prev) =>
      prev.includes(crypto)
        ? prev.filter((c) => c !== crypto)
        : [...prev, crypto]
    );
  };

  const handleContentTypeToggle = (contentType: ContentType) => {
    setContentTypes((prev) =>
      prev.includes(contentType)
        ? prev.filter((c) => c !== contentType)
        : [...prev, contentType]
    );
  };

  const handleSubmit = async () => {
    if (!experienceLevel || !riskTolerance || selectedCryptos.length === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await savePreferences({
        experienceLevel,
        riskTolerance,
        investmentGoals: [investorType as string].filter(Boolean),
        favoriteCryptos: selectedCryptos,
        contentTypes: contentTypes,
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to save preferences:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToStep2 = selectedCryptos.length > 0 && investorType !== "";
  const canProceedToStep3 =
    experienceLevel !== "" && riskTolerance !== "" && contentTypes.length > 0;
  const canSubmit =
    experienceLevel !== "" &&
    riskTolerance !== "" &&
    selectedCryptos.length > 0;

  const progress = ((currentStep - 1) / 2) * 100;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold">
            Let's personalize your experience
          </CardTitle>
          <CardDescription>Step {currentStep} of 3</CardDescription>
          <Progress value={progress} className="w-full mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  What cryptocurrencies interest you?
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Select all that apply
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CRYPTO_OPTIONS.map((crypto) => (
                    <div key={crypto.value} className="flex items-center space-x-2">
                    <Checkbox
                        id={`crypto-${crypto.value}`}
                        checked={selectedCryptos.includes(crypto.value)}
                        onCheckedChange={() => handleCryptoToggle(crypto.value)}
                      />
                      <label
                        htmlFor={`crypto-${crypto.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {crypto.label}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedCryptos.length === 0 && (
                  <p className="text-sm text-destructive mt-2">
                    Please select at least one cryptocurrency
                  </p>
                )}
              </div>

              <Separator />

              <div>
                <h2 className="text-xl font-semibold mb-4">
                  What type of investor are you?
                </h2>
                <Select
                  value={investorType}
                  onValueChange={(value) => setInvestorType(value as InvestorType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your investor type" />
                  </SelectTrigger>
                  <SelectContent>
                  {INVESTOR_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  What's your experience level?
                </h2>
                <Select
                  value={experienceLevel}
                  onValueChange={(value) =>
                    setExperienceLevel(value as ExperienceLevel)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <h2 className="text-xl font-semibold mb-4">
                  What's your risk tolerance?
                </h2>
                <Select
                  value={riskTolerance}
                  onValueChange={(value) =>
                    setRiskTolerance(value as RiskTolerance)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your risk tolerance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <h2 className="text-xl font-semibold mb-4">
                  What content do you prefer?
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Select all that apply
                </p>
                <div className="flex flex-col gap-3">
                  {CONTENT_TYPES.map((content) => (
                    <div key={content.value} className="flex items-center space-x-2">
                    <Checkbox
                        id={`content-${content.value}`}
                        checked={contentTypes.includes(
                        content.value as ContentType
                      )}
                        onCheckedChange={() =>
                        handleContentTypeToggle(content.value as ContentType)
                      }
                      />
                      <label
                        htmlFor={`content-${content.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {content.label}
                      </label>
                    </div>
                  ))}
                </div>
                {contentTypes.length === 0 && (
                  <p className="text-sm text-destructive mt-2">
                    Please select at least one content type
                  </p>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold">Review your preferences</h2>
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Cryptocurrencies</p>
                  <p className="font-medium">
                    {selectedCryptos
                      .map(
                        (c) =>
                          CRYPTO_OPTIONS.find((opt) => opt.value === c)?.label ||
                          c
                      )
                      .join(", ")}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Investor Type</p>
                  <p className="font-medium">
                    {investorType ||
                      INVESTOR_TYPES.find((t) => t.value === investorType)
                        ?.label ||
                      "Not selected"}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Experience Level
                  </p>
                  <p className="font-medium capitalize">{experienceLevel}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Risk Tolerance</p>
                  <p className="font-medium capitalize">{riskTolerance}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Content Types</p>
                  <p className="font-medium">{contentTypes.join(", ")}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between gap-4 mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </Button>

            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !canProceedToStep2) ||
                  (currentStep === 2 && !canProceedToStep3)
                }
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Complete Setup"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingPage;
