import multer from "multer";

const memoryStorage = multer.memoryStorage();

/* =========================================================
   COURSE IMAGES
========================================================= */

const imageFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new Error("Only JPG, JPEG, PNG and WEBP images are allowed"),
      false,
    );
  }

  cb(null, true);
};

export const uploadCourseImages = multer({
  storage: memoryStorage,

  fileFilter: imageFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).fields([
  {
    name: "thumbnail",
    maxCount: 1,
  },
]);

/* =========================================================
   MARKDOWN FILE
========================================================= */

const markdownFilter = (req, file, cb) => {
  const allowedTypes = [
    "text/markdown",
    "text/plain",
    "application/octet-stream",
  ];

  const isMarkdownExtension = file.originalname.toLowerCase().endsWith(".md");

  if (!allowedTypes.includes(file.mimetype) && !isMarkdownExtension) {
    return cb(new Error("Only Markdown (.md) files are allowed"), false);
  }

  cb(null, true);
};

export const uploadLessonMarkdown = multer({
  storage: memoryStorage,

  fileFilter: markdownFilter,

  limits: {
    fileSize: 2 * 1024 * 1024,
  },
}).single("lessonFile");

export const uploadMultipleLessonMarkdown = multer({
  storage: memoryStorage,

  fileFilter: markdownFilter,

  limits: {
    fileSize: 2 * 1024 * 1024,
  },
}).array("lessonFiles", 50);

/* =========================================================
   LESSON MARKDOWN + MCQ CSV (combined)
   Fields: "lessonFile" (.md) + "lessonMcqCsv" (.csv)
========================================================= */

export const uploadLessonWithMcq = multer({
  storage: memoryStorage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const name = file.originalname.toLowerCase();

    const isMd =
      file.mimetype === "text/markdown" ||
      file.mimetype === "text/plain" ||
      name.endsWith(".md");

    const isCsv = name.endsWith(".csv");

    if (!isMd && !isCsv) {
      return cb(
        new Error("Only Markdown (.md) and CSV (.csv) files are allowed"),
        false,
      );
    }

    cb(null, true);
  },
}).fields([
  { name: "lessonFile", maxCount: 1 },
  { name: "lessonMcqCsv", maxCount: 1 },
]);

/* =========================================================
   CSV FILE
========================================================= */

const csvFilter = (req, file, cb) => {
  const isCsv = file.originalname.toLowerCase().endsWith(".csv");

  if (!isCsv) {
    return cb(new Error("Only CSV files are allowed"), false);
  }

  cb(null, true);
};

export const uploadCsv = multer({
  storage: memoryStorage,

  fileFilter: csvFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("csvFile");

/* =========================================================
   COMPANY PROFILE FILES
   Fields: "logo" (image) + "document" (image/pdf)
========================================================= */

const companyDocumentFilter = (req, file, cb) => {
  const allowedImages = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  const allowedPdfs = ["application/pdf"];

  if (
    allowedImages.includes(file.mimetype) ||
    allowedPdfs.includes(file.mimetype)
  ) {
    return cb(null, true);
  }

  cb(
    new Error("Only JPG, PNG, WEBP images and PDF documents are allowed"),
    false,
  );
};

export const uploadCompanyProfileFiles = multer({
  storage: memoryStorage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const name = file.fieldname;

    if (name === "logo") {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg",
      ];
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error("Logo must be a JPG, PNG or WEBP image"), false);
      }
      return cb(null, true);
    }

    if (name === "document") {
      return companyDocumentFilter(req, file, cb);
    }

    cb(new Error("Unknown file field for company upload"), false);
  },
}).fields([
  { name: "logo", maxCount: 1 },
  { name: "document", maxCount: 1 },
]);

/* =========================================================
   STUDENT PROFILE FILES
   Field: "avatar" (image)
========================================================= */

export const uploadStudentFiles = multer({
  storage: memoryStorage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

    if (file.fieldname !== "avatar") {
      return cb(new Error("Unknown file field for student upload"), false);
    }

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Avatar must be a JPG, PNG or WEBP image"), false);
    }

    cb(null, true);
  },
}).fields([{ name: "avatar", maxCount: 1 }]);
