import logoUrl from "@/assets/skillai-fee-logo.png";

const ONES = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function underThousand(value) {
  const words = [];
  if (value >= 100) {
    words.push(ONES[Math.floor(value / 100)], "Hundred");
    value %= 100;
  }
  if (value >= 20) {
    words.push(TENS[Math.floor(value / 10)]);
    value %= 10;
  }
  if (value > 0) words.push(ONES[value]);
  return words.join(" ");
}

export function amountInWords(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value) || value < 0 || value > 999999999999) {
    throw new RangeError("Fee amount must be between 0 and 999,999,999,999.");
  }
  let remaining = Math.round(value);
  if (remaining === 0) return "Zero Rupees Only";

  const scales = ["", "Thousand", "Lakh", "Crore", "Arab", "Kharab"];
  const parts = [];
  let group = 0;
  while (remaining > 0) {
    const size = group === 0 ? 1000 : 100;
    const chunk = remaining % size;
    if (chunk > 0)
      parts.unshift(`${underThousand(chunk)}${scales[group] ? ` ${scales[group]}` : ""}`);
    remaining = Math.floor(remaining / size);
    group += 1;
  }
  return `${parts.join(" ")} Rupees Only`;
}

function paymentMode(method = "") {
  const methodName = String(method ?? "");
  const knownModes = ["Cash", "UPI", "Cheque", "Bank transfer"];
  const mode = knownModes.find((value) => value.toLowerCase() === methodName.toLowerCase());
  return mode
    ? { selected: mode, other: "" }
    : { selected: "Other", other: methodName || "Not recorded" };
}

export function buildFeeReceiptData(fee, fees, student) {
  const moduleNumber = Number(fee.module);
  const balance = fees.reduce(
    (total, item) =>
      total + (item.status === "Paid" || item.amount === null ? 0 : Number(item.amount)),
    0,
  );
  const nextDue = fees
    .filter(
      (item) =>
        Number(item.module) > moduleNumber &&
        item.status !== "Paid" &&
        item.amount !== null &&
        item.date,
    )
    .sort((a, b) => Number(a.module) - Number(b.module))[0];

  return {
    receiptNumber: fee.receipt,
    date: fee.date || "Not recorded",
    studentName: student.name,
    admissionNumber: student.studentId,
    courseBatch: [student.program, student.batch].filter(Boolean).join(" · "),
    module: `Module ${fee.module} — ${fee.title}`,
    paymentType: "Instalments",
    paymentMode: paymentMode(fee.method),
    amount: Number(fee.amount),
    amountInWords: amountInWords(fee.amount),
    balance,
    nextDueDate: nextDue?.date || "Not scheduled",
  };
}

