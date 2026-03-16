import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, MapPin, Phone, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveUserProfile, useUserProfile } from "../hooks/useQueries";

function validateNepalPhone(phone: string): boolean {
  return /^(98|97|96)\d{8}$/.test(phone);
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading } = useUserProfile();
  const saveProfile = useSaveUserProfile();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setAddress(profile.address ?? "");
      setPhone(profile.phone ?? "");
      setEmail(profile.email ?? "");
    }
  }, [profile]);

  if (!identity) {
    navigate({ to: "/" });
    return null;
  }

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (val && !validateNepalPhone(val)) {
      setPhoneError("Enter a valid Nepal mobile number (e.g. 9812345678)");
    } else {
      setPhoneError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone && !validateNepalPhone(phone)) {
      setPhoneError("Enter a valid Nepal mobile number (e.g. 9812345678)");
      return;
    }
    try {
      await saveProfile.mutateAsync({ name, email, address, phone });
      toast.success("Profile saved successfully!");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground">
              My Profile
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your personal details and delivery information
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-8">
            {isLoading ? (
              <div data-ocid="profile.loading_state" className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-muted rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="profile-name"
                    className="flex items-center gap-2 text-sm font-semibold"
                  >
                    <User className="w-4 h-4 text-primary" />
                    Full Name
                  </Label>
                  <Input
                    id="profile-name"
                    data-ocid="profile.input"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label
                    htmlFor="profile-phone"
                    className="flex items-center gap-2 text-sm font-semibold"
                  >
                    <Phone className="w-4 h-4 text-primary" />
                    Phone Number
                    <span className="text-xs text-muted-foreground font-normal">
                      (Nepal only)
                    </span>
                  </Label>
                  <Input
                    id="profile-phone"
                    data-ocid="profile.input"
                    placeholder="e.g. 9812345678"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    maxLength={10}
                    className={`rounded-xl ${
                      phoneError
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                  />
                  {phoneError && (
                    <p
                      data-ocid="profile.error_state"
                      className="text-destructive text-xs mt-1"
                    >
                      {phoneError}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Must be 10 digits starting with 98, 97, or 96
                  </p>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label
                    htmlFor="profile-address"
                    className="flex items-center gap-2 text-sm font-semibold"
                  >
                    <MapPin className="w-4 h-4 text-primary" />
                    Delivery Address
                  </Label>
                  <Textarea
                    id="profile-address"
                    data-ocid="profile.textarea"
                    placeholder="Street address, city, district..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="rounded-xl resize-none"
                    rows={3}
                  />
                </div>

                {/* Email (optional) */}
                <div className="space-y-2">
                  <Label
                    htmlFor="profile-email"
                    className="text-sm font-semibold"
                  >
                    Email Address
                    <span className="text-xs text-muted-foreground font-normal ml-1">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="profile-email"
                    data-ocid="profile.input"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                <Button
                  type="submit"
                  data-ocid="profile.submit_button"
                  disabled={saveProfile.isPending || !!phoneError}
                  className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 h-auto"
                >
                  {saveProfile.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                      Saving...
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </Button>

                {saveProfile.isSuccess && (
                  <p
                    data-ocid="profile.success_state"
                    className="text-center text-sm text-green-600 font-medium"
                  >
                    ✓ Profile saved successfully
                  </p>
                )}
              </form>
            )}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
