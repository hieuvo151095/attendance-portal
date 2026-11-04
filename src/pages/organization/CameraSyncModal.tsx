import React, { useState, useEffect } from 'react';
import { PopupModal, Button, SelectField, InlineNotice, Avatar, StatusTag } from '../../design-system';
import { Employee, CameraFaceSyncPayload } from '../../types/employee';
import { employeeService } from '../../services/employee';

export interface CameraSyncModalProps {
  open: boolean;
  onClose: () => void;
  tenantId: string;
  employee: Employee | null;
  onSuccess: () => void;
}

const AVAILABLE_CAMERAS = [
  'Camera AI Hikvision Cổng 1 - Trụ sở chính (IP: 192.168.1.120)',
  'Camera AI Hikvision Cổng 2 - Hội trường họp (IP: 192.168.1.121)',
  'Camera AI Hikvision Cổng Phân xưởng / Khám bệnh (IP: 192.168.1.122)'
];

const SAMPLE_CAPTURE_PHOTOS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300'
];

export const CameraSyncModal: React.FC<CameraSyncModalProps> = ({
  open,
  onClose,
  tenantId,
  employee,
  onSuccess
}) => {
  const [selectedCamera, setSelectedCamera] = useState(AVAILABLE_CAMERAS[0]);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState(SAMPLE_CAPTURE_PHOTOS[0]);
  const [matchScore, setMatchScore] = useState(98.8);
  const [isSimulatingCapture, setIsSimulatingCapture] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState(false);

  useEffect(() => {
    if (!open) {
      setSyncSuccess(false);
      setError(null);
      return;
    }

    if (employee?.avatarUrl) {
      setCapturedPhotoUrl(employee.avatarUrl);
    } else {
      // Pick random sample capture photo
      const idx = Math.floor(Math.random() * SAMPLE_CAPTURE_PHOTOS.length);
      setCapturedPhotoUrl(SAMPLE_CAPTURE_PHOTOS[idx]);
    }
    setMatchScore(+(97.5 + Math.random() * 2.3).toFixed(1));
    setSyncSuccess(false);
    setError(null);
  }, [open, employee]);

  const handleCaptureFromCamera = () => {
    setIsSimulatingCapture(true);
    setTimeout(() => {
      const idx = Math.floor(Math.random() * SAMPLE_CAPTURE_PHOTOS.length);
      setCapturedPhotoUrl(SAMPLE_CAPTURE_PHOTOS[idx]);
      setMatchScore(+(98.0 + Math.random() * 1.8).toFixed(1));
      setIsSimulatingCapture(false);
    }, 600);
  };

  const handleConfirmSync = async () => {
    if (!employee) return;
    setError(null);

    try {
      setIsSyncing(true);
      const payload: CameraFaceSyncPayload = {
        employeeId: employee.id,
        avatarUrl: capturedPhotoUrl,
        deviceName: selectedCamera.split(' (')[0],
        faceScore: matchScore
      };

      await employeeService.syncFaceIdFromCamera(tenantId, payload);
      setSyncSuccess(true);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi đồng bộ dữ liệu Face ID từ camera';
      setError(msg);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!employee) return null;

  return (
    <PopupModal
      open={open}
      title="Đồng bộ Face ID từ Camera Hikvision"
      description="Lấy dữ liệu ảnh chân dung và vector nhận diện khuôn mặt được đăng ký từ camera sang Portal."
      icon="camera"
      width={580}
      onClose={onClose}
      primaryAction={{
        label: isSyncing
          ? 'Đang đồng bộ...'
          : syncSuccess
          ? 'Đã đồng bộ xong'
          : 'Lưu Face ID vào hồ sơ',
        icon: 'circle-check',
        onClick: handleConfirmSync,
        disabled: isSyncing || syncSuccess
      }}
      secondaryAction={{
        label: 'Đóng',
        onClick: onClose,
        disabled: isSyncing
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        {error && (
          <InlineNotice tone="danger" label={error} />
        )}

        {syncSuccess && (
          <InlineNotice
            tone="success"
            label={`Dữ liệu Face ID của nhân viên "${employee.fullName}" đã được nạp thành công từ camera vào Portal!`}
          />
        )}

        {/* Employee Summary Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-12)',
            padding: 'var(--space-12) var(--space-16)',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-8)',
            border: '1px solid var(--border-default)'
          }}
        >
          <Avatar
            src={employee.avatarUrl}
            name={employee.fullName}
            size="md"
          />
          <div style={{ flex: 1 }}>
            <div className="body-sm-bold" style={{ color: 'var(--text-heading)' }}>
              {employee.fullName} ({employee.employeeCode})
            </div>
            <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>
              Chức vụ: <b>{employee.position}</b> | CCCD: {employee.identityNumber}
            </div>
          </div>
          <div>
            {employee.faceIdStatus === 'enrolled' ? (
              <StatusTag tone="success" label="Đã có Face ID" icon="circle-check" />
            ) : (
              <StatusTag tone="warning" label="Chờ lấy mẫu" icon="camera" />
            )}
          </div>
        </div>

        {/* Camera Selector */}
        <div>
          <label
            htmlFor="camera-device-select"
            className="body-sm-medium"
            style={{ display: 'block', marginBottom: 'var(--space-6)', color: 'var(--text-heading)' }}
          >
            Chọn thiết bị Camera Hikvision kết nối
          </label>
          <SelectField
            id="camera-device-select"
            options={AVAILABLE_CAMERAS}
            value={selectedCamera}
            onChange={(val) => setSelectedCamera(val)}
            disabled={isSyncing}
            style={{ width: '100%' }}
          />
        </div>

        {/* Camera Live Preview & Portrait Capture */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '160px 1fr',
            gap: 'var(--space-16)',
            padding: 'var(--space-16)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-12)'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '140px',
                height: '170px',
                borderRadius: 'var(--radius-8)',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-muted)',
                border: '2px solid var(--eco-blue-strong)',
                margin: '0 auto var(--space-8)'
              }}
            >
              <img
                src={capturedPhotoUrl}
                alt="Portrait capture from camera"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
            <Button
              variant="secondary"
              icon="arrows-rotate"
              disabled={isSimulatingCapture || isSyncing}
              onClick={handleCaptureFromCamera}
              block
            >
              {isSimulatingCapture ? 'Đang chụp...' : 'Chụp lại'}
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-10)', justifyContent: 'center' }}>
            <div>
              <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                Độ chuẩn xác nhận diện khuôn mặt:
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', marginTop: 'var(--space-4)' }}>
                <span className="h3" style={{ color: 'var(--semantic-success)' }}>
                  {matchScore}%
                </span>
                <StatusTag tone="success" label="Đạt chuẩn ISO/IEC 19794" />
              </div>
            </div>

            <div className="body-xs" style={{ color: 'var(--text-subtle)', lineHeight: 1.5 }}>
              <div>• <b>Chuẩn ảnh:</b> 640 x 480 px, màu RGB 24-bit.</div>
              <div>• <b>Thuật toán:</b> Finviet DeepFace AI v3.2 tích hợp trên Camera Hikvision.</div>
              <div>• <b>Thời điểm thu nhận:</b> {new Date().toLocaleTimeString('vi-VN')} hôm nay.</div>
            </div>
          </div>
        </div>

        <div
          className="body-xs"
          style={{
            padding: 'var(--space-12)',
            backgroundColor: 'var(--semantic-info-soft)',
            borderRadius: 'var(--radius-8)',
            color: 'var(--semantic-info-strong)'
          }}
        >
          ℹ️ Dữ liệu khuôn mặt sau khi xác nhận sẽ được gán vĩnh viễn vào hồ sơ nhân viên để thực hiện chấm công và điểm danh cuộc họp tức thì.
        </div>
      </div>
    </PopupModal>
  );
};