export async function downloadFeeReceiptDocx(receipt) {
  const D = await import("docx");
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    ImageRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
    AlignmentType,
    ShadingType,
  } = D;
  const font = "Arial";
  const orange = "F07832";
  const border = { style: BorderStyle.SINGLE, size: 5, color: "D1D5DB" };
  const borders = { top: border, bottom: border, left: border, right: border };
  const text = (value, options = {}) =>
    new TextRun({ text: String(value ?? ""), font, size: 20, ...options });
  const paragraph = (children, options = {}) =>
    new Paragraph({
      children: Array.isArray(children) ? children : [text(children)],
      spacing: { after: 100, line: 280 },
      ...options,
    });
  const cell = (children, width, options = {}) =>
    new TableCell({
      width: { size: width, type: WidthType.DXA },
      borders,
      margins: { top: 120, bottom: 120, left: 150, right: 150 },
      shading: { type: ShadingType.CLEAR, fill: "FAFAFA" },
      children,
      ...options,
    });
  const table = (widths, rows) =>
    new Table({
      width: { size: widths.reduce((sum, width) => sum + width, 0), type: WidthType.DXA },
      columnWidths: widths,
      rows,
    });
  const section = (title) =>
    paragraph(text(title, { bold: true, color: orange, size: 22 }), {
      border: { bottom: { style: BorderStyle.SINGLE, size: 10, color: orange } },
      spacing: { before: 260, after: 130 },
    });
  const fullWidth = 9638;
  const labelWidth = 2850;
  const valueWidth = fullWidth - labelWidth;
  const fieldRow = (label, value) =>
    new TableRow({
      children: [
        cell([paragraph(text(label, { bold: true, size: 18 }))], labelWidth, {
          shading: { type: ShadingType.CLEAR, fill: "F3F4F6" },
        }),
        cell([paragraph(text(value, { size: 19 }))], valueWidth, {
          shading: { type: ShadingType.CLEAR, fill: "FFFFFF" },
        }),
      ],
    });
  const paymentTypes = ["Registration", "Instalments", "Exam fee", "Other"]
    .map(
      (type) =>
        `${receipt.paymentType === type ? "☒" : "☐"} ${type}${type === "Other" && receipt.paymentType === type ? ": ______" : ""}`,
    )
    .join("    ");
  const modeChoices =
    ["Cash", "UPI", "Cheque", "Bank transfer"]
      .map((mode) => `${receipt.paymentMode.selected === mode ? "☒" : "☐"} ${mode}`)
      .join("    ") +
    (receipt.paymentMode.selected === "Other" ? `    Other: ${receipt.paymentMode.other}` : "");
  const logoBuffer = await fetch(logoUrl).then((response) => {
    if (!response.ok) throw new Error(`Could not load receipt logo (${response.status}).`);
    return response.arrayBuffer();
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 850, right: 1134, bottom: 850, left: 1134 },
          },
        },
        children: [
          table(
            [2700, 6938],
            [
              new TableRow({
                children: [
                  cell(
                    [
                      paragraph(
                        new ImageRun({
                          type: "png",
                          data: logoBuffer,
                          transformation: { width: 150, height: 53 },
                          altText: {
                            title: "Skill AI",
                            description: "Skill AI logo",
                            name: "logo",
                          },
                        }),
                      ),
                    ],
                    2700,
                    {
                      borders: {
                        top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                        bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                        left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                        right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                      },
                      shading: { type: ShadingType.CLEAR, fill: "FFFFFF" },
                    },
                  ),
                  cell(
                    [
                      paragraph(text("FEE RECEIPT", { bold: true, size: 32, color: orange }), {
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 120 },
                      }),
                      paragraph(
                        [
                          text("Receipt No.: ", { bold: true }),
                          text(receipt.receiptNumber),
                          text("     Date: ", { bold: true }),
                          text(receipt.date),
                        ],
                        { alignment: AlignmentType.RIGHT },
                      ),
                    ],
                    6938,
                    {
                      borders: {
                        top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                        bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                        left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                        right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                      },
                      shading: { type: ShadingType.CLEAR, fill: "FFFFFF" },
                    },
                  ),
                ],
              }),
            ],
          ),
          paragraph("", {
            border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: orange } },
            spacing: { after: 180 },
          }),
          section("1. STUDENT DETAILS"),
          table(
            [labelWidth, valueWidth],
            [
              fieldRow("Student Name", receipt.studentName),
              fieldRow("Admission No.", receipt.admissionNumber),
              fieldRow("Course / Batch", receipt.courseBatch),
            ],
          ),
          section("2. PAYMENT TOWARDS & MODE"),
          table(
            [labelWidth, valueWidth],
            [fieldRow("Payment towards", paymentTypes), fieldRow("Payment mode", modeChoices)],
          ),
          section("3. PAYMENT DETAILS"),
          table(
            [labelWidth, valueWidth],
            [
              fieldRow("Amount received (Rs.)", `₹${receipt.amount.toLocaleString("en-IN")}`),
              fieldRow("Amount in words", receipt.amountInWords),
            ],
          ),
          section("4. BALANCE & DUE DATE"),
          table(
            [labelWidth, valueWidth],
            [
              fieldRow(
                "Balance fee after this payment (Rs.)",
                `₹${receipt.balance.toLocaleString("en-IN")}`,
              ),
              fieldRow("Next due date", receipt.nextDueDate),
            ],
          ),
          paragraph(text("Accounts Officer", { bold: true, size: 19 }), {
            spacing: { before: 400, after: 100 },
          }),
          table(
            [fullWidth],
            [
              new TableRow({
                children: [
                  cell(
                    [
                      paragraph(" ", { border: { bottom: border }, spacing: { after: 80 } }),
                      paragraph(text("Sign / Date", { bold: true, size: 17 }), {
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 0 },
                      }),
                    ],
                    fullWidth,
                    {
                      borders: {
                        top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                        left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                        right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                        bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                      },
                      shading: { type: ShadingType.CLEAR, fill: "FFFFFF" },
                    },
                  ),
                ],
              }),
            ],
          ),
        ],
      },
    ],
  });
  const blob = await Packer.toBlob(doc);
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = `Skill_AI_Fee_Receipt_${receipt.receiptNumber}.docx`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
}
