"use client";

import { useQRScan } from "@/hooks/use-qr-scan";
import { Button, Card, CardBody, Chip, Spinner, Textarea } from "@heroui/react";
import { Html5Qrcode } from "html5-qrcode";
import { useCallback, useEffect, useRef, useState } from "react";

type ScanState = "idle" | "scanning" | "processing" | "result";

interface ScanResult {
  status: "DONG_Y" | "TU_CHOI" | "DANG_XU_LY";
  reason?: string;
  type: string;
  name?: string;
  logId?: string;
}

const STATUS_CONFIG = {
  DONG_Y: { label: "Đồng ý ra cổng", color: "success" as const, bg: "bg-green-50 border-green-200", icon: "✅" },
  TU_CHOI: { label: "Từ chối ra cổng", color: "danger" as const, bg: "bg-red-50 border-red-200", icon: "❌" },
  DANG_XU_LY: { label: "Đang xử lý (chờ duyệt)", color: "warning" as const, bg: "bg-yellow-50 border-yellow-200", icon: "⏳" },
};

const SCANNER_ID = "qr-scanner-container";

export default function ScanPage() {
  const { scanQR, approveQRScan, rejectQRScan } = useQRScan();
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const [state, setState] = useState<ScanState>("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const scannerState = scannerRef.current.getState();
        // State 2 = SCANNING, State 3 = PAUSED
        if (scannerState === 2 || scannerState === 3) {
          await scannerRef.current.stop();
        }
      } catch {
        // ignore stop errors
      }
      scannerRef.current = null;
    }
  }, []);

  const processQRData = useCallback(
    async (rawValue: string) => {
      setState("processing");
      await stopScanner();

      try {
        let parsed: any;
        try {
          parsed = JSON.parse(rawValue);
        } catch {
          throw new Error("Dữ liệu QR không phải JSON hợp lệ");
        }

        const isMilitary = "qrCode" in parsed || "unitCode" in parsed || "rankCode" in parsed || "code" in parsed;
        const isCitizen = "citizenId" in parsed || "citizenid" in parsed;

        if (!isMilitary && !isCitizen) {
          throw new Error("Không nhận dạng được loại QR (quân nhân / người dân)");
        }

        const response = isMilitary
          ? await scanQR({ militaryPersonnel: parsed })
          : await scanQR({ citizen: parsed });
        const res = (response as any)?.data ?? response;

        setResult({
          status: res.status,
          reason: res.reason,
          type: res.scanType ?? (isMilitary ? "MILITARY_PERSONNEL" : "CITIZEN"),
          name: res.militaryPersonnelFullName ?? res.citizenName ?? parsed.fullName ?? parsed.name,
          logId: res.id,
        });
        setState("result");
      } catch (err: any) {
        setResult({
          status: "TU_CHOI",
          reason: err.message || "Dữ liệu QR không hợp lệ",
          type: "UNKNOWN",
        });
        setState("result");
      }
    },
    [scanQR, stopScanner],
  );

  const startScanner = useCallback(async () => {
    setState("scanning");
    setResult(null);
    setCameraError(null);

    // Wait for the DOM element to be rendered
    await new Promise((r) => setTimeout(r, 100));

    try {
      const scanner = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = scanner;

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        throw new Error("Không tìm thấy camera");
      }

      // Prefer rear camera
      const camera = cameras.find((c) => /back|rear|environment/i.test(c.label)) ?? cameras[cameras.length - 1];

      await scanner.start(
        camera.id,
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        (decodedText) => { processQRData(decodedText); },
        () => { /* scan failure - keep trying */ },
      );
    } catch (err: any) {
      await stopScanner();
      setState("idle");
      setCameraError(err.message || "Không thể mở camera. Kiểm tra quyền truy cập và dùng HTTPS/localhost.");
    }
  }, [processQRData, stopScanner]);

  // Cleanup on unmount
  useEffect(() => () => { stopScanner(); }, [stopScanner]);

  const handleReset = useCallback(async () => {
    await stopScanner();
    setState("idle");
    setResult(null);
    setManualInput("");
    setCameraError(null);
  }, [stopScanner]);

  const handleApprove = async () => {
    if (!result?.logId) return;
    await approveQRScan(result.logId);
    setResult((r) => r && { ...r, status: "DONG_Y" });
  };

  const handleReject = async () => {
    if (!result?.logId) return;
    await rejectQRScan(result.logId);
    setResult((r) => r && { ...r, status: "TU_CHOI" });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Kiểm soát cổng — Quét QR</h1>

      {/* Result */}
      {state === "result" && result && (
        <Card className={`border-2 ${STATUS_CONFIG[result.status]?.bg ?? "bg-gray-50"}`}>
          <CardBody className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{STATUS_CONFIG[result.status]?.icon ?? "❓"}</span>
              <div>
                <Chip size="lg" color={STATUS_CONFIG[result.status]?.color ?? "default"} variant="flat">
                  {STATUS_CONFIG[result.status]?.label ?? result.status}
                </Chip>
                {result.name && <p className="mt-1 font-semibold text-lg">{result.name}</p>}
                <p className="text-sm text-gray-500">
                  {result.type === "MILITARY_PERSONNEL" ? "Quân nhân" : result.type === "CITIZEN" ? "Người dân" : ""}
                </p>
              </div>
            </div>

            {result.reason && (
              <p className="text-sm text-gray-600 bg-white rounded p-2 border">Lý do: {result.reason}</p>
            )}

            {result.type === "CITIZEN" && result.status === "DANG_XU_LY" && (
              <div className="flex gap-2">
                <Button color="success" onPress={handleApprove}>Cho vào</Button>
                <Button color="danger" variant="flat" onPress={handleReject}>Từ chối</Button>
              </div>
            )}

            <Button variant="flat" onPress={handleReset} className="w-full">Quét tiếp</Button>
          </CardBody>
        </Card>
      )}

      {/* Scanning */}
      {state === "scanning" && (
        <Card>
          <CardBody className="p-4 space-y-3">
            <p className="text-sm text-gray-500 text-center">Đưa mã QR vào khung để quét tự động</p>
            {/* html5-qrcode renders into this div */}
            <div id={SCANNER_ID} className="w-full rounded-lg overflow-hidden" />
            <Button variant="flat" color="danger" className="w-full" onPress={handleReset}>
              Dừng quét
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Processing */}
      {state === "processing" && (
        <Card>
          <CardBody className="flex flex-col items-center justify-center py-12 gap-4">
            <Spinner size="lg" />
            <p className="text-gray-500">Đang xử lý...</p>
          </CardBody>
        </Card>
      )}

      {/* Idle */}
      {state === "idle" && (
        <div className="space-y-4">
          <Button color="primary" size="lg" className="w-full h-16 text-lg" onPress={startScanner}>
            📷 Bắt đầu quét QR bằng camera
          </Button>

          {cameraError && (
            <p className="text-sm text-red-500 text-center bg-red-50 border border-red-200 rounded p-3">
              {cameraError}
            </p>
          )}

          <Card>
            <CardBody className="space-y-3">
              <p className="font-medium text-sm text-gray-600">Hoặc nhập thủ công (JSON từ QR):</p>
              <Textarea
                placeholder={'{"qrCode":"...","fullName":"Nguyễn Văn A"} hoặc {"citizenId":"...","name":"..."}'}
                value={manualInput}
                onValueChange={setManualInput}
                minRows={3}
              />
              <Button color="primary" isDisabled={!manualInput.trim()} onPress={() => processQRData(manualInput.trim())} className="w-full">
                Xử lý
              </Button>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
