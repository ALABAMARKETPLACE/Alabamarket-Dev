import "./style.scss";
import moment from "moment";
import Dropzone from "react-dropzone";
import { message, Modal } from "antd";
import { FiInbox } from "react-icons/fi";
import Cropper, { ReactCropperElement } from "react-cropper";
import { useState, useRef } from "react";
import "cropperjs/dist/cropper.css";

interface response {
  file: File;
  url: string;
}
interface Props {
  onChange: (val: response) => void;
  fileURL: string;
  width?: string | number;
  height?: string | number;
  aspectRatio?: number;
  disabled?: boolean;
  size?: "small" | "large" | "medium";
  crop?: boolean;
}

const ImagePicker2 = ({
  onChange,
  fileURL,
  width = "100%",
  height = "100%",
  aspectRatio = 1 / 1,
  disabled = false,
  crop = false,
  size = "medium",
}: Props) => {
  const [visible, setVisible] = useState(false); // Modal visibility state
  const [cropImage, setCropImage] = useState<{
    file: File | null;
    url: string | undefined;
  }>({
    file: null,
    url: undefined,
  }); // Temp image for cropping
  const cropperRef = useRef<ReactCropperElement>(null); // Ref for the cropper

  const handleDrop = (acceptedFiles: any) => {
    try {
      const maxFileSize = 3 * 1024 * 1024;
      var myFile = acceptedFiles?.[0];
      if (!myFile.type.startsWith("image/")) {
        message.error("Only image files are allowed.");
      } else {
        if (myFile.size > maxFileSize) {
          message.error("File size exceeded the 3MB limit.");
        } else {
          const url = URL.createObjectURL(myFile);
          if (crop) {
            setCropImage({ url: url, file: myFile }); // Open the modal with the image to crop
            setVisible(true); // Show the modal
            return;
          }
          const originalExtension = myFile?.name?.substring(
            myFile?.name?.lastIndexOf(".")
          );
          const myNewFile = new File(
            [myFile],
            myFile?.name + (originalExtension || ".jpeg"),
            {
              type: myFile.type,
            }
          );
          onChange({ file: myNewFile, url: url });
        }
      }
    } catch (err) {}
  };

  const onCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const originalMimeType = cropImage?.file?.type;
      const originalFileName = cropImage?.file?.name;
      const originalExtension = originalFileName?.substring(
        originalFileName.lastIndexOf(".")
      );
      cropper.getCroppedCanvas().toBlob((blob) => {
        if (blob) {
          let name = moment(new Date()).unix();
          const myNewFile = new File(
            [blob],
            name + (originalExtension || ".jpeg"),
            {
              type: originalMimeType,
            }
          );
          const url = URL.createObjectURL(myNewFile);
          let obj = {
            file: myNewFile,
            url: url,
          };
          onChange(obj); // Pass the cropped image back
          setVisible(false); // Close the modal
        }
      });
    }
  };

  return (
    <div style={{ width, height }}>
      <Dropzone onDrop={handleDrop} disabled={disabled}>
        {({ getRootProps, getInputProps }) => (
          <section className="h-100 w-100">
            <div
              {...getRootProps({
                className: "ImagePicker-Box w-100 h-100",
              })}
            >
              <input {...getInputProps()} />
              <div
                className="ImagePicker-Box3 h-100 d-flex p-1 flex-column 
              justify-content-center align-items-center cursor-pointer"
              >
                {fileURL ? (
                  <img
                    src={fileURL}
                    style={{
                      objectFit: "contain",
                      width: "auto",
                      maxWidth: "100%",
                      height: "auto",
                      maxHeight: "100%",
                    }}
                  />
                ) : (
                  <>
                    <FiInbox size={size == "small" ? 25 : 30} />
                    {size == "small" ? null : (
                      <span className="text-center">
                        Click or drag Image to this area to upload
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </section>
        )}
      </Dropzone>

      {/* Modal for cropping */}
      <Modal
        visible={visible}
        title="Crop Image"
        onCancel={() => setVisible(false)}
        onOk={onCrop}
        okText="Crop"
        cancelText="Cancel"
        width={800}
      >
        {cropImage && (
          <Cropper
            src={cropImage?.url}
            style={{ height: 400, width: "100%" }}
            aspectRatio={aspectRatio}
            viewMode={1}
            guides={true}
            autoCropArea={1}
            minContainerWidth={400} // Set to ensure the container's width fits the image
            minContainerHeight={400} // Adjust based on the desired height
            background={false} // Disable the grid background if desired
            ref={cropperRef}
          />
        )}
        <br />
      </Modal>
    </div>
  );
};

export default ImagePicker2;
