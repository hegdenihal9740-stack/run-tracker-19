import { afterEach, describe, expect, it, vi } from "vitest";
import { buildFeeReceiptData, amountInWords, downloadFeeReceiptDocx } from "../campusly/feeReceipt";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const fees = [
  {
    module: 1,
    title: "AI Foundation",
    amount: 25000,
    date: "18 Sep 2026",
    status: "Paid",
    receipt: "SKL-FEE-2026-0001",
    method: "UPI",
  },
  {
    module: 2,
    title: "Advanced Python",
    amount: 45000,
    date: "27 Oct 2026",
    status: "Paid",
    receipt: "SKL-FEE-2026-0002",
    method: "Credit Card",
  },
  {
    module: 3,
    title: "Machine Learning",
    amount: 55000,
    date: "10 Nov 2026",
    status: "Pending",
    receipt: null,
    method: null,
  },
];
const student = {
  name: "Nihal Hegde",
  studentId: "MBD-2026-0148",
  program: "AI Big Data",
  batch: "October 2026",
};

describe("fee receipt details", () => {
  it("writes amounts using Indian number groups", () => {
    expect(amountInWords(125000)).toBe("One Lakh Twenty Five Thousand Rupees Only");
    expect(amountInWords(70000)).toBe("Seventy Thousand Rupees Only");
    expect(amountInWords(0)).toBe("Zero Rupees Only");
  });

  it("uses the receipt data and next issued pending fee", () => {
    const receipt = buildFeeReceiptData(fees[0], fees, student);
    expect(receipt).toMatchObject({
      receiptNumber: "SKL-FEE-2026-0001",
      admissionNumber: "MBD-2026-0148",
      paymentMode: { selected: "UPI", other: "" },
      amount: 25000,
      amountInWords: "Twenty Five Thousand Rupees Only",
      balance: 55000,
      nextDueDate: "10 Nov 2026",
    });
  });

  it("maps Credit Card to Other without mislabeling the payment method", () => {
    const receipt = buildFeeReceiptData(fees[1], fees, student);
    expect(receipt.paymentMode).toEqual({ selected: "Other", other: "Credit Card" });
    expect(receipt.balance).toBe(55000);
    expect(receipt.nextDueDate).toBe("10 Nov 2026");
  });

  it("creates a downloadable Word receipt", async () => {
    const anchor = { href: "", download: "", click: vi.fn() };
    const blobUrl = { createObjectURL: vi.fn(() => "blob:receipt"), revokeObjectURL: vi.fn() };
    vi.stubGlobal("document", { createElement: vi.fn(() => anchor) });
    vi.stubGlobal("URL", blobUrl);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        arrayBuffer: async () => new Uint8Array([137, 80, 78, 71]).buffer,
      })),
    );
    vi.useFakeTimers();

    await downloadFeeReceiptDocx(buildFeeReceiptData(fees[0], fees, student));

    expect(anchor.download).toBe("Skill_AI_Fee_Receipt_SKL-FEE-2026-0001.docx");
    expect(anchor.click).toHaveBeenCalledOnce();
    expect(blobUrl.createObjectURL).toHaveBeenCalledOnce();
    vi.runAllTimers();
    expect(blobUrl.revokeObjectURL).toHaveBeenCalledOnce();
  });
});
