import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ManagerActivity } from "@/services/managerService";
import { managerService } from "@/services/managerService";
import { toast } from "sonner";

interface EditActivityModalProps {
  activity: ManagerActivity;
  onUpdated: () => void;
}

const ManagerEditActivityModal: React.FC<EditActivityModalProps> = ({ activity, onUpdated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: activity.title || "",
    description: activity.description || "",
    location: activity.location || "",
    type: activity.type || "general",
    startTime: activity.startTime ? new Date(activity.startTime).toISOString().slice(0, 16) : "",
    endTime: activity.endTime ? new Date(activity.endTime).toISOString().slice(0, 16) : "",
    start_checkin_time: activity.start_checkin_time ? new Date(activity.start_checkin_time).toISOString().slice(0, 16) : "",
    end_checkin_time: activity.end_checkin_time ? new Date(activity.end_checkin_time).toISOString().slice(0, 16) : "",
    maxParticipants: activity.maxParticipants?.toString() || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate check-in times
    if (formData.start_checkin_time && formData.end_checkin_time) {
      const startCheckIn = new Date(formData.start_checkin_time);
      const endCheckIn = new Date(formData.end_checkin_time);
      
      if (endCheckIn <= startCheckIn) {
        toast.error("Thời gian kết thúc điểm danh phải lớn hơn thời gian bắt đầu điểm danh");
        return;
      }
    }
    
    setLoading(true);
    try {
      await managerService.updateActivity(activity._id, {
        ...formData,
        startTime: formData.startTime ? new Date(formData.startTime).toISOString() : undefined,
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : undefined,
        start_checkin_time: formData.start_checkin_time ? new Date(formData.start_checkin_time).toISOString() : undefined,
        end_checkin_time: formData.end_checkin_time ? new Date(formData.end_checkin_time).toISOString() : undefined,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
      });
      toast.success("Đã cập nhật hoạt động");
      setOpen(false);
      onUpdated();
    } catch (error) {
      console.error("Không thể cập nhật hoạt động", error);
      toast.error("Không thể cập nhật hoạt động");
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
          <input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full px-3 py-2 rounded border" />
          <input type="datetime-local" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full px-3 py-2 rounded border" />
          <div className="border-t pt-4 mt-4">
            <label className="block text-sm font-medium mb-2">Thời gian điểm danh</label>
            <input 
              type="datetime-local" 
              name="start_checkin_time" 
              value={formData.start_checkin_time} 
              onChange={handleChange} 
              placeholder="Bắt đầu điểm danh"
              className="w-full px-3 py-2 rounded border mb-2" 
            />
            <input 
              type="datetime-local" 
              name="end_checkin_time" 
              value={formData.end_checkin_time} 
              onChange={handleChange} 
              placeholder="Kết thúc điểm danh"
              className="w-full px-3 py-2 rounded border" 
            />
            <p className="text-xs text-gray-500 mt-1">Thời gian kết thúc phải lớn hơn thời gian bắt đầu</p>
          </div>
          <input name="maxParticipants" value={formData.maxParticipants} onChange={handleChange} placeholder="Số lượng tối đa" className="w-full px-3 py-2 rounded border" type="number" min="0" />
          <DialogFooter className="flex gap-2 justify-end">
            <Button type="submit" disabled={loading}>LƯU</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>HỦY</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ManagerEditActivityModal;
