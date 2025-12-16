import "./styles.scss";
import moment from "moment";
import Dropzone from "react-dropzone";
import { Button, message } from "antd";
import { FiInbox } from "react-icons/fi";
import { useRef, useState } from "react";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";

type CropperCanvasOptions = Parameters<
  NonNullable<ReactCropperElement["cropper"]>["getCroppedCanvas"]
>[0];

interface Props {
  onChange: (val: any) => void | any;
  fileURL: string;
  width?: string | number;
  height?: string | number;
  aspectRatio: number;
  outputWidth?: number;
  outputHeight?: number;
}
const ImagePicker = (props: Props) => {
  const fileInputRef = useRef(null);
  const cropperRef = useRef<ReactCropperElement>(null);
  const [cropperModalOpen, setCropperModalOpen] = useState<boolean>(false);
  const [image, setImage] = useState<any>();

  const handleDrop = (acceptedFiles: any) => {
    try {
      const maxFileSize = 3 * 1024 * 1024;
      var myFile = acceptedFiles[0];
      if (!myFile.type.startsWith("image/")) {
        message.error("Only image files are allowed.");
      } else {
        if (myFile.size > maxFileSize) {
          message.error("File size exceeded the 3MB limit.");
        } else {
          let name = moment(new Date()).unix();
          const myNewFile = new File([myFile], name + "G.png", {
            type: myFile.type,
          });
          const url = URL.createObjectURL(myNewFile);
          let obj = {
            file: myNewFile,
            url: url,
          };
          setImage(obj);
          setCropperModalOpen(true);
        }
      }
    } catch (err) {}
  };
  const handleCrop = async () => {
    if (cropperRef.current) {
      const canvasOptions: CropperCanvasOptions = {
        fillColor: "#ffffff",
      };
      if (props?.outputWidth && props?.outputHeight) {
        canvasOptions.width = props.outputWidth;
        canvasOptions.height = props.outputHeight;
      }
      const canvas: HTMLCanvasElement | null =
        cropperRef.current.cropper.getCroppedCanvas(canvasOptions);
      if (canvas) {
        const croppedData = canvas.toDataURL("image/jpeg");
        const ImageBlob = await fetch(croppedData).then((r) => r.blob());
        let name = moment(new Date()).unix();
        let file = new File([ImageBlob], name + "N.jpg");
        const url = URL.createObjectURL(file);
        let obj = {
          file: file,
          url: url,
        };
        props?.onChange(obj);
        setCropperModalOpen(false);
      }
    }
  };
  return (
    <div
      style={{ width: props?.width || "100%", height: props?.height || "100%" }}
    >
      {cropperModalOpen ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const selectedFile = e?.target?.files?.[0];
              if (selectedFile) {
                setImage({
                  file: selectedFile,
                  url: URL.createObjectURL(selectedFile),
                });
                setCropperModalOpen(true);
              }
            }}
          />
          <Cropper
            ref={cropperRef as React.RefObject<ReactCropperElement>}
            src={image?.url}
            style={{
              height: props?.height || 400,
              width: props?.width || "100%",
            }}
            aspectRatio={props?.aspectRatio}
            guides={true}
          />
          <div
            className="ImagePicker-Box4"
            style={{ position: "relative", top: -32 }}
          >
            <Button
              style={{ marginRight: 10 }}
              size="small"
              onClick={() => {
                if (fileInputRef.current) {
                  (fileInputRef.current as any).click();
                }
              }}
            >
              Change
            </Button>
            <Button type="primary" onClick={handleCrop} size="small">
              Crop
            </Button>
          </div>
        </div>
      ) : (
        <Dropzone onDrop={handleDrop}>
          {({ getRootProps, getInputProps }) => (
            <section className="ImagePicker-Box2">
              <div
                {...getRootProps({
                  className: "ImagePicker-Box",
                })}
              >
                <input {...getInputProps()} />
                <div className="ImagePicker-Box3">
                  {props?.fileURL ? (
                    <img
                      src={props?.fileURL}
                      style={{
                        objectFit: "contain",
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  ) : (
                    <>
                      <FiInbox size={30} />
                      <div className="ImagePicker-txt1">
                        Click or drag Image to this area to upload
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>
          )}
        </Dropzone>
      )}
    </div>
  );
};
export default ImagePicker;
