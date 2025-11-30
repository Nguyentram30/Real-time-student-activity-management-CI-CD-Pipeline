import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { AdminActivity } from "@/types/admin";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";

interface EditActivityModalProps {
  activity: AdminActivity;
  onUpdated: () => void;
}

export const EditActivityModal: React.FC<EditActivityModalProps> = ({ activity, onUpdated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: activity.title || "",
    description: activity.description || "",
    location: activity.location || "",
    type: activity.type || "general",
    startTime: activity.startTime ? new Date(activity.startTime).toISOString().slice(0, 16) : "",
    endTime: activity.endTime ? new Date(activity.endTime).toISOString().slice(0, 16) : "",
    maxParticipants: activity.maxParticipants?.toString() || "",
    coverImage: activity.coverImage || "",
    documentUrl: activity.documentUrl || "",
  });

  useEffect(() => {
    // reset form when activity prop changes or when modal opened
    setFormData({
      title: activity.title || "",
      description: activity.description || "",
      location: activity.location || "",
      type: activity.type || "general",
      startTime: activity.startTime ? new Date(activity.startTime).toISOString().slice(0, 16) : "",
      endTime: activity.endTime ? new Date(activity.endTime).toISOString().slice(0, 16) : "",
      maxParticipants: activity.maxParticipants?.toString() || "",
      coverImage: activity.coverImage || "",
      documentUrl: activity.documentUrl || "",
    });
  }, [activity, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminService.updateActivity(activity._id, {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
      });
      toast.success("Đã cập nhật hoạt động");
      setOpen(false);
      onUpdated();
    } catch (error) {
      const message = (error as any)?.response?.data?.message || (error as any)?.message || "Không thể cập nhật hoạt động";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-xs px-3 py-1 border border-white/20 hover:bg-white/10">Chỉnh sửa</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa hoạt động</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="title" value={formData.title} onChange={handleChange} placeholder="Tên hoạt động" className="w-full px-3 py-2 rounded border" required />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Mô tả" className="w-full px-3 py-2 rounded border" />
          <input name="location" value={formData.location} onChange={handleChange} placeholder="Địa điểm" className="w-full px-3 py-2 rounded border" />
          <select name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 rounded border">
            <option value="general">Chung</option>
            <option value="event">Sự kiện</option>
            <option value="training">Đào tạo</option>
          </select>
          <input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full px-3 py-2 rounded border" required />
          <input type="datetime-local" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full px-3 py-2 rounded border" required />
          <input name="maxParticipants" value={formData.maxParticipants} onChange={handleChange} placeholder="Số lượng tối đa" className="w-full px-3 py-2 rounded border" type="number" min="0" />
          <input name="coverImage" value={formData.coverImage} onChange={handleChange} placeholder="URL ảnh bìa" className="w-full px-3 py-2 rounded border" />
          <input name="documentUrl" value={formData.documentUrl} onChange={handleChange} placeholder="URL tài liệu" className="w-full px-3 py-2 rounded border" />
          <DialogFooter className="flex gap-2 justify-end">
            <Button type="submit" disabled={loading}>LƯU</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>HỦY</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditActivityModal;
