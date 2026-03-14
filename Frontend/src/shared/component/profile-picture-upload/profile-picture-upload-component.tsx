import { useState } from "react";

import { Avatar, Button, Modal, Typography, Upload, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { type RcFile, type UploadFile } from "antd/es/upload";
import ImgCrop from "antd-img-crop";

import { FaUser, FaPencilAlt } from "react-icons/fa";
import { CiImageOn } from "react-icons/ci";

const { Text } = Typography;

interface Props {
  mode: "new" | "detail";
  src: string | undefined;
  uid: number;
  autoUpload?:boolean;
  onImageUpload?:(image:any)=>any
  onUpload?: (url: string) => any;
}

export default function ProfilePicture({ mode, src,autoUpload=true, uid,onImageUpload, onUpload }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageBlob, setImageBlob] = useState<RcFile | undefined>(undefined);

  const [isSaving, setIsSaving] = useState(false);

  const beforeCrop = (file: RcFile) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }

    const isLessThan2MB = file.size / 1024 / 1024 < 2;
    if (!isLessThan2MB) {
      message.error("Image must smaller than 2MB!");
    }

    return isJpgOrPng && isLessThan2MB;
  };

  const beforeUpload = (file: RcFile) => {
    setFileList([
      {
        uid: file.uid,
        name: file.name,
        status: "done",
        url: URL.createObjectURL(file),
        thumbUrl: URL.createObjectURL(file),
      },
    ]);
    setImageBlob(file);

    return false;
  };

  const handleSave = async () => {
    setIsSaving(true);
    onImageUpload?.(imageBlob);
    
    if(autoUpload){
      try {
        // const url = await uploadImageByUri(imageBlob, uid, "profile_picture");
  
        // const res = await onUpload(url);
  
        // if (mode === "detail" && res.error) {
        //   throw new Error();
        // }
  
        // message.success("Image uploaded successfully");
        handleClose();
      } catch (err) {
        message.error("Error uploading image");
      } finally {
        setIsSaving(false);
      }
    }
    setIsSaving(false)
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative">
        <Avatar
          size={autoUpload?120:75}
          src={src}
          icon={autoUpload?<FaUser className="mx-auto h-full" />:<CiImageOn className="mx-auto h-full"/>}
        />
        <Button
          className="absolute bottom-2 -left-4 bg-gray-50 text-gray-950 border border-solid border-gray-300 hover:bg-white"
          htmlType="button"
          icon={<FaPencilAlt />}
          size="small"
          shape="round"
          type="primary"
          onClick={() => setIsOpen(true)}
        >
          {mode === "new" ? "Add" : "Edit"}
        </Button>
      </div>
      <Modal
        centered
        confirmLoading={isSaving}
        okText="Save"
        open={isOpen}
        onCancel={handleClose}
        okButtonProps={{
          className: "bg-primary",
        }}
        onOk={handleSave}
      >
        <ImgCrop
          beforeCrop={beforeCrop}
          modalProps={{
            okButtonProps: {
              className: "bg-primary",
            },
          }}
          modalOk="Crop"
        >
          <Upload
            beforeUpload={beforeUpload}
            className="mx-auto block w-max"
            fileList={fileList}
            listType="picture-circle"
            maxCount={1}
            showUploadList={{
              showPreviewIcon: false,
            }}
            onRemove={() => setFileList([])}
          >
            {fileList.length === 1 ? null : (
              <PlusOutlined className="text-xl" />
            )}
          </Upload>
        </ImgCrop>
        <Text className="block text-center">Click to upload image</Text>
      </Modal>
    </>
  );
}
