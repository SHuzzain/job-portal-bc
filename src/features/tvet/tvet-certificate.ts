import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type CertificatePdfData = {
  recipientName: string;
  courseTitle: string;
  providerName: string;
  venue: string;
  startsAt: string;
  endsAt: string;
  surveyCompletedAt: string;
  certificateCode: string;
};

function printable(value: string) {
  return value.replace(/[^\x20-\x7E]/g, "?");
}

function centeredX(
  text: string,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  size: number,
) {
  return (842 - font.widthOfTextAtSize(text, size)) / 2;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-MY", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(new Date(value));
}

export async function createCertificatePdf(data: CertificatePdfData) {
  const document = await PDFDocument.create();
  const page = document.addPage([842, 595]);
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const navy = rgb(0.08, 0.18, 0.34);
  const gold = rgb(0.72, 0.52, 0.12);

  page.drawRectangle({
    x: 24,
    y: 24,
    width: 794,
    height: 547,
    borderColor: navy,
    borderWidth: 3,
  });
  page.drawRectangle({
    x: 34,
    y: 34,
    width: 774,
    height: 527,
    borderColor: gold,
    borderWidth: 1,
  });

  const heading = "CERTIFICATE OF COMPLETION";
  page.drawText(heading, {
    x: centeredX(heading, bold, 28),
    y: 475,
    size: 28,
    font: bold,
    color: navy,
  });

  const intro = "This certificate is proudly presented to";
  page.drawText(intro, {
    x: centeredX(intro, regular, 14),
    y: 420,
    size: 14,
    font: regular,
    color: navy,
  });

  const recipient = printable(data.recipientName);
  page.drawText(recipient, {
    x: centeredX(recipient, bold, 30),
    y: 365,
    size: 30,
    font: bold,
    color: gold,
  });

  const completion = "for successfully completing";
  page.drawText(completion, {
    x: centeredX(completion, regular, 14),
    y: 325,
    size: 14,
    font: regular,
    color: navy,
  });

  const course = printable(data.courseTitle);
  const courseSize = course.length > 50 ? 19 : 24;
  page.drawText(course, {
    x: Math.max(55, centeredX(course, bold, courseSize)),
    y: 280,
    size: courseSize,
    font: bold,
    color: navy,
  });

  const provider = `Provided by ${printable(data.providerName)}`;
  page.drawText(provider, {
    x: centeredX(provider, regular, 13),
    y: 235,
    size: 13,
    font: regular,
    color: navy,
  });

  const details = `${formatDate(data.startsAt)} - ${formatDate(data.endsAt)} | ${printable(data.venue)}`;
  page.drawText(details, {
    x: centeredX(details, regular, 11),
    y: 205,
    size: 11,
    font: regular,
    color: navy,
  });

  const issued = `Issued ${formatDate(data.surveyCompletedAt)}`;
  page.drawText(issued, {
    x: centeredX(issued, regular, 11),
    y: 145,
    size: 11,
    font: regular,
    color: navy,
  });

  const verification = `Verification code: ${printable(data.certificateCode)}`;
  page.drawText(verification, {
    x: centeredX(verification, bold, 10),
    y: 115,
    size: 10,
    font: bold,
    color: navy,
  });

  page.drawText("Talent Perak 2.0", {
    x: 64,
    y: 65,
    size: 10,
    font: bold,
    color: navy,
  });

  return document.save();
}
