import express from "express";
import multer from "multer";
import AdmZip from "adm-zip";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const storage = multer.memoryStorage();
const upload = multer({ storage });

// 🟣 استقبال الصور وإنشاء الملف zip
app.post("/upload", upload.array("images"), (req, res) => {
  const zip = new AdmZip();
  const files = req.files;
  const zipName = req.body.zipName?.trim() || "chapter";

  if (!files || files.length === 0) {
    return res.status(400).send("لم يتم رفع أي صور 😅");
  }

  // 🔢 ترقيم الصور وإضافتها داخل ZIP
  files.forEach((file, index) => {
    const ext = path.extname(file.originalname) || ".jpg";
    zip.addFile(`${index + 1}${ext}`, file.buffer);
  });

  const zipBuffer = zip.toBuffer();

  // ✅ إصلاح مشكلة اللغة العربية في الاسم
  const safeName = encodeURIComponent(zipName) + ".zip";

  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename*=UTF-8''${safeName}`
  );

  res.send(zipBuffer);
});

// 🟩 تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ السيرفر يعمل على: http://localhost:${PORT}`)
);