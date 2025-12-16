import API from "@/config/API";
import { POST } from "@/util/apicall";
import { useMutation } from "@tanstack/react-query";
import { Button, Form, Input, Modal, notification, Rate } from "antd";
import { useRouter } from "next/navigation";

type Props = {
  visible: boolean;
  onClose: () => void;
  pid: string | null;
};
export default function ReviewFormModal(props: Props) {
  //const
  const [form] = Form.useForm();
  const router = useRouter();
  const desc = ["terrible", "bad", "normal", "good", "wonderful"];
  const [Notifications, contextHolder] = notification.useNotification();

  //function
  const mutationCreate = useMutation({
    mutationFn: async (body: any) => {
      const obj = {
        product_id: props?.pid,
        ...body,
      };
      return POST(API.PRODUCT_REVIEW, obj);
    },
    retry: 2,
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      form.resetFields();
      props?.onClose();
      Notifications["success"]({
        message: `Review Added Successfully.`,
      });
      router.refresh();
    },
  });
  return (
    <Modal
      title={`Leave a review`}
      open={props?.visible}
      centered
      footer={false}
      onCancel={props?.onClose}
    >
      {contextHolder}
      <div>Your review will be posted publicly on the app</div>
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => mutationCreate.mutate(values)}
        initialValues={{ featured: false }}
      >
        <div>
          <Form.Item name={"rating"} rules={[{ required: true, message: "" }]}>
            <Rate tooltips={desc} value={0} style={{ fontSize: 40 }} />
          </Form.Item>
          <Form.Item name={"message"} rules={[{ required: true, message: "" }]}>
            <Input.TextArea
              placeholder="Enter your review here . . . "
              rows={4}
              name="message"
            />
          </Form.Item>
        </div>

        <div className="d-flex gap-2 justify-content-end">
          <Button onClick={props?.onClose}>Cancel</Button>
          <Button
            type="primary"
            onClick={form.submit}
            loading={mutationCreate.isPending}
          >
            Done
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
