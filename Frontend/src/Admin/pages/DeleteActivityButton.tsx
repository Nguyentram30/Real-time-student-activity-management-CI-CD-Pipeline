import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { AdminActivity } from "@/types/admin";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";

interface DeleteActivityButtonProps {
  activity: AdminActivity;
  onDeleted: () => void;
}

const DeleteActivityButton: React.FC<DeleteActivityButtonProps> = ({ activity, onDeleted }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await adminService.deleteActivity(activity._id);
      toast.success("Đã xoá hoạt động");
      setOpen(false);
      onDeleted();
    } catch (error) {
      toast.error("Không thể xoá hoạt động");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="px-3 py-1 text-xs rounded-full border border-rose-400/30 hover:bg-rose-500/10 text-blue-900">Xoá hoạt động</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Xác nhận xoá hoạt động</DialogTitle>
        </DialogHeader>
        <div className="my-4 text-sm text-red-700">
          Bạn có chắc muốn xoá hoạt động này không? <br /> <b>Dữ liệu không thể khôi phục.</b>
        </div>
        <DialogFooter className="flex gap-2 justify-end">
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>Xác nhận</Button>
          <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteActivityButton;
