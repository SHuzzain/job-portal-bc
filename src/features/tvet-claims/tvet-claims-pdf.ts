import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type ClaimPdfData = {
  id: string;
  claimAmount: string;
  courseTitle: string;
  courseStartsAt: string;
  courseEndsAt: string;
  providerName: string;
  createdAt: string;
};

function printable(value: string) {
  return value.replace(/[^\x20-\x7E]/g, "?");
}

function date(value: string) {
  return new Intl.DateTimeFormat("en-MY", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(new Date(value));
}

export async function createClaimPdf(
  kind: "PAYMENT_VOUCHER" | "BORANG_AKUAN",
  data: ClaimPdfData,
) {
  const document = await PDFDocument.create();
  const page = document.addPage([595, 842]);
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const navy = rgb(0.08, 0.18, 0.34);
  const title =
    kind === "PAYMENT_VOUCHER" ? "PAYMENT VOUCHER" : "BORANG AKUAN TERIMA";

  page.drawText("TALENT PERAK 2.0", {
    x: 48,
    y: 780,
    size: 12,
    font: bold,
    color: navy,
  });
  page.drawText(title, { x: 48, y: 730, size: 24, font: bold, color: navy });

  const rows = [
    ["Claim reference", data.id],
    ["Training provider", printable(data.providerName)],
    ["Course", printable(data.courseTitle)],
    [
      "Course period",
      `${date(data.courseStartsAt)} - ${date(data.courseEndsAt)}`,
    ],
    ["Claim amount", `RM ${data.claimAmount}`],
    ["Claim submitted", date(data.createdAt)],
  ];
  rows.forEach(([label, value], index) => {
    const y = 665 - index * 48;
    page.drawText(label, { x: 48, y, size: 10, font: bold, color: navy });
    page.drawText(value, { x: 190, y, size: 10, font: regular });
  });

  const note =
    kind === "PAYMENT_VOUCHER"
      ? "Authorized finance document for the approved TVET training claim."
      : "I acknowledge receipt of the payment stated above.";
  page.drawText(note, { x: 48, y: 340, size: 11, font: regular });

  if (kind === "BORANG_AKUAN") {
    page.drawLine({ start: { x: 48, y: 210 }, end: { x: 270, y: 210 } });
    page.drawText("Authorized provider signature", {
      x: 48,
      y: 190,
      size: 9,
      font: regular,
    });
    page.drawLine({ start: { x: 330, y: 210 }, end: { x: 520, y: 210 } });
    page.drawText("Date", { x: 330, y: 190, size: 9, font: regular });
  }

  page.drawText(`Generated ${date(new Date().toISOString())}`, {
    x: 48,
    y: 60,
    size: 8,
    font: regular,
    color: navy,
  });
  return document.save();
}
