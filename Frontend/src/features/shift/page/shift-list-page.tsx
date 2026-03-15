import { Card, Button, Tag, Space, Empty, Modal, Spin, Row, Col, Table } from "antd";
import { useContext, useEffect, useState } from "react";
import {
  PlusOutlined,
  EditOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  UserAddOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useLazyGetShiftsQuery, usePublishShiftMutation, useAssignStaffMutation } from "../store/shift.query";
import { Shift } from "@/models/shift-model";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import AuthContext from "@/shared/auth/context/authContext";
import { useLazyGetUsersQuery } from "@/features/user/store/user.query";
import { EnumRoles } from "@/shared/constants/enum/app.enum";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function ShiftListPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [getShifts, shifts] = useLazyGetShiftsQuery();
  const [publishShift, publishResponse] = usePublishShiftMutation();
  const [assignStaff, assignStaffResponse] = useAssignStaffMutation();
  const [getUsers, users] = useLazyGetUsersQuery();
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);

  useEffect(() => {
    if (user?.userLocations && user.userLocations.length > 0) {
      // Get all location IDs that the user is assigned to
      const userLocationIds = user.userLocations.map((ul: any) => ul?.location?.locationId).filter(Boolean);

      // Create filter for locations - using 'in' operator for multiple locations
      const filters = userLocationIds.length > 0 ? [
        userLocationIds.map((locationId: string) => ({
          field: 'locationId',
          operator: '=',
          value: locationId,
        }))
      ] : [];

      getShifts({
        includes: ['location', 'skill', 'assignments'],
        filter: filters.length > 0 ? filters : undefined,
      });
    }
  }, [user?.userLocations]);

  const handleAssignStaff = (shift: Shift) => {
    setSelectedShift(shift);
    setSelectedStaffIds([]);
    setAssignModalVisible(true);

    // Fetch staff for this shift's location with the required skill
    if (shift.locationId && shift.skillId) {
      getUsers({
        includes: ['userLocations', 'userLocations.location', 'skill'],
        filter: [
          [
            {
              field: 'role',
              operator: '=',
              value: EnumRoles.Staff,
            }
          ],
          [
            {
              field: 'userLocations.locationId',
              operator: '=',
              value: shift.locationId,
            }
          ],
          [
            {
              field: 'skillId',
              operator: '=',
              value: shift.skillId,
            }
          ]
        ]
      });
    }
  };

  const handleAssignSelectedStaff = async () => {
    if (!selectedShift || selectedStaffIds.length === 0) {
      return;
    }

    // Check if trying to assign more than remaining headcount
    const existingAssignmentsCount = selectedShift.assignments?.length || 0;
    const remainingHeadcount = selectedShift.requiredHeadcount - existingAssignmentsCount;

    if (selectedStaffIds.length > remainingHeadcount) {
      Modal.warning({
        title: 'Too Many Staff Selected',
        content: `You can only assign ${remainingHeadcount} more staff member(s) to this shift. Currently ${existingAssignmentsCount} out of ${selectedShift.requiredHeadcount} positions are filled. Please deselect ${selectedStaffIds.length - remainingHeadcount} staff member(s).`,
      });
      return;
    }

    try {
      await assignStaff({
        shiftId: selectedShift.shiftId!,
        userIds: selectedStaffIds,
      }).unwrap();

      // Close modal and refresh shifts
      setAssignModalVisible(false);
      setSelectedStaffIds([]);
      setSelectedShift(null);

      // Refresh the shifts list
      getShifts({
        includes: ['location', 'skill', 'assignments', 'assignments.user'],
        filter: user?.userLocations?.map((ul: any) => [
          {
            field: 'locationId',
            operator: '=',
            value: ul.locationId,
          }
        ]) || []
      });
    } catch (error) {
      // Error is handled by the mutation's onQueryStarted
      console.error('Assignment error:', error);
    }
  };

  const handlePublish = (shiftId: string, assignedCount: number) => {
    if (assignedCount === 0) {
      Modal.warning({
        title: 'Cannot Publish Shift',
        content: 'You must assign at least one staff member before publishing this shift.',
      });
      return;
    }

    Modal.confirm({
      title: 'Publish Shift',
      content: 'Are you sure you want to publish this shift? Staff will be able to see it.',
      onOk: () => {
        publishShift(shiftId);
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'published':
        return 'blue';
      case 'completed':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'default';
    }
  };

  const formatTime = (dateTime: Date | string, timezone: string) => {
    return dayjs(dateTime).tz(timezone).format('hh:mm A');
  };

  const formatDate = (dateTime: Date | string, timezone: string) => {
    return dayjs(dateTime).tz(timezone).format('MMM DD, YYYY');
  };

  const isOvernight = (start: Date | string, end: Date | string) => {
    return dayjs(end).isAfter(dayjs(start).add(12, 'hours'));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Shifts</h1>
          <p className="text-gray-600">Manage and assign shifts to staff</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => navigate('/shifts/new')}
        >
          Create New Shift
        </Button>
      </div>

      {/* Shifts Grid */}
      <Spin spinning={shifts.isLoading || shifts.isFetching}>
        {shifts.data?.data && shifts.data.data.length > 0 ? (
          <Row gutter={[16, 16]}>
            {shifts.data.data.map((shift: Shift) => {
              const locationTimezone = shift.location?.timeZone || 'UTC';
              const assignedCount = shift.assignments?.length || 0;
              const isFullyStaffed = assignedCount >= shift.requiredHeadcount;

              return (
                <Col xs={24} sm={24} md={12} lg={8} xl={6} key={shift.shiftId}>
                  <Card
                    className="h-full hover:shadow-lg transition-shadow"
                    actions={[
                      <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/shifts/edit/${shift.shiftId}`)}
                      >
                        Edit
                      </Button>,
                      <Button
                        type="link"
                        icon={<UserAddOutlined />}
                        onClick={() => handleAssignStaff(shift)}
                      >
                        Assign
                      </Button>,
                      shift.status === 'draft' && (
                        <Button
                          type="link"
                          icon={<CheckCircleOutlined />}
                          onClick={() => handlePublish(shift.shiftId, assignedCount)}
                          loading={publishResponse.isLoading}
                          disabled={assignedCount === 0}
                          title={assignedCount === 0 ? 'Assign staff before publishing' : 'Publish shift'}
                        >
                          Publish
                        </Button>
                      ),
                    ]}
                  >
                    {/* Status and Premium Badge */}
                    <div className="flex justify-between items-start mb-3">
                      <Tag color={getStatusColor(shift.status)} className="text-xs uppercase">
                        {shift.status}
                      </Tag>
                      {shift.isPremium && (
                        <Tag color="gold" icon={<TrophyOutlined />}>
                          Premium
                        </Tag>
                      )}
                    </div>

                    {/* Location */}
                    <div className="mb-2">
                      <Space>
                        <EnvironmentOutlined className="text-blue-500" />
                        <span className="font-semibold text-gray-800">
                          {shift.location?.name || 'Unknown Location'}
                        </span>
                      </Space>
                    </div>

                    {/* Skill */}
                    <div className="mb-3">
                      <Tag color="purple">{shift.skill?.name || 'Unknown Skill'}</Tag>
                    </div>

                    {/* Date */}
                    <div className="mb-2">
                      <Space>
                        <CalendarOutlined className="text-green-500" />
                        <span className="text-sm text-gray-700">
                          {formatDate(shift.startTimeUtc, locationTimezone)}
                        </span>
                      </Space>
                    </div>

                    {/* Time */}
                    <div className="mb-3">
                      <Space>
                        <ClockCircleOutlined className="text-orange-500" />
                        <span className="text-sm text-gray-700">
                          {formatTime(shift.startTimeUtc, locationTimezone)} -{' '}
                          {formatTime(shift.endTimeUtc, locationTimezone)}
                          {isOvernight(shift.startTimeUtc, shift.endTimeUtc) && (
                            <Tag color="orange" className="ml-2 text-xs">
                              Overnight
                            </Tag>
                          )}
                        </span>
                      </Space>
                    </div>

                    {/* Staffing */}
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <Space>
                        <TeamOutlined className={isFullyStaffed ? 'text-green-500' : 'text-orange-500'} />
                        <span className="text-sm font-medium">
                          {assignedCount} / {shift.requiredHeadcount} Staff
                        </span>
                        {isFullyStaffed && (
                          <Tag color="success" className="text-xs">
                            Fully Staffed
                          </Tag>
                        )}
                      </Space>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        ) : (
          <Card>
            <Empty
              description="No shifts found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/shifts/new')}
              >
                Create First Shift
              </Button>
            </Empty>
          </Card>
        )}
      </Spin>

      {/* Assign Staff Modal (Placeholder for future implementation) */}
      <Modal
        title={
          <Space>
            <UserAddOutlined />
            <span>Assign Staff to Shift</span>
          </Space>
        }
        open={assignModalVisible}
        onCancel={() => {
          setAssignModalVisible(false);
          setSelectedShift(null);
        }}
        footer={[
          <Button key="cancel" onClick={() => setAssignModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="assign"
            type="primary"
            disabled={selectedStaffIds.length === 0}
            onClick={handleAssignSelectedStaff}
            icon={<UserAddOutlined />}
          >
            Assign Selected Staff ({selectedStaffIds.length})
          </Button>,
        ]}
        width={900}
      >
        {selectedShift && (
          <div>
            <div className="mb-4 p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-2">Shift Details:</h3>
              <p><strong>Location:</strong> {selectedShift.location?.name}</p>
              <p><strong>Skill Required:</strong> {selectedShift.skill?.name}</p>
              <p>
                <strong>Time:</strong>{' '}
                {formatDate(selectedShift.startTimeUtc, selectedShift.location?.timeZone || 'UTC')}{' '}
                {formatTime(selectedShift.startTimeUtc, selectedShift.location?.timeZone || 'UTC')} -{' '}
                {formatTime(selectedShift.endTimeUtc, selectedShift.location?.timeZone || 'UTC')}
              </p>
              <p>
                <strong>Required Headcount:</strong> {selectedShift.requiredHeadcount}
              </p>
            </div>

            <h3 className="font-semibold mb-3">Available Staff (based on skill and location matches):</h3>

            <Spin spinning={users.isLoading || users.isFetching}>
              {users.data?.data && users.data.data.length > 0 ? (
                <Table
                  dataSource={users.data.data.filter((staff: any) => {
                    // Filter staff who have the required skill for this shift
                    return staff.skill?.skillId === selectedShift.skillId;
                  })}
                  rowKey="userId"
                  pagination={false}
                  scroll={{ y: 400 }}
                  rowSelection={{
                    type: 'checkbox',
                    selectedRowKeys: selectedStaffIds,
                    onChange: (selectedRowKeys: any) => {
                      setSelectedStaffIds(selectedRowKeys);
                    },
                  }}
                  columns={[
                    {
                      title: 'Name',
                      key: 'name',
                      render: (_, record: any) => (
                        <div>
                          <div className="font-medium">{record.firstName} {record.lastName}</div>
                          <div className="text-xs text-gray-500">{record.email}</div>
                        </div>
                      ),
                    },
                    {
                      title: 'Skill',
                      key: 'skill',
                      render: (_, record: any) => (
                        <Tag color="green">
                          {record.skill?.name}
                        </Tag>
                      ),
                    },
                  ]}
                />
              ) : (
                <Empty
                  description="No staff found with the required skill for this location"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Spin>
          </div>
        )}
      </Modal>
    </div>
  );
} 
