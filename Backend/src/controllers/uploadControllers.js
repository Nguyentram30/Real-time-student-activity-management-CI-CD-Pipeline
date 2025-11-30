import { upload, getFileUrl } from "../utils/uploadMiddleware.js";
import Document from "../models/Document.js";

// Upload file chung (hình ảnh, tài liệu)
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Không có file được upload" });
    }

    const fileUrl = getFileUrl(req.file.filename);
    // If uploader is a manager, create a Document record so Admin can see it
    let createdDocument = null;
    try {
      if (req.user && req.user.role === "manager") {
        const docPayload = {
          title: req.body.title || req.file.originalname,
          fileUrl: fileUrl,
          mimeType: req.file.mimetype,
          uploadedBy: req.user._id,
          updatedBy: req.user._id,
          accessScope: req.body.accessScope || "manager",
          description: req.body.description || undefined,
        };
        if (req.body.activityId) docPayload.activity = req.body.activityId;
        const doc = await Document.create(docPayload);
        createdDocument = doc;
      }
    } catch (err) {
      console.error("Không thể tạo record Document:", err);
    }

    res.json({
      success: true,
      fileUrl: fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      document: createdDocument,
    });
  } catch (error) {
    console.error("Lỗi upload file:", error);
    res.status(500).json({ message: "Không thể upload file" });
  }
};

// Upload nhiều file
export const uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Không có file được upload" });
    }

    const files = req.files.map((file) => ({
      fileUrl: getFileUrl(file.filename),
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
    }));

    res.json({
      success: true,
      files: files,
    });
  } catch (error) {
    console.error("Lỗi upload files:", error);
    res.status(500).json({ message: "Không thể upload files" });
  }
};

