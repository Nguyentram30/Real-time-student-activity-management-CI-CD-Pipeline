import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { AdminActivity, ActivityParticipant } from "@/types/admin";
import { adminService } from "@/services/adminService";

interface ActivityDetailModalProps {
    activity: AdminActivity;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({ activity }) => {
    const [open, setOpen] = useState(false);
    const [detail, setDetail] = useState<AdminActivity | null>(null);
    const [loading, setLoading] = useState(false);

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return "-";
        try {
            return format(new Date(dateStr), "dd/MM/yyyy HH:mm");
        } catch {
            return dateStr;
        }
    };

    useEffect(() => {
        if (open) {
            setLoading(true);
            adminService.getActivityDetail(activity._id)
                .then((data) => setDetail(data))
                .finally(() => setLoading(false));
        }
    }, [open, activity._id]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="text-sm px-3 py-1">
                    Xem chi tiết
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{detail?.title || activity.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4 text-sm text-gray-700">
                    <p><strong>Mô tả:</strong> {detail?.description || activity.description || "-"}</p>
                    <p><strong>Loại hoạt động:</strong> {detail?.type || activity.type || "-"}</p>
                    <p><strong>Thời gian bắt đầu:</strong> {formatDate(detail?.startTime || activity.startTime)}</p>
                    <p><strong>Thời gian kết thúc:</strong> {formatDate(detail?.endTime || activity.endTime)}</p>
                    <p><strong>Địa điểm:</strong> {detail?.location || activity.location || "-"}</p>
                    <p><strong>Số lượng sinh viên tham gia:</strong> {detail?.maxParticipants ?? activity.maxParticipants ?? "Không giới hạn"}</p>
                    <p><strong>Người tạo:</strong> {detail?.createdBy?.displayName || activity.createdBy?.displayName || "-"}</p>
                    <p><strong>Trạng thái:</strong> {detail?.status || activity.status}</p>
                    {detail?.coverImage && (
                        <div>
                            <strong>Ảnh bìa:</strong>
                            <img src={detail.coverImage} alt="Cover" className="mt-2 max-h-48 w-full object-cover rounded" />
                        </div>
                    )}
                    {detail?.documentUrl && (
                        <p>
                            <strong>Tài liệu đính kèm:</strong>{" "}
                            <a href={detail.documentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                Xem tài liệu
                            </a>
                        </p>
                    )}
                    <div>
                        <strong>Danh sách sinh viên đã đăng ký:</strong>
                        {loading && <div>Đang tải...</div>}
                        {!loading && detail?.participants && detail.participants.length > 0 ? (
                            <ul className="mt-2 list-disc pl-5">
                                {detail.participants.map((p, idx) => (
                                    <li key={idx}>
                                        {p.displayName} ({p.email}) - <span className="italic">{p.status}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (!loading && <div>Chưa có sinh viên đăng ký</div>)}
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => setOpen(false)}>Đóng</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
