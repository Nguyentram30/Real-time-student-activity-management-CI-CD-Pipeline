import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { StudentProfile } from "@/types/admin";

interface StudentProfileModalProps {
  student: StudentProfile;
}

const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ student }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="inline-flex items-center gap-2 text-sm px-3 py-1 rounded-xl border border-white/10 hover:bg-white/10 text-blue-900">
          Xem hồ sơ
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thông tin sinh viên</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <p><strong>MSSV:</strong> {student.studentId}</p>
          <p><strong>Họ tên:</strong> {student.fullName}</p>
          <p><strong>Khoa:</strong> {student.faculty}</p>
          <p><strong>Tình trạng hoạt động:</strong> {student.activityStatus}</p>
          <p><strong>Tiến độ học tập:</strong> {student.progressPercent}%</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudentProfileModal;
