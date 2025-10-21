
// 📁 server/routes/mop.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { auth } = require("../middleware/auth");

const router = express.Router();
const MOP_DIR = path.join(__dirname, "../mop");
const DEFAULT_MOP_PATH = path.join(MOP_DIR, "default.txt");

// Ensure the mop folder exists
if (!fs.existsSync(MOP_DIR)) fs.mkdirSync(MOP_DIR);

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, MOP_DIR),
  filename: (req, file, cb) => cb(null, file.originalname), // use original name
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDFs are allowed"));
    }
    cb(null, true);
  },
});

// GET /mop/default — return default MOP filename
router.get("/default", (req, res) => {
  if (!fs.existsSync(DEFAULT_MOP_PATH)) return res.status(404).json({ error: "No default MOP set" });
  const filename = fs.readFileSync(DEFAULT_MOP_PATH, "utf8");
  res.status(200).json({ filename });
});


// GET /mop/list — get list of all MOP files
router.get("/list", auth(["admin"]), (req, res) => {
  fs.readdir(MOP_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: "Failed to read MOP folder" });

    const mopFiles = files
      .filter((f) => f.endsWith(".pdf"))
      .map((filename) => {
        const stats = fs.statSync(path.join(MOP_DIR, filename));
        return {
          filename,
          size: stats.size,
          uploadedAt: stats.mtime,
          isDefault: fs.existsSync(DEFAULT_MOP_PATH)
            ? fs.readFileSync(DEFAULT_MOP_PATH, "utf8") === filename
            : false,
        };
      });

    res.status(200).json(mopFiles);
  });
});

// GET /mop/:filename — serve a specific file
router.get("/:filename", (req, res) => {
  const filePath = path.join(MOP_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send("File not found");
  res.sendFile(filePath);
});

// PATCH /mop/upload — upload a new MOP file
router.patch("/upload", auth(["admin"]), upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  return res.status(200).json({ message: "MOP uploaded successfully", filename: req.file.originalname });
});

// DELETE /mop/:filename — delete a MOP file
router.delete("/:filename", auth(["admin"]), (req, res) => {
  const filePath = path.join(MOP_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });

  fs.unlinkSync(filePath);
  if (fs.existsSync(DEFAULT_MOP_PATH) && fs.readFileSync(DEFAULT_MOP_PATH, "utf8") === req.params.filename) {
    fs.unlinkSync(DEFAULT_MOP_PATH); // unset default if deleted
  }

  res.status(200).json({ message: "MOP deleted" });
});

// PATCH /mop/default — set default MOP
router.patch("/default", auth(["admin"]), (req, res) => {
  const { filename } = req.body;
  const filePath = path.join(MOP_DIR, filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });

  fs.writeFileSync(DEFAULT_MOP_PATH, filename);
  res.status(200).json({ message: "Default MOP set", filename });
});


module.exports = router;
