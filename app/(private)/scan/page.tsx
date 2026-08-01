"use client";

import {
  Button,
  Card,
  CardBody,
  Chip,
  Input,
  Spinner,
  Textarea,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Html5Qrcode } from "html5-qrcode";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

import { useQRScan } from "@/hooks/use-qr-scan";
import { PageHeader } from "@/components/PageHeader";

type ScanState = "idle" | "scanning" | "processing" | "result";

interface ScanResult {
  status: "DONG_Y" | "TU_CHOI" | "DANG_XU_LY";
  reason?: string;
  type: string;
  name?: string;
  logId?: string;
}

const STATUS_CONFIG = {
  DONG_Y: {
    label: "Đồng ý ra cổng",
    color: "success" as const,
    bg: "bg-success-50 border-success-200",
    iconClass: "text-success-600",
    icon: "mdi:check-decagram",
  },
  TU_CHOI: {
    label: "Từ chối ra cổng",
    color: "danger" as const,
    bg: "bg-danger-50 border-danger-200",
    iconClass: "text-danger-600",
    icon: "mdi:close-octagon",
  },
  DANG_XU_LY: {
    label: "Đang xử lý (chờ duyệt)",
    color: "warning" as const,
    bg: "bg-warning-50 border-warning-200",
    iconClass: "text-warning-600",
    icon: "mdi:clock-alert-outline",
  },
};

const SCANNER_ID = "qr-scanner-container";

// A mis-configured HID scanner on macOS sends digits as Option+digit symbols.
// This map is deterministic and these symbols never appear in valid QR/CCCD
// payloads, so reversing it is safe.
const OPTION_DIGIT: Record<string, string> = {
  º: "0",
  "¡": "1",
  "™": "2",
  "£": "3",
  "¢": "4",
  "∞": "5",
  "§": "6",
  "¶": "7",
  "•": "8",
  ª: "9",
};

const fixDigits = (s: string) =>
  s.replace(/[º¡™£¢∞§¶•ª]/g, (c) => OPTION_DIGIT[c] ?? c);

// DDMMYYYY -> YYYY-MM-DD (CCCD dates); pass through anything else.
const cccdDateToISO = (d: string) =>
  /^\d{8}$/.test(d) ? `${d.slice(4)}-${d.slice(2, 4)}-${d.slice(0, 2)}` : d;

// Vietnamese CCCD QR payload: cccd|cmnd|name|dob|gender|address|issueDate
function parseCCCD(raw: string) {
  const [
    citizenId = "",
    ,
    name = "",
    dob = "",
    ,
    address = "",
    issueDate = "",
  ] = raw.split("|");

  return {
    citizenId: citizenId.trim(),
    name: name.trim(),
    birthday: cccdDateToISO(dob.trim()),
    address: address.trim(),
    issueDate: cccdDateToISO(issueDate.trim()),
  };
}

