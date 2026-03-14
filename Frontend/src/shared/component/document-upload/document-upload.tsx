// import { Button, Form, Input, Select, Spin } from "antd";
// import * as yup from "yup";
// import { useForm, Controller } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import InputWrapper from "../input-wrapper/input-wrapper";
// import { SaveOutlined, InboxOutlined } from "@ant-design/icons";
// import { useParams } from "react-router-dom";
// import { useEffect } from "react";
// import Dragger from "antd/es/upload/Dragger";
// import { useLazyGetDocumentTypesQuery } from "../../../features/document-type/store/document-type.query";
// import { DocumentType } from "../../../models/document-type.model";

// interface Document {
//   document_name: string;
//   document_reference?: string;
//   documenttypeid: string;
//   document?: any;
// }

// interface Props {
//   data?: any;
//   editMode: "detail" | "new";
//   loading?: boolean;
//   type?: string;
//   documentType?: string;
//   createLoading?: boolean;
//   deleteLoading?: boolean;
//   editLoading?: boolean;
//   onUpload?: (data: Document) => void;
//   onEdit?: (data: Document) => void;
// }

// const defaultValue: Document = {
//   documenttypeid: "",
//   document_name: "",
//   document_reference: "",
//   document: undefined,
// };

// export default function DocumentUpload(props: Props) {
//   const params = useParams();

//   const {
//     data,
//     editMode,
//     type,
//     documentType,
//     loading = false,
//     deleteLoading,
//     editLoading,
//     createLoading,
//     onUpload,
//     onEdit,
//   } = props;

//   const schema = yup
//     .object<Document>({
//       documenttypeid: yup.string().required("Document Type is required"),
//       document_name: yup.string().required("Document Name is required"),
//       document_reference: yup.string(),
//       document: yup.mixed().required("Document is required"),
//     })
//     .required();

//   const {
//     register,
//     control,
//     handleSubmit,
//     getValues,
//     watch,
//     formState: { errors, isValid },
//     reset,
//     setValue,
//   } = useForm<any>({
//     defaultValues: defaultValue,
//     resolver: yupResolver(schema),
//     mode: "all",
//   });

//   const [getDocumentTypes, documentTypes] = useLazyGetDocumentTypesQuery();

//   function submit(data: Document) {
//     if (editMode === "new") {
//       onUpload?.(data);
//       reset(defaultValue);
//     } else {
//       onEdit?.(data);
//       reset(defaultValue);
//     }
//   }

//   const onError = (error: any) => {
//     console.log("Error", error);
//   };

//   useEffect(() => {
//     if (documentType) {
//       getDocumentTypes({
//         skip: 0,
//         filter: [[{ field: documentType, value: true, operator: "=" }]],
//       });
//     } else {
//       getDocumentTypes({ skip: 0 });
//     }
//   }, []);

//   useEffect(() => {
//     if (editMode === "detail" && data) {
//       reset({
//         documenttypeid: data?.document?.documenttypeid,
//         document_name: data?.document?.file?.url,
//       });
//     } else {
//       reset(defaultValue);
//     }
//   }, [editMode, data]);

//   return (
//     <Spin spinning={loading || documentTypes?.isLoading}>
//       <div className="w-full flex justify-center">
//         <Form
//           name="document upload form"
//           labelCol={{ span: 8 }}
//           wrapperCol={{ span: 16 }}
//           initialValues={{ remember: true }}
//           onFinish={handleSubmit(submit, onError)}
//           autoComplete="off"
//           className="w-full"
//         >
//           <div className="w-full">
//             <div className="space-y-4">
//               <Controller
//                 name="documenttypeid"
//                 control={control}
//                 render={({ field }) => (
//                   <InputWrapper
//                     label="Document Type"
//                     required
//                     error={errors?.documenttypeid?.message}
//                   >
//                     <Select
//                       showSearch
//                       className="w-full"
//                       status={errors?.documenttypeid ? "error" : ""}
//                       {...field}
//                       options={documentTypes?.data?.data?.map(
//                         (item: DocumentType) => ({
//                           label: `${item.code ? `(${item.code})` : ""} ${
//                             item.document_type_name
//                           } `,
//                           value: item.documenttypeid,
//                         })
//                       )}
//                     />
//                   </InputWrapper>
//                 )}
//               />
//               <Controller
//                 name="document_reference"
//                 control={control}
//                 render={({ field }) => (
//                   <InputWrapper
//                     label="Document Reference"
//                     error={errors?.document_reference?.message}
//                   >
//                     <Input
//                       className="w-full"
//                       status={errors?.document_reference ? "error" : ""}
//                       {...field}
//                     />
//                   </InputWrapper>
//                 )}
//               />

//               <div className="flex justify-center w-full mb-4">
//                 <div className="w-full">
//                   <Controller
//                     name="document"
//                     control={control}
//                     render={({ field }) => (
//                       <InputWrapper error={`${errors?.document?.message}`}>
//                         <Dragger
//                           maxCount={1}
//                           className="w-full"
//                           onChange={(info) => {
//                             setValue("document_name", info?.file?.name);
//                             setValue("document", info?.file.originFileObj);
//                           }}
//                         >
//                           <p className="ant-upload-drag-icon">
//                             <InboxOutlined />
//                           </p>
//                           <p className="ant-upload-text">
//                             Click or drag file to this area to upload
//                           </p>
//                         </Dragger>
//                       </InputWrapper>
//                     )}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="w-full flex space-x-2  justify-end mt-4">
//             <Form.Item>
//               <Button
//                 type="primary"
//                 className="bg-primary shadow-none rounded flex items-center"
//                 htmlType="submit"
//                 loading={editMode === "new" ? createLoading : editLoading}
//                 icon={<SaveOutlined />}
//               >
//                 {editMode === "new" ? "Save" : "Update"}
//               </Button>
//             </Form.Item>
//           </div>
//         </Form>
//       </div>
//     </Spin>
//   );
// }
