import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "../../store/useAuthStore";
import { usePreferencesStore } from "../../store/usePreferencesStore";
import { getErrorMessage } from "../../utils/errorHandler";
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
import { User, Mail, Save, Loader2 } from "lucide-react";

const ProfilePage = () => {
  const { user } = useAuthStore();
  const { preferences, savePreferences, fetchPreferences, isLoading, error } =
    usePreferencesStore();
  const navigate = useNavigate();

  // Form state
  const [selectedCryptos, setSelectedCryptos] = useState<string[]>([]);
  const [investorType, setInvestorType] = useState<InvestorType | "">("");
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel | "">("");
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        await fetchPreferences();
      } catch (error) {
        console.error("Failed to load preferences:", error);
      }
    };
    loadPreferences();
  }, [fetchPreferences]);

  // Populate form when preferences are loaded
  useEffect(() => {
    if (preferences) {
      setSelectedCryptos(preferences.favoriteCryptos || []);
      setExperienceLevel(preferences.experienceLevel || "");
      setRiskTolerance(preferences.riskTolerance || "");
      setInvestorType(
        (preferences.investmentGoals?.[0] as InvestorType) || ""
      );
      setContentTypes(preferences.contentTypes || []);
    }
  }, [preferences]);

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
    setShowSuccess(false);
    setLocalError(null);
    try {
      await savePreferences({
        experienceLevel,
        riskTolerance,
        investmentGoals: [investorType as string].filter(Boolean),
        favoriteCryptos: selectedCryptos,
        contentTypes: contentTypes,
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setLocalError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    experienceLevel !== "" &&
    riskTolerance !== "" &&
    selectedCryptos.length > 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Information
            </CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Name
              </label>
              <div className="flex items-center gap-2 mt-1">
                <User className="w-4 h-4 text-muted-foreground" />
                <p className="text-base font-medium">{user?.name || "N/A"}</p>
              </div>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Email
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <p className="text-base font-medium">{user?.email || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences Card */}
        <Card>
          <CardHeader>
            <CardTitle>Investment Preferences</CardTitle>
            <CardDescription>
              Update your preferences to get personalized insights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {showSuccess && (
              <Alert>
                <AlertDescription>
                  Preferences saved successfully!
                </AlertDescription>
              </Alert>
            )}

            {(error || localError) && (
              <Alert variant="destructive">
                <AlertDescription>{error || localError}</AlertDescription>
              </Alert>
            )}

            {/* Cryptocurrencies */}
            <div>
              <h3 className="text-sm font-semibold mb-3">
                Favorite Cryptocurrencies
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CRYPTO_OPTIONS.map((crypto) => (
                  <div
                    key={crypto.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`profile-crypto-${crypto.value}`}
                      checked={selectedCryptos.includes(crypto.value)}
                      onCheckedChange={() => handleCryptoToggle(crypto.value)}
                    />
                    <label
                      htmlFor={`profile-crypto-${crypto.value}`}
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

            {/* Investor Type */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Investor Type</h3>
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

            <Separator />

            {/* Experience Level */}
            <div>
              <h3 className="text-sm font-semibold mb-3">
                Experience Level
              </h3>
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

            {/* Risk Tolerance */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Risk Tolerance</h3>
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

            {/* Content Types */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Content Preferences</h3>
              <div className="flex flex-col gap-3">
                {CONTENT_TYPES.map((content) => (
                  <div
                    key={content.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`profile-content-${content.value}`}
                      checked={contentTypes.includes(
                        content.value as ContentType
                      )}
                      onCheckedChange={() =>
                        handleContentTypeToggle(content.value as ContentType)
                      }
                    />
                    <label
                      htmlFor={`profile-content-${content.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {content.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;

