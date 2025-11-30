import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { adminService } from "@/services/adminService";

const NotificationModal: React.FC<{ trigger: React.ReactNode }> = ({ trigger }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      adminService.getNotifications()
        .then((data) => setNotifications(data))
        .finally(() => setLoading(false));
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Danh sách thông báo</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {loading && <div>Đang tải...</div>}
          {!loading && notifications.length === 0 && <div>Không có thông báo nào.</div>}
          {!loading && notifications.map((n) => (
            <div key={n._id} className="border-b pb-2">
              <div className="font-semibold">{n.title}</div>
              <div className="text-xs text-slate-400">{n.scheduleAt}</div>
              <div>{n.message}</div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationModal;
