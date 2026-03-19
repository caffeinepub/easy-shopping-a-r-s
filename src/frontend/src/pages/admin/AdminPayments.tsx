import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useImageUpload } from "../../hooks/useImageUpload";
import { usePaymentQRs, useSetPaymentQRs } from "../../hooks/useQueries";
import AdminLayout from "./AdminLayout";

export default function AdminPayments() {
  const { data: paymentQRs, isLoading } = usePaymentQRs();
  const setQRs = useSetPaymentQRs();
  const { uploadImage, uploading, progress } = useImageUpload();

  const [esewaPreview, setEsewaPreview] = useState("");
  const [bankPreview, setBankPreview] = useState("");
  const [esewaImageId, setEsewaImageId] = useState("");
  const [bankImageId, setBankImageId] = useState("");
  const [uploadingEsewa, setUploadingEsewa] = useState(false);
  const [uploadingBank, setUploadingBank] = useState(false);

  const esewaFileRef = useRef<HTMLInputElement>(null);
  const bankFileRef = useRef<HTMLInputElement>(null);

  // Initialize from backend data
  const esewaQr = esewaImageId || paymentQRs?.esewaQrImageId || "";
  const bankQr = bankImageId || paymentQRs?.bankQrImageId || "";
  const esewaDisplay = esewaPreview || paymentQRs?.esewaQrImageId || "";
  const bankDisplay = bankPreview || paymentQRs?.bankQrImageId || "";

  const handleEsewaFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setEsewaPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setUploadingEsewa(true);
    try {
      const url = await uploadImage(file);
      setEsewaImageId(url);
      setEsewaPreview(url);
      toast.success("eSewa QR uploaded!");
    } catch {
      toast.error("eSewa QR upload failed");
    } finally {
      setUploadingEsewa(false);
    }
  };

  const handleBankFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setBankPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setUploadingBank(true);
    try {
      const url = await uploadImage(file);
      setBankImageId(url);
      setBankPreview(url);
      toast.success("Bank QR uploaded!");
    } catch {
      toast.error("Bank QR upload failed");
    } finally {
      setUploadingBank(false);
    }
  };

  const handleSave = async () => {
    try {
      await setQRs.mutateAsync({
        esewaQrImageId: esewaQr,
        bankQrImageId: bankQr,
      });
      toast.success("Payment QR codes saved successfully!");
    } catch {
      toast.error("Failed to save payment QR codes");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-primary" />
            Payment Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload QR codes for eSewa and Bank Transfer payment methods
          </p>
        </div>

        {isLoading ? (
          <div
            data-ocid="admin.payments.loading_state"
            className="flex items-center justify-center py-20"
          >
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* eSewa QR */}
            <Card
              data-ocid="admin.payments.card"
              className="border-border shadow-card"
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <span className="text-green-700 font-bold text-sm">
                      eSewa
                    </span>
                  </div>
                  <div>
                    <div className="text-base">eSewa QR Code</div>
                    <div className="text-xs font-normal text-muted-foreground">
                      Buyers will scan this to pay via eSewa
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center gap-4">
                  {esewaDisplay ? (
                    <div className="relative w-48 h-48 rounded-xl overflow-hidden border-2 border-green-200 bg-white">
                      <img
                        src={esewaDisplay}
                        alt="eSewa QR"
                        className="w-full h-full object-contain p-2"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setEsewaPreview("");
                          setEsewaImageId("");
                        }}
                        className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 hover:bg-black/80 transition-colors"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-48 h-48 rounded-xl border-2 border-dashed border-green-200 bg-green-50 flex flex-col items-center justify-center gap-2 text-green-600">
                      <Upload className="w-8 h-8" />
                      <span className="text-sm font-medium">
                        No QR uploaded
                      </span>
                    </div>
                  )}

                  <div className="w-full">
                    <Label className="text-xs text-muted-foreground mb-2 block">
                      Upload eSewa QR Image
                    </Label>
                    <Button
                      type="button"
                      data-ocid="admin.payments.upload_button"
                      variant="outline"
                      onClick={() => esewaFileRef.current?.click()}
                      disabled={uploadingEsewa || uploading}
                      className="w-full gap-2 border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <Upload className="w-4 h-4" />
                      {uploadingEsewa
                        ? `Uploading ${progress}%...`
                        : "Upload eSewa QR"}
                    </Button>
                    <input
                      ref={esewaFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleEsewaFile}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bank QR */}
            <Card
              data-ocid="admin.payments.card"
              className="border-border shadow-card"
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <div className="text-base">Bank Account QR</div>
                    <div className="text-xs font-normal text-muted-foreground">
                      Buyers will scan this to pay via bank transfer
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center gap-4">
                  {bankDisplay ? (
                    <div className="relative w-48 h-48 rounded-xl overflow-hidden border-2 border-blue-200 bg-white">
                      <img
                        src={bankDisplay}
                        alt="Bank QR"
                        className="w-full h-full object-contain p-2"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setBankPreview("");
                          setBankImageId("");
                        }}
                        className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 hover:bg-black/80 transition-colors"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-48 h-48 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 flex flex-col items-center justify-center gap-2 text-blue-600">
                      <Upload className="w-8 h-8" />
                      <span className="text-sm font-medium">
                        No QR uploaded
                      </span>
                    </div>
                  )}

                  <div className="w-full">
                    <Label className="text-xs text-muted-foreground mb-2 block">
                      Upload Bank Account QR Image
                    </Label>
                    <Button
                      type="button"
                      data-ocid="admin.payments.upload_button"
                      variant="outline"
                      onClick={() => bankFileRef.current?.click()}
                      disabled={uploadingBank || uploading}
                      className="w-full gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <Upload className="w-4 h-4" />
                      {uploadingBank
                        ? `Uploading ${progress}%...`
                        : "Upload Bank QR"}
                    </Button>
                    <input
                      ref={bankFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleBankFile}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!isLoading && (
          <>
            <Separator className="my-6" />
            <div className="flex justify-end">
              <Button
                data-ocid="admin.payments.save_button"
                onClick={handleSave}
                disabled={setQRs.isPending}
                className="bg-primary hover:bg-primary/90 gap-2 px-8"
              >
                {setQRs.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Payment QR Codes"
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
