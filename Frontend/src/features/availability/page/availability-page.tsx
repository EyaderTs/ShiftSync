import { Tabs, Card, Table, Button, Tag, Space, Empty } from "antd";
import { useContext, useEffect, useState } from "react";
import { PlusOutlined, EditOutlined, ClockCircleOutlined, CalendarOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useLazyGetAvailabilitiesQuery } from "../store/availability.query";
import { StaffAvailability } from "@/models/availability-model";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import AuthContext from "@/shared/auth/context/authContext";

dayjs.extend(utc);
dayjs.extend(timezone);

const { TabPane } = Tabs;

export default function AvailabilityPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [getAvailabilities, availabilities] = useLazyGetAvailabilitiesQuery();
  const [recurringData, setRecurringData] = useState<StaffAvailability[]>([]);
  const [exceptionData, setExceptionData] = useState<StaffAvailability[]>([]);

  useEffect(() => {
    if (user?.userId) {
      getAvailabilities({
        includes: ['location'],
        filter: [
          [
            {
              field: 'userId',
              operator: '=',
              value: user.userId,
            }
          ]
        ]
      });
    }
  }, [user?.userId]);

  useEffect(() => {
    if (availabilities.data?.data) {
      const recurring = availabilities.data.data.filter((a: StaffAvailability) => a.type === 'recurring');
      const exceptions = availabilities.data.data.filter((a: StaffAvailability) => a.type === 'exception');
      setRecurringData(recurring);
      setExceptionData(exceptions);
    }
  }, [availabilities.data]);

  const getDayName = (dayOfWeek?: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayOfWeek !== undefined ? days[dayOfWeek] : '';
  };

  const recurringColumns = [
    {
      title: 'Day of Week',
      dataIndex: 'dayOfWeek',
      key: 'dayOfWeek',
      render: (dayOfWeek: number) => (
        <Tag color="blue" className="text-sm px-3 py-1">
          {getDayName(dayOfWeek)}
        </Tag>
      ),
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time: string) => (
        <Space>
          <ClockCircleOutlined className="text-green-500" />
          <span className="font-medium">{time}</span>
        </Space>
      ),
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (time: string) => (
        <Space>
          <ClockCircleOutlined className="text-red-500" />
          <span className="font-medium">{time}</span>
        </Space>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (location: any) => location?.name || 'N/A',
    },
    {
      title: 'Status',
      key: 'status',
      render: () => (
        <Tag color="success">Active</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: StaffAvailability) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => navigate(`/availability/edit/${record.availabilityId}`)}
        >
          Edit
        </Button>
      ),
    },
  ];

  const exceptionColumns = [
    {
      title: 'Date',
      dataIndex: 'exceptionDate',
      key: 'exceptionDate',
      render: (date: Date) => (
        <Space>
          <CalendarOutlined className="text-blue-500" />
          <span className="font-medium">{dayjs(date).format('MMM DD, YYYY')}</span>
        </Space>
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes: string) => notes || '-',
    },
    {
      title: 'From',
      dataIndex: 'exceptionStartTimeUtc',
      key: 'exceptionStartTimeUtc',
      render: (time: Date, record: StaffAvailability) => {
        const locationTimezone = record.location?.timeZone || 'UTC';
        return (
          <Space>
            <ClockCircleOutlined className="text-green-500" />
            <span className="font-medium">{dayjs(time).tz(locationTimezone).format('hh:mm A')}</span>
          </Space>
        );
      },
    },
    {
      title: 'To',
      dataIndex: 'exceptionEndTimeUtc',
      key: 'exceptionEndTimeUtc',
      render: (time: Date, record: StaffAvailability) => {
        const locationTimezone = record.location?.timeZone || 'UTC';
        return (
          <Space>
            <ClockCircleOutlined className="text-red-500" />
            <span className="font-medium">{dayjs(time).tz(locationTimezone).format('hh:mm A')}</span>
          </Space>
        );
      },
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (location: any) => location?.name || 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: StaffAvailability) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => navigate(`/availability/edit/${record.availabilityId}`)}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6">
      <Card
        title={
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-1">Your Availability</h2>
              <p className="text-gray-500 text-sm font-normal">Set when you're available to work</p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => navigate('/availability/new')}
              className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
            >
              Add Availability
            </Button>
          </div>
        }
        bordered={false}
        className="shadow-sm"
      >
        <Tabs defaultActiveKey="1" size="large" className="availability-tabs">
          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <ClockCircleOutlined />
                Weekly Pattern
              </span>
            }
            key="1"
          >
            <div className="mb-4">
              <p className="text-gray-600 text-sm sm:text-base">
                Set your regular weekly availability. Check the box to indicate available days.
              </p>
            </div>
            <div className="overflow-x-auto">
              <Table
                columns={recurringColumns}
                dataSource={recurringData}
                rowKey="availabilityId"
                loading={availabilities.isLoading}
                pagination={false}
                scroll={{ x: 800 }}
                locale={{
                  emptyText: (
                    <Empty
                      description="No weekly availability set"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/availability/new')}
                      >
                        Add Weekly Availability
                      </Button>
                    </Empty>
                  ),
                }}
                className="modern-table"
              />
            </div>
          </TabPane>
          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <CalendarOutlined />
                One-Off Exceptions
              </span>
            }
            key="2"
          >
            <div className="mb-4">
              <p className="text-gray-600 text-sm sm:text-base">
                Temporary changes that override recurring availability (vacations, appointments, extra availability).
              </p>
            </div>
            <div className="overflow-x-auto">
              <Table
                columns={exceptionColumns}
                dataSource={exceptionData}
                rowKey="availabilityId"
                loading={availabilities.isLoading}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 900 }}
                locale={{
                  emptyText: (
                    <Empty
                      description="No exceptions set"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/availability/new')}
                      >
                        Add Exception
                      </Button>
                    </Empty>
                  ),
                }}
                className="modern-table"
              />
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}
