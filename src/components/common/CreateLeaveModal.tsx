import { useState, useEffect, useMemo } from 'react';
import { Modal, Form, DatePicker, Select, Input, Typography } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { LeaveType, LeaveRecord, Employee, LEAVE_TYPE_LABELS } from '../../types';
import './CreateLeaveModal.css';

const { TextArea } = Input;
const { Text } = Typography;

interface CreateLeaveModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: {
        startDate: string;
        endDate: string;
        type: LeaveType;
        description: string;
        employeeId?: string;
    }) => void;
    initialValues?: LeaveRecord | null;
    employees?: Employee[];
}

const leaveTypeOptions = Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
}));

const CreateLeaveModal: React.FC<CreateLeaveModalProps> = ({
    open,
    onClose,
    onSubmit,
    initialValues,
    // employees prop kept for backwards compatibility but not used
    // since users can only create leaves for themselves
}) => {
    const [form] = Form.useForm();
    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);

    const isEditMode = !!initialValues;

    // Calculate working days (excluding Saturday and Sunday)
    const workingDays = useMemo(() => {
        if (!startDate || !endDate) return 0;

        let count = 0;
        let current = startDate.startOf('day');
        const end = endDate.startOf('day');

        while (current.isBefore(end) || current.isSame(end, 'day')) {
            const dayOfWeek = current.day();
            // 0 = Sunday, 6 = Saturday
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                count++;
            }
            current = current.add(1, 'day');
        }

        return count;
    }, [startDate, endDate]);

    // Reset/prefill form when modal opens
    useEffect(() => {
        if (open) {
            if (initialValues) {
                // Edit mode - prefill form
                const start = dayjs(initialValues.startDate);
                const end = dayjs(initialValues.endDate);
                form.setFieldsValue({
                    startDate: start,
                    endDate: end,
                    leaveType: initialValues.type,
                    employeeId: initialValues.employeeId,
                    description: '',
                });
                setStartDate(start);
                setEndDate(end);
            } else {
                // Create mode - reset form
                form.resetFields();
                setStartDate(null);
                setEndDate(null);
            }
        }
    }, [open, form, initialValues]);

    const handleOk = () => {
        form.validateFields().then(values => {
            onSubmit({
                startDate: values.startDate.format('YYYY-MM-DD'),
                endDate: values.endDate.format('YYYY-MM-DD'),
                type: values.leaveType,
                description: values.description || '',
                employeeId: values.employeeId,
            });
            onClose();
        });
    };

    const handleStartDateChange = (date: Dayjs | null) => {
        setStartDate(date);
        // If end date is before start date, reset it
        if (date && endDate && endDate.isBefore(date)) {
            form.setFieldValue('endDate', null);
            setEndDate(null);
        }
    };

    const handleEndDateChange = (date: Dayjs | null) => {
        setEndDate(date);
    };

    // Disable dates before start date for end date picker
    const disabledEndDate = (current: Dayjs) => {
        if (!startDate) return false;
        return current.isBefore(startDate, 'day');
    };

    return (
        <Modal
            title={isEditMode ? "Edit Leave Request" : "Create Leave Request"}
            open={open}
            onOk={handleOk}
            onCancel={onClose}
            okText={isEditMode ? "Update" : "Submit Request"}
            cancelText="Cancel"
            width={480}
            className="create-leave-modal"
        >
            <Form
                form={form}
                layout="vertical"
                className="leave-form"
            >
                <div className="date-row">
                    <Form.Item
                        name="startDate"
                        label="Start Date"
                        rules={[{ required: true, message: 'Please select start date' }]}
                        className="date-field"
                    >
                        <DatePicker
                            format="DD MMM YYYY"
                            placeholder="Select start date"
                            onChange={handleStartDateChange}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="endDate"
                        label="End Date"
                        rules={[{ required: true, message: 'Please select end date' }]}
                        className="date-field"
                    >
                        <DatePicker
                            format="DD MMM YYYY"
                            placeholder="Select end date"
                            onChange={handleEndDateChange}
                            disabledDate={disabledEndDate}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </div>

                {startDate && endDate && (
                    <div className="working-days-display">
                        <Text className="working-days-label">Working Days:</Text>
                        <Text className="working-days-value">{workingDays} day{workingDays !== 1 ? 's' : ''}</Text>
                        <Text className="working-days-note">(excluding weekends)</Text>
                    </div>
                )}

                <Form.Item
                    name="leaveType"
                    label="Leave Type"
                    rules={[{ required: true, message: 'Please select leave type' }]}
                >
                    <Select
                        placeholder="Select leave type"
                        options={leaveTypeOptions}
                    />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description"
                >
                    <TextArea
                        rows={3}
                        placeholder="Enter reason for leave (optional)"
                        maxLength={500}
                        showCount
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateLeaveModal;
