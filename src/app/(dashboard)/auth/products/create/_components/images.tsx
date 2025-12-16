import { Alert, Button, notification } from "antd";
import React, { useState } from "react";
import ImagePicker from "../../../../_components/picker2";
import VideoPicker from "../../../../_components/VideoPicker";
import { IoAddCircleOutline } from "react-icons/io5";
import { MdOutlineDeleteOutline } from "react-icons/md";

function ProductImages({
  back,
  onFinish,
  cover,
  moreImg,
  product_video,
}: {
  back: Function;
  onFinish: Function;
  cover: any;
  moreImg: any[];
  product_video?: any;
}) {
  const [coverImg, setCoverImg] = useState<any>(cover);
  const [images, setImages] = useState([...moreImg]);
  const [video, setVideo] = useState<File | any>(product_video || null);
  const [Notifications, contextHolder] = notification.useNotification();
  const handleImageChange = (file: any, id: any) => {
    setImages((prevImages) =>
      prevImages.map((image) =>
        image.id === id ? { ...image, file: file } : image
      )
    );
  };
  const removeImagePicker = (id: any) => {
    const index = images.findIndex((image) => image.id === id);
    if (index !== -1) {
      setImages((prevImages) => [
        ...prevImages.slice(0, index),
        ...prevImages.slice(index + 1),
      ]);
    }
  };
  const addImagePicker = () => {
    setImages([...images, { id: Date.now(), file: null }]);
  };
  return (
    <>
      {contextHolder}
      <Alert
        message="Follow below guid to reduce quality check failure"
        description={
          <ul>
            <li>
              Products must fill at least 85% of the image. Images must show
              only the product that is for sale, with few or no props
            </li>
            <li>
              Images may only contain text that is a part of the product. • Main
              images must have a pure white background, must be a photo (not a
              drawing), and must not contain excluded accessories.
            </li>
            <li>
              JPEG is the preferred image format, but you also may use TIFF and
              GIF files.
            </li>
          </ul>
        }
        type="warning"
        closable
      />
      <h5 className="mt-3">Product Cover image</h5>

      <div className="row">
        <div className="col-md-2" style={{ height: "180px" }}>
          <ImagePicker
            fileURL={coverImg?.url}
            height={"100%"}
            aspectRatio={1 / 1}
            onChange={(file) => {
              setCoverImg(file);
            }}
            crop
          />
        </div>
      </div>
      <hr />
      <div className="row gy-3">
        {images.map((image: any, index) => (
          <div
            key={image?.id}
            className="col-lg-2 d-flex flex-column position-relative"
            style={{ height: "180px" }}
          >
            <ImagePicker
              fileURL={image?.file?.url}
              height={"100%"}
              aspectRatio={1 / 1}
              onChange={(file) => handleImageChange(file, image.id)}
              crop
            />
            <Button
              size="small"
              className="ms-auto position-absolute"
              style={{ right: 0, top: "-5px" }}
              shape="circle"
              onClick={() => removeImagePicker(image.id)}
            >
              <MdOutlineDeleteOutline color="red" />
            </Button>
          </div>
        ))}
        <div className="col-md-2">
          <div
            className="d-flex  align-items-center justify-content-center h-100 py-5"
            style={{ border: "1.5px dashed darkgray" }}
          >
            <div
              className="d-flex flex-column align-items-center"
              onClick={() => addImagePicker()}
            >
              <IoAddCircleOutline size={40} className="text-primary" />
              <div className="text-primary">Add New</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Video Upload Section */}
      <hr className="my-4" />
      <h5 className="mb-3">Product Video (Optional)</h5>
      <Alert
        message="Video Guidelines"
        description={
          <ul style={{ marginBottom: 0 }}>
            <li>Videos help customers better understand your product</li>
            <li>Maximum file size: 50MB</li>
            <li>Recommended: 30-60 seconds duration</li>
            <li>Supported formats: MP4, MOV, AVI, WEBM</li>
          </ul>
        }
        type="info"
        closable
        className="mb-3"
      />
      <div className="row">
        <div className="col-md-8">
          <VideoPicker
            onChange={(file) => setVideo(file)}
            videoURL={video?.url}
                    maxSize={50}
          />
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-6"></div>
        <div className="col-md-2">
          <Button size="large" block onClick={() => back()}>
            Back
          </Button>
        </div>
        <div className="col-md-4">
          <Button
            type="primary"
            size="large"
            block
            onClick={() => {
              if (!coverImg?.file) {
                Notifications["error"]({
                  message: "No CoverImage is selected..",
                  description: "",
                });
                return;
              }
              onFinish(coverImg, images, video);
            }}
          >
            Continue{" "}
          </Button>
        </div>
      </div>
    </>
  );
}

export default ProductImages;