export default function ScanPage() {
  const { scanQR, approveQRScan, rejectQRScan } = useQRScan();
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const [state, setState] = useState<ScanState>("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanInput, setScanInput] = useState("");
  const scannerInputRef = useRef<HTMLInputElement>(null);

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
        const value = fixDigits(rawValue.trim());

        let parsed: any;
        let isMilitary = false;
        let isCitizen = false;

        if (value.startsWith("{")) {
          try {
            parsed = JSON.parse(value);
          } catch {
            throw new Error("Dữ liệu QR không phải JSON hợp lệ");
          }
          isMilitary =
            "qrCode" in parsed ||
            "unitCode" in parsed ||
            "rankCode" in parsed ||
            "code" in parsed;
          isCitizen = "citizenId" in parsed || "citizenid" in parsed;
        } else if (value.includes("|")) {
          // Thẻ CCCD: các trường ngăn cách bằng "|"
          parsed = parseCCCD(value);
          isCitizen = true;
        }

        if (!isMilitary && !isCitizen) {
          throw new Error(
            "Không nhận dạng được dữ liệu (không phải QR quân nhân / CCCD)",
          );
        }

        const response = isMilitary
          ? await scanQR({ militaryPersonnel: parsed })
          : await scanQR({ citizen: parsed });
        const res = (response as any)?.data ?? response;

        setResult({
          status: res.status,
          reason: res.reason,
          type: res.scanType ?? (isMilitary ? "MILITARY_PERSONNEL" : "CITIZEN"),
          name:
            res.militaryPersonnelFullName ??
            res.citizenName ??
            parsed.fullName ??
            parsed.name,
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
      const camera =
        cameras.find((c) => /back|rear|environment/i.test(c.label)) ??
        cameras[cameras.length - 1];

      await scanner.start(
        camera.id,
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        (decodedText) => {
          processQRData(decodedText);
        },
        () => {
          /* scan failure - keep trying */
        },
      );
    } catch (err: any) {
      await stopScanner();
      setState("idle");
      setCameraError(
        err.message ||
          "Không thể mở camera. Kiểm tra quyền truy cập và dùng HTTPS/localhost.",
      );
    }
  }, [processQRData, stopScanner]);

  // Cleanup on unmount
  useEffect(
    () => () => {
      stopScanner();
    },
    [stopScanner],
  );

  const handleReset = useCallback(async () => {
    await stopScanner();
    setState("idle");
    setResult(null);
    setManualInput("");
    setCameraError(null);
  }, [stopScanner]);

  // Hardware barcode/QR scanner acts as a keyboard: it "types" the decoded
  // value then sends Enter → this submits the focused input.
  const handleScannerSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const value = scanInput.trim();

      if (!value) return;
      setScanInput("");
      processQRData(value);
    },
    [scanInput, processQRData],
  );

  // Keep the scanner input focused whenever we're idle so a scan is captured
  // without the operator having to click first.
  useEffect(() => {
    if (state === "idle") scannerInputRef.current?.focus();
  }, [state]);

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
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      <PageHeader
        icon="mdi:qrcode-scan"
        subtitle="Quét mã QR để xác nhận ra/vào doanh trại"
        title="Kiểm soát cổng — Quét QR"
      />

      {/* Result */}
      {state === "result" && result && (
        <Card
          className={`border-2 ${STATUS_CONFIG[result.status]?.bg ?? "bg-default-50"}`}
        >
          <CardBody className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <Icon
                className={`text-4xl ${STATUS_CONFIG[result.status]?.iconClass ?? "text-default-400"}`}
                icon={
                  STATUS_CONFIG[result.status]?.icon ??
                  "mdi:help-circle-outline"
                }
              />
              <div>
                <Chip
                  color={STATUS_CONFIG[result.status]?.color ?? "default"}
                  size="lg"
                  variant="flat"
                >
                  {STATUS_CONFIG[result.status]?.label ?? result.status}
                </Chip>
                {result.name && (
                  <p className="mt-1 font-semibold text-lg">{result.name}</p>
                )}
                <p className="text-sm text-default-500">
                  {result.type === "MILITARY_PERSONNEL"
                    ? "Quân nhân"
                    : result.type === "CITIZEN"
                      ? "Người dân"
                      : ""}
                </p>
              </div>
            </div>

            {result.reason && (
              <p className="text-sm text-default-600 bg-content1 rounded p-2 border border-divider">
                Lý do: {result.reason}
              </p>
            )}

            {result.type === "CITIZEN" && result.status === "DANG_XU_LY" && (
              <div className="flex gap-2">
                <Button color="success" onPress={handleApprove}>
                  Cho vào
                </Button>
                <Button color="danger" variant="flat" onPress={handleReject}>
                  Từ chối
                </Button>
              </div>
            )}

            <Button className="w-full" variant="flat" onPress={handleReset}>
              Quét tiếp
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Scanning */}
      {state === "scanning" && (
        <Card>
          <CardBody className="p-4 space-y-3">
            <p className="text-sm text-default-500 text-center">
              Đưa mã QR vào khung để quét tự động
            </p>
            {/* html5-qrcode renders into this div */}
            <div
              className="w-full rounded-lg overflow-hidden"
              id={SCANNER_ID}
            />
            <Button
              className="w-full"
              color="danger"
              variant="flat"
              onPress={handleReset}
            >
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
            <p className="text-default-500">Đang xử lý...</p>
          </CardBody>
        </Card>
      )}

      {/* Idle */}
      {state === "idle" && (
        <div className="space-y-4">
          {/* Hardware barcode/QR scanner (keyboard wedge) — primary at the gate */}
          <Card className="border-2 border-primary-200">
            <CardBody className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon
                  className="text-2xl text-primary-600"
                  icon="mdi:barcode-scan"
                />
                <p className="font-medium text-sm text-default-700">
                  Máy quét đầu đọc (barcode/QR)
                </p>
              </div>
              <form onSubmit={handleScannerSubmit}>
                <Input
                  ref={scannerInputRef}
                  placeholder="Bấm vào đây rồi quét mã..."
                  size="lg"
                  startContent={
                    <Icon
                      className="text-default-400"
                      icon="mdi:cursor-default-click-outline"
                    />
                  }
                  value={scanInput}
                  variant="bordered"
                  onValueChange={setScanInput}
                />
              </form>
              <p className="text-xs text-default-400">
                Đưa con trỏ vào ô trên và quét — máy quét sẽ tự nhập dữ liệu và
                gửi Enter để xử lý.
              </p>
            </CardBody>
          </Card>

          <Button
            className="w-full h-16 text-lg"
            color="primary"
            size="lg"
            startContent={
              <Icon className="text-2xl" icon="mdi:camera-outline" />
            }
            variant="flat"
            onPress={startScanner}
          >
            Hoặc quét QR bằng camera
          </Button>

          {cameraError && (
            <p className="text-sm text-danger-600 text-center bg-danger-50 border border-danger-200 rounded p-3">
              {cameraError}
            </p>
          )}

          <Card>
            <CardBody className="space-y-3">
              <p className="font-medium text-sm text-default-600">
                Hoặc nhập thủ công (JSON từ QR):
              </p>
              <Textarea
                minRows={3}
                placeholder={
                  '{"qrCode":"...","fullName":"Nguyễn Văn A"} hoặc {"citizenId":"...","name":"..."}'
                }
                value={manualInput}
                onValueChange={setManualInput}
              />
              <Button
                className="w-full"
                color="primary"
                isDisabled={!manualInput.trim()}
                onPress={() => processQRData(manualInput.trim())}
              >
                Xử lý
              </Button>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
